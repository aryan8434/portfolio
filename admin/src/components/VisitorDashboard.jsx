import React, { useEffect, useMemo, useState } from "react";

const VISIT_API_URL =
  import.meta.env.VITE_VISIT_API_URL || "http://localhost:8787";

const formatTime = (value) => {
  if (!value) return "—";
  if (typeof value?.toDate === "function") return value.toDate().toLocaleString();
  if (value?._seconds) return new Date(value._seconds * 1000).toLocaleString();

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString();
};

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (value?._seconds) return value._seconds * 1000;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const placeOf = (visit) =>
  [visit.city, visit.region, visit.country].filter(Boolean).join(", ") || null;

const NETWORK_STYLE = {
  corporate: { bg: "rgba(52,211,153,0.14)", fg: "#6ee7b7", label: "Corporate / org" },
  consumer: { bg: "rgba(148,163,184,0.14)", fg: "#cbd5e1", label: "Home ISP" },
  hosting: { bg: "rgba(251,191,36,0.14)", fg: "#fcd34d", label: "Cloud / VPN" },
  local: { bg: "rgba(148,163,184,0.1)", fg: "#94a3b8", label: "Local" },
  unknown: { bg: "rgba(148,163,184,0.1)", fg: "#94a3b8", label: "Unknown" },
};

/**
 * A visit is "interesting" when it comes from a named organisation network
 * rather than home broadband, or lands via LinkedIn / a job board. It's a
 * heuristic, not proof — treat it as a shortlist, not a verdict.
 */
const isLikelyRecruiter = (visit) =>
  !visit.isBot &&
  (visit.networkType === "corporate" ||
    ["LinkedIn", "Job board", "Email"].includes(visit.referrerLabel));

