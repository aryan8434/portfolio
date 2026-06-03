import React, { useEffect, useMemo, useState } from "react";

const VISIT_API_URL =
  import.meta.env.VITE_VISIT_API_URL || "http://localhost:8787";

const formatTime = (value) => {
  if (!value) return "—";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString();
};

export default function VisitorDashboard() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } catch (snapshotError) {
        if (snapshotError?.name === "AbortError") return;
        const isNetworkError =
          snapshotError?.message?.includes("Failed to fetch") ||
          snapshotError?.message?.includes("ERR_CONNECTION_REFUSED");
        setError(
          isNetworkError
            ? "Local visitor API is not running. Put your service-account JSON in admin/service-account.json, then run npm run dev inside admin to start both the API and the dashboard."
            : snapshotError?.message ||
                "Failed to load visitor records from the local API.",
        );
        setLoading(false);
      }
    };

    loadVisits();

    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    const uniqueIps = new Set(
      visits.map((visit) => visit.ipAddress).filter(Boolean),
    );
    const denied = visits.filter(
      (visit) =>
        visit.locationStatus === "denied" ||
        visit.locationId === "location denied",
    ).length;

    return {
      total: visits.length,
      uniqueIps: uniqueIps.size,
      denied,
      latest: visits[0] || null,
    };
  }, [visits]);

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>Firestore admin</div>
          <h2 style={styles.title}>Visitor database</h2>
          <p style={styles.subtitle}>
            Tracks IP address, browser location status, coordinates when
            allowed, page path, and referrer.
          </p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard label="Total visits" value={stats.total} />
        <StatCard label="Unique IPs" value={stats.uniqueIps} />
        <StatCard label="Location denied" value={stats.denied} />
        <StatCard
          label="Latest visit"
          value={formatTime(stats.latest?.visitedAt)}
        />
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading && (
        <div style={styles.emptyState}>Loading visitor records...</div>
      )}
      {!loading && !error && !visits.length && (
        <div style={styles.emptyState}>No visits recorded yet.</div>
      )}

      {!loading && !error && !!visits.length && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>IP</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Coordinates</th>
                <th style={styles.th}>Page</th>
                <th style={styles.th}>Referrer</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => {
                const coordinates =
                  visit.latitude != null && visit.longitude != null
                    ? `${visit.latitude}, ${visit.longitude}`
                    : "location denied";

                return (
                  <tr key={visit.id} style={styles.row}>
                    <td style={styles.td}>{formatTime(visit.visitedAt)}</td>
                    <td style={styles.td}>{visit.ipAddress || "unknown"}</td>
                    <td style={styles.td}>
                      {visit.locationStatus || "unknown"}
                    </td>
                    <td style={styles.td}>{coordinates}</td>
                    <td style={styles.td}>{visit.pagePath || "/"}</td>
                    <td style={styles.td}>{visit.referrer || "direct"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
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
  },
  header: {
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
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
  title: {
    margin: 0,
    fontSize: "clamp(1.8rem, 3vw, 3rem)",
  },
  subtitle: {
    margin: "10px 0 0",
    maxWidth: 720,
    color: "rgba(226,232,240,0.78)",
    lineHeight: 1.6,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
  table: {
    width: "100%",
    minWidth: 900,
    borderCollapse: "collapse",
  },
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
  row: {
    borderTop: "1px solid rgba(148,163,184,0.1)",
  },
  td: {
    padding: 14,
    verticalAlign: "top",
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(148,163,184,0.08)",
  },
};
