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

const getBrowserLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: null,
        longitude: null,
        locationId: "location denied",
        locationStatus: "unavailable",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationId: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          locationStatus: "granted",
        });
      },
      (error) => {
        const denied = error?.code === 1;
        resolve({
          latitude: null,
          longitude: null,
          locationId: denied ? "location denied" : "location unavailable",
          locationStatus: denied ? "denied" : "unavailable",
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 7000,
        maximumAge: 300000,
      },
    );
  });

export const logPortfolioVisit = async () => {
  const [ipAddress, location] = await Promise.all([
    getVisitorIp(),
    getBrowserLocation(),
  ]);

  const response = await fetch(`${VISIT_API_URL}/api/visit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ipAddress,
      locationId: location.locationId,
      locationStatus: location.locationStatus,
      latitude: location.latitude,
      longitude: location.longitude,
      pagePath:
        window.location.pathname +
        window.location.search +
        window.location.hash,
      referrer: document.referrer || "direct",
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Failed to log visit.");
    throw new Error(message || "Failed to log visit.");
  }

  return response.json().catch(() => null);
};