export default function VisitorDashboard() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("all"); // all | recruiters | located | bots
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");

    const controller = new AbortController();

    const loadVisits = async () => {
      try {
        const response = await fetch(`${VISIT_API_URL}/api/visits`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const message = await response
            .text()
            .catch(() => "Failed to load visitor records.");
          throw new Error(message || "Failed to load visitor records.");
        }

        const data = await response.json();
        setVisits(Array.isArray(data?.visits) ? data.visits : []);
        setLoading(false);
      } catch (loadError) {
        if (loadError?.name === "AbortError") return;
        const isNetworkError =
          loadError?.message?.includes("Failed to fetch") ||
          loadError?.message?.includes("ERR_CONNECTION_REFUSED");
        setError(
          isNetworkError
            ? "Local visitor API is not running. Put your service-account JSON in admin/service-account.json, then run npm run dev inside admin to start both the API and the dashboard."
            : loadError?.message ||
                "Failed to load visitor records from the local API.",
        );
        setLoading(false);
      }
    };

    loadVisits();
    return () => controller.abort();
  }, [refreshKey]);

  const stats = useMemo(() => {
    const real = visits.filter((v) => !v.isBot);
    const uniqueIps = new Set(real.map((v) => v.ipAddress).filter(Boolean));
    const places = new Set(real.map(placeOf).filter(Boolean));
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const countryTally = {};
    real.forEach((v) => {
      if (v.country) countryTally[v.country] = (countryTally[v.country] || 0) + 1;
    });
    const topCountry =
      Object.entries(countryTally).sort((a, b) => b[1] - a[1])[0] || null;

    return {
      total: visits.length,
      uniqueIps: uniqueIps.size,
      places: places.size,
      recruiters: real.filter(isLikelyRecruiter).length,
      preciseAllowed: real.filter((v) => v.locationStatus === "granted").length,
      last24h: real.filter((v) => toMillis(v.visitedAt) > dayAgo).length,
      topCountry: topCountry ? `${topCountry[0]} (${topCountry[1]})` : "—",
      latest: visits[0] || null,
    };
  }, [visits]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return visits.filter((visit) => {
      if (view === "recruiters" && !isLikelyRecruiter(visit)) return false;
      if (view === "located" && visit.locationStatus !== "granted") return false;
      if (view === "bots" && !visit.isBot) return false;
      if (view === "all" && visit.isBot) return false;
      if (!q) return true;

      return [
        visit.ipAddress,
        placeOf(visit),
        visit.org,
        visit.isp,
        visit.referrerLabel,
        visit.referrer,
        visit.browser,
        visit.os,
        visit.campaign,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [visits, query, view]);

  const views = [
    { id: "all", label: "All humans" },
    { id: "recruiters", label: `Likely recruiters (${stats.recruiters})` },
    { id: "located", label: `Precise location (${stats.preciseAllowed})` },
    { id: "bots", label: "Bots & crawlers" },
  ];

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>Firestore admin</div>
          <h2 style={styles.title}>Visitor database</h2>
          <p style={styles.subtitle}>
            Every pageview with its IP, the city and network that IP belongs to,
            device, and where the visit came from. Precise coordinates appear
            only for visitors who accepted the browser location prompt.
          </p>
        </div>
        <button style={styles.refresh} onClick={() => setRefreshKey((k) => k + 1)}>
          ↻ Refresh
        </button>
      </div>

      <div style={styles.statsGrid}>
        <StatCard label="Total visits" value={stats.total} />
        <StatCard label="Last 24 hours" value={stats.last24h} />
        <StatCard label="Unique IPs" value={stats.uniqueIps} />
        <StatCard label="Likely recruiters" value={stats.recruiters} accent />
        <StatCard label="Distinct places" value={stats.places} />
        <StatCard label="Top country" value={stats.topCountry} />
        <StatCard label="Precise location" value={stats.preciseAllowed} />
        <StatCard label="Latest visit" value={formatTime(stats.latest?.visitedAt)} />
      </div>

      <div style={styles.toolbar}>
        <div style={styles.viewTabs}>
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                ...styles.viewTab,
                ...(view === v.id ? styles.viewTabActive : null),
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <input
          style={styles.search}
          placeholder="Search IP, city, company, referrer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading && <div style={styles.emptyState}>Loading visitor records...</div>}
      {!loading && !error && !filtered.length && (
        <div style={styles.emptyState}>
          {visits.length
            ? "No visits match this filter."
            : "No visits recorded yet."}
        </div>
      )}

      {!loading && !error && !!filtered.length && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Network</th>
                <th style={styles.th}>IP</th>
                <th style={styles.th}>Device</th>
                <th style={styles.th}>Came from</th>
                <th style={styles.th}>Precise</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((visit) => {
                const net =
                  NETWORK_STYLE[visit.networkType] || NETWORK_STYLE.unknown;
                const place = placeOf(visit);
                const hasCoords =
                  visit.latitude != null && visit.longitude != null;

                return (
                  <tr key={visit.id} style={styles.row}>
                    <td style={styles.td}>
                      {formatTime(visit.visitedAt)}
                      {isLikelyRecruiter(visit) && (
                        <div style={styles.recruiterTag}>◆ worth a look</div>
                      )}
                    </td>

                    <td style={styles.td}>
                      {place ? (
                        <>
                          <div style={styles.primaryCell}>
                            {visit.flag ? `${visit.flag} ` : ""}
                            {visit.city || visit.region || visit.country}
                          </div>
                          <div style={styles.mutedCell}>{place}</div>
                        </>
                      ) : (
                        <span style={styles.mutedCell}>unresolved</span>
                      )}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.pill,
                          background: net.bg,
                          color: net.fg,
                        }}
                      >
                        {net.label}
                      </span>
                      {(visit.org || visit.isp) && (
                        <div style={styles.mutedCell}>
                          {visit.org || visit.isp}
                        </div>
                      )}
                    </td>

                    <td style={{ ...styles.td, fontFamily: "monospace" }}>
                      {visit.ipAddress || "unknown"}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.primaryCell}>
                        {visit.browser || "unknown"}
                      </div>
                      <div style={styles.mutedCell}>
                        {[visit.os, visit.device].filter(Boolean).join(" · ")}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.primaryCell}>
                        {visit.referrerLabel || "Direct"}
                      </div>
                      {visit.campaign && (
                        <div style={styles.mutedCell}>{visit.campaign}</div>
                      )}
                    </td>

                    <td style={styles.td}>
                      {hasCoords ? (
                        <a
                          style={styles.mapLink}
                          href={`https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on map ↗
                        </a>
                      ) : (
                        <span style={styles.mutedCell}>
                          {visit.locationStatus === "denied"
                            ? "denied"
                            : visit.locationStatus || "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p style={styles.footnote}>
        &ldquo;Likely recruiters&rdquo; is a heuristic: the IP belongs to a named
        organisation rather than a consumer ISP, or the visit arrived from
        LinkedIn, a job board, or an email link. Treat it as a shortlist to
        review, not a confirmed identity.
      </p>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        ...styles.statCard,
        ...(accent
          ? {
              borderColor: "rgba(52,211,153,0.35)",
              background:
                "linear-gradient(160deg, rgba(52,211,153,0.12), rgba(15,23,42,0.8))",
            }
          : null),
      }}
    >
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

const styles = {
  dashboard: {
    minHeight: "100vh",
    padding: 24,
    background: "linear-gradient(180deg, #081120 0%, #0f172a 100%)",
    color: "#e2e8f0",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  badge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(96,165,250,0.12)",
    color: "#bfdbfe",
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: { margin: 0, fontSize: "clamp(1.8rem, 3vw, 3rem)" },
  subtitle: {
    margin: "10px 0 0",
    maxWidth: 720,
    color: "rgba(226,232,240,0.78)",
    lineHeight: 1.6,
  },
  refresh: {
    flexShrink: 0,
    padding: "10px 16px",
    borderRadius: 999,
    cursor: "pointer",
    color: "#e2e8f0",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(148,163,184,0.24)",
    fontSize: 13,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    borderRadius: 18,
    padding: 18,
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(148,163,184,0.16)",
    boxShadow: "0 18px 40px rgba(2,6,23,0.28)",
  },
  statLabel: {
    color: "rgba(226,232,240,0.72)",
    fontSize: 13,
    marginBottom: 12,
  },
  statValue: {
    fontSize: "clamp(1rem, 2vw, 1.5rem)",
    fontWeight: 700,
    wordBreak: "break-word",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  viewTabs: { display: "flex", flexWrap: "wrap", gap: 8 },
  viewTab: {
    padding: "9px 15px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 13,
    color: "rgba(226,232,240,0.72)",
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(148,163,184,0.16)",
  },
  viewTabActive: {
    color: "#0f172a",
    background: "#93c5fd",
    borderColor: "transparent",
    fontWeight: 600,
  },
  search: {
    flex: "1 1 260px",
    maxWidth: 380,
    padding: "10px 14px",
    borderRadius: 12,
    color: "#e2e8f0",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(148,163,184,0.2)",
    outline: "none",
    fontSize: 13,
  },
  errorBox: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(248,113,113,0.3)",
    background: "rgba(127,29,29,0.18)",
    color: "#fecaca",
  },
  emptyState: {
    padding: 18,
    borderRadius: 14,
    background: "rgba(15,23,42,0.68)",
    border: "1px solid rgba(148,163,184,0.16)",
    color: "rgba(226,232,240,0.76)",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.16)",
    background: "rgba(15,23,42,0.72)",
  },
  table: { width: "100%", minWidth: 1040, borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: 14,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(241,245,249,0.82)",
    background: "rgba(15,23,42,0.96)",
    borderBottom: "1px solid rgba(148,163,184,0.12)",
    position: "sticky",
    top: 0,
  },
  row: { borderTop: "1px solid rgba(148,163,184,0.1)" },
  td: {
    padding: 14,
    verticalAlign: "top",
    fontSize: 13.5,
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(148,163,184,0.08)",
  },
  primaryCell: { fontWeight: 500 },
  mutedCell: {
    marginTop: 3,
    fontSize: 12,
    color: "rgba(226,232,240,0.55)",
  },
  pill: {
    display: "inline-flex",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 600,
  },
  recruiterTag: {
    marginTop: 5,
    fontSize: 11.5,
    fontWeight: 600,
    color: "#6ee7b7",
  },
  mapLink: { color: "#93c5fd", textDecoration: "none", fontSize: 13 },
  footnote: {
    marginTop: 16,
    maxWidth: 780,
    fontSize: 12.5,
    lineHeight: 1.6,
    color: "rgba(226,232,240,0.5)",
  },
};
