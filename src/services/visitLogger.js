const VISIT_API_URL =
  import.meta.env.VITE_VISIT_API_URL || "http://localhost:8787";

const getVisitorIp = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (!response.ok) return "unknown";

    const data = await response.json();
    return typeof data?.ip === "string" && data.ip.trim()
      ? data.ip.trim()
      : "unknown";
  } catch {
    return "unknown";
  }
};

/** Stable per-tab id so repeat pageviews in one sitting can be grouped. */
const getSessionId = () => {
  try {
    let id = sessionStorage.getItem("visit_session");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("visit_session", id);
    }
    return id;
  } catch {
    return null;
  }
};

const getCampaign = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const parts = ["utm_source", "utm_medium", "utm_campaign"]
      .map((key) => params.get(key))
      .filter(Boolean);
    return parts.length ? parts.join(" / ") : null;
  } catch {
    return null;
  }
};

/**
 * Precise location needs the visitor to accept a browser prompt, which can
 * take a while or never happen. Resolved separately so the pageview itself
 * is never held hostage to it.
 */
const requestPreciseLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: null,
        longitude: null,
        accuracy: null,
        locationId: "location unavailable",
        locationStatus: "unavailable",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          latitude,
          longitude,
          accuracy: accuracy ?? null,
          locationId: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          locationStatus: "granted",
        });
      },
      (error) => {
        const denied = error?.code === 1;
        resolve({
          latitude: null,
          longitude: null,
          accuracy: null,
          locationId: denied ? "location denied" : "location unavailable",
          locationStatus: denied ? "denied" : "unavailable",
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });

export const logPortfolioVisit = async () => {
  const ipAddress = await getVisitorIp();

  const response = await fetch(`${VISIT_API_URL}/api/visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ipAddress,
      locationStatus: "pending",
      pagePath:
        window.location.pathname +
        window.location.search +
        window.location.hash,
      referrer: document.referrer || "direct",
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      campaign: getCampaign(),
      sessionId: getSessionId(),
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Failed to log visit.");
    throw new Error(message || "Failed to log visit.");
  }

  const result = await response.json().catch(() => null);

  // The footer strip shows a live visitor number. It starts from a local
  // fallback and upgrades to the real figure once the API confirms it.
  if (Number.isFinite(Number(result?.visitorNo))) {
    window.dispatchEvent(
      new CustomEvent("visitLogged", {
        detail: { visitorNo: Number(result.visitorNo) },
      }),
    );
  }

  // Ask for precise coordinates in the background and patch the record.
  if (result?.id) {
    requestPreciseLocation()
      .then((location) =>
        fetch(`${VISIT_API_URL}/api/visit/${result.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(location),
        }),
      )
      .catch(() => {
        /* precise location is a bonus, never a failure */
      });
  }

  return result;
};
