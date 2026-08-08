import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";
import { lookupIp, parseUserAgent, describeReferrer } from "./lib/enrich.js";

const localCredentialCandidates = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  path.resolve(process.cwd(), "service-account.json"),
  path.resolve(process.cwd(), "firebase-service-account.json"),
].filter(Boolean);

const credentialPath = localCredentialCandidates.find((candidate) =>
  fs.existsSync(candidate),
);

if (!credentialPath) {
  throw new Error(
    "Firebase admin credential file not found. Put your downloaded service-account JSON in admin/service-account.json, or set GOOGLE_APPLICATION_CREDENTIALS to its full path.",
  );
}

const serviceAccount = JSON.parse(fs.readFileSync(credentialPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const app = express();
const port = Number(process.env.ADMIN_API_PORT || 8787);

/** The number shown to the very first visitor on the public footer strip. */
const VISITOR_NUMBER_BASE = 345;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/visit", async (request, response) => {
  try {
    const body = request.body || {};
    const forwardedFor = request.headers["x-forwarded-for"];
    const requestIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0].trim()
        : request.ip;

    const ipAddress = body.ipAddress || requestIp || "unknown";
    const userAgent = body.userAgent || request.get("user-agent") || "unknown";

    // Resolve the IP into a place and a network owner. Never let a slow or
    // failing lookup cost us the visit record itself.
    const geo = await lookupIp(ipAddress).catch(() => ({}));
    const client = parseUserAgent(userAgent);

    const doc = await db.collection("portfolio_visits").add({
      ipAddress,
      userAgent,

      // IP-derived location + network
      city: geo.city ?? null,
      region: geo.region ?? null,
      country: geo.country ?? null,
      countryCode: geo.countryCode ?? null,
      flag: geo.flag ?? null,
      ipLatitude: geo.ipLatitude ?? null,
      ipLongitude: geo.ipLongitude ?? null,
      ipTimezone: geo.ipTimezone ?? null,
      isp: geo.isp ?? null,
      org: geo.org ?? null,
      asn: geo.asn ?? null,
      networkType: geo.networkType ?? "unknown",
      geoSource: geo.geoSource ?? "none",

      // Precise browser location — only present when the visitor allowed it
      locationId: body.locationId || "location unavailable",
      locationStatus: body.locationStatus || "pending",
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      accuracy: body.accuracy ?? null,

      // Client
      browser: client.browser,
      os: client.os,
      device: client.device,
      isBot: client.isBot,
      language: body.language || null,
      timezone: body.timezone || null,
      screenSize: body.screenSize || "unknown",

      // Acquisition
      pagePath: body.pagePath || "/",
      referrer: body.referrer || "direct",
      referrerLabel: describeReferrer(body.referrer),
      campaign: body.campaign || null,
      sessionId: body.sessionId || null,

      source: "portfolio",
      visitedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Public-facing visitor number for the footer strip. The portfolio shows
    // its first visitor as #345, so the stored total is offset to match.
    // A failed aggregation must not cost us the visit record — the client
    // falls back to a local number when this is absent.
    let visitorNo = null;
    try {
      const snapshot = await db.collection("portfolio_visits").count().get();
      const total = snapshot.data().count;
      if (Number.isFinite(total) && total > 0) {
        visitorNo = VISITOR_NUMBER_BASE - 1 + total;
      }
    } catch (countError) {
      console.warn("Visitor count unavailable:", countError?.message);
    }

    response.json({ ok: true, id: doc.id, visitorNo });
  } catch (error) {
    console.error("Failed to store visit:", error);
    response.status(500).json({
      ok: false,
      error: error?.message || "Failed to store visit",
    });
  }
});

/**
 * Precise location arrives later than the pageview — the browser only hands
 * over coordinates after the visitor accepts the permission prompt, so the
 * visit is recorded first and patched here if and when they allow it.
 */
app.patch("/api/visit/:id", async (request, response) => {
  try {
    const body = request.body || {};
    const update = {
      locationStatus: body.locationStatus || "unavailable",
      locationId: body.locationId || "location unavailable",
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      accuracy: body.accuracy ?? null,
      locationResolvedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("portfolio_visits").doc(request.params.id).update(update);
    response.json({ ok: true });
  } catch (error) {
    console.error("Failed to update visit location:", error);
    response.status(500).json({
      ok: false,
      error: error?.message || "Failed to update visit location",
    });
  }
});

app.get("/api/visits", async (_request, response) => {
  try {
    const snapshot = await db
      .collection("portfolio_visits")
      .orderBy("visitedAt", "desc")
      .limit(200)
      .get();

    response.json({
      visits: snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      })),
    });
  } catch (error) {
    console.error("Failed to read visits:", error);
    response.status(500).json({
      ok: false,
      error: error?.message || "Failed to read visits",
    });
  }
});

app.listen(port, () => {
  console.log(`Visitor API listening on http://localhost:${port}`);
});
