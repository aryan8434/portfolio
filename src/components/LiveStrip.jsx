import React, { useEffect, useRef, useState } from "react";
import "./LiveStrip.css";

/**
 * Live visitor strip: which number visitor you are, where you're reading from,
 * the weather there, and the OS you're on.
 *
 * Everything degrades quietly. Network calls are best-effort — a blocked
 * geo-IP lookup or a denied request should never leave a broken-looking row,
 * so each cell keeps its own state and falls back to a readable dash.
 */

const VISITOR_BASE = 457;

/* ------------------------------------------------------------------ *
 * Visitor number
 * ------------------------------------------------------------------ */

/**
 * The server (admin API) is the source of truth when it's reachable. When it
 * isn't — the API defaults to localhost and often simply isn't deployed — we
 * fall back to a per-browser number so the strip still reads sensibly.
 * A returning visitor keeps the number they were given the first time.
 */
const readLocalVisitorNo = () => {
  try {
    const mine = window.localStorage.getItem("pf_visitor_no");
    if (mine && Number.isFinite(Number(mine))) return Number(mine);

    const last = Number(window.localStorage.getItem("pf_visit_count"));
    const next = Number.isFinite(last) && last >= VISITOR_BASE ? last + 1 : VISITOR_BASE;

    window.localStorage.setItem("pf_visit_count", String(next));
    window.localStorage.setItem("pf_visitor_no", String(next));
    return next;
  } catch {
    return VISITOR_BASE;
  }
};

/* ------------------------------------------------------------------ *
 * Operating system
 * ------------------------------------------------------------------ */

const detectOs = () => {
  if (typeof navigator === "undefined") return "Unknown";

  const ua = navigator.userAgent || "";
  const platform = navigator.userAgentData?.platform || navigator.platform || "";
  const touchPoints = navigator.maxTouchPoints || 0;

  if (/Android/i.test(ua)) return "Android";

  // iPadOS 13+ reports a desktop Mac user agent. The touch points give it away.
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Mac/i.test(platform) && touchPoints > 1) return "iOS";

  if (/Win/i.test(platform) || /Windows/i.test(ua)) return "Windows";
  if (/Mac/i.test(platform) || /Mac OS X/i.test(ua)) return "macOS";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  if (/Linux|X11/i.test(platform) || /Linux|X11/i.test(ua)) return "Linux";

  return "Unknown";
};

const OsIcon = ({ os }) => {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true,
  };

  if (os === "Windows") {
    return (
      <svg {...common}>
        <path d="M3 5.9l7.4-1.02v6.9H3V5.9zm8.6-1.18L21 3.4v7.38h-9.4V4.72zM3 13.02h7.4v6.9L3 18.9v-5.88zm8.6 0H21v7.38l-9.4-1.3v-6.08z" />
      </svg>
    );
  }

  if (os === "macOS" || os === "iOS") {
    return (
      <svg {...common}>
        <path d="M16.36 12.7c-.02-2.3 1.88-3.4 1.96-3.45-1.07-1.56-2.73-1.78-3.32-1.8-1.42-.14-2.76.83-3.48.83-.71 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.75 2.97-.75s1.78.75 2.99.72c1.23-.02 2.01-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.41-3.68zM14.1 5.83c.63-.77 1.06-1.83.94-2.9-.91.04-2.01.61-2.67 1.37-.59.68-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.27z" />
      </svg>
    );
  }

  if (os === "Android") {
    return (
      <svg {...common}>
        <path d="M7.2 10.1h9.6v6.6a1.4 1.4 0 01-1.4 1.4H8.6a1.4 1.4 0 01-1.4-1.4v-6.6zM4.6 10.2c.72 0 1.3.58 1.3 1.3v3.5a1.3 1.3 0 11-2.6 0v-3.5c0-.72.58-1.3 1.3-1.3zm14.8 0c.72 0 1.3.58 1.3 1.3v3.5a1.3 1.3 0 11-2.6 0v-3.5c0-.72.58-1.3 1.3-1.3zM9.3 18.4c.72 0 1.3.58 1.3 1.3v1.6a1.3 1.3 0 11-2.6 0v-1.6c0-.72.58-1.3 1.3-1.3zm5.4 0c.72 0 1.3.58 1.3 1.3v1.6a1.3 1.3 0 11-2.6 0v-1.6c0-.72.58-1.3 1.3-1.3zM8.9 3.1l.83 1.5a5.9 5.9 0 014.54 0l.83-1.5a.36.36 0 11.63.35l-.82 1.48A5.36 5.36 0 0117.4 9.2H6.6a5.36 5.36 0 012.49-4.27L8.27 3.45a.36.36 0 11.63-.35zM9.6 6.9a.62.62 0 100 1.24.62.62 0 000-1.24zm4.8 0a.62.62 0 100 1.24.62.62 0 000-1.24z" />
      </svg>
    );
  }

  if (os === "Linux") {
    return (
      <svg {...common}>
        <path d="M12 2.2c2.4 0 3.9 1.9 3.9 4.4 0 1.3.4 2.1 1.1 3.2.9 1.4 2.2 3 2.6 5 .3 1.5-.2 2.6-1.2 3-.8.3-1.7 0-2.3-.6-.9 1-2.4 1.5-4.1 1.5s-3.2-.5-4.1-1.5c-.6.6-1.5.9-2.3.6-1-.4-1.5-1.5-1.2-3 .4-2 1.7-3.6 2.6-5 .7-1.1 1.1-1.9 1.1-3.2 0-2.5 1.5-4.4 3.9-4.4zm-1.7 4.1a.95 1.25 0 100 2.5.95 1.25 0 000-2.5zm3.4 0a.95 1.25 0 100 2.5.95 1.25 0 000-2.5zM12 9.6c-.9 0-1.7.5-1.7.9 0 .4.8.9 1.7.9s1.7-.5 1.7-.9c0-.4-.8-.9-1.7-.9z" />
      </svg>
    );
  }

  // ChromeOS / unknown — a neutral device glyph.
  return (
    <svg {...common}>
      <path d="M3.6 4.8h16.8c.66 0 1.2.54 1.2 1.2v9.2c0 .66-.54 1.2-1.2 1.2H3.6c-.66 0-1.2-.54-1.2-1.2V6c0-.66.54-1.2 1.2-1.2zm.6 1.8v8h15.6v-8H4.2zM2 18.4h20v1.6H2v-1.6z" />
    </svg>
  );
};

/* ------------------------------------------------------------------ *
 * Weather (WMO codes, as returned by Open-Meteo)
 * ------------------------------------------------------------------ */

const WEATHER = {
  0: { label: "Clear", icon: "☀️" },
  1: { label: "Mostly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Cloudy", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Foggy", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌦️" },
  56: { label: "Freezing drizzle", icon: "🌧️" },
  57: { label: "Freezing drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌦️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌧️" },
  67: { label: "Freezing rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "🌨️" },
  80: { label: "Light showers", icon: "🌦️" },
  81: { label: "Showers", icon: "🌧️" },
  82: { label: "Heavy showers", icon: "🌧️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Snow showers", icon: "🌨️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm", icon: "⛈️" },
  99: { label: "Hailstorm", icon: "⛈️" },
};

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

/** Counts up to the visitor number so the strip feels alive on arrival. */
const useCountUp = (target) => {
  const [shown, setShown] = useState(target);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target == null) return undefined;

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    // Reduced motion still goes through the same frame callback — it just
    // lands on the final value immediately.
    const duration = reduced ? 0 : 900;
    const from = reduced ? target : Math.max(0, target - 60);
    let start = null;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress =
        duration === 0 ? 1 : Math.min(1, (timestamp - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setShown(Math.round(from + (target - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target]);

  return shown;
};

const SAVED_LOCATION_KEY = "pf_location";

const readSavedLocation = () => {
  try {
    const raw = window.localStorage.getItem(SAVED_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.name === "string" &&
      typeof parsed?.latitude === "number" &&
      typeof parsed?.longitude === "number"
      ? parsed
      : null;
  } catch {
    return null;
  }
};

/** Open-Meteo's geocoder — keyless, same family as the forecast endpoint. */
const searchPlaces = async (term, signal) => {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      term,
    )}&count=5&language=en&format=json`,
    { signal },
  );
  if (!response.ok) throw new Error("place search failed");

  const data = await response.json();
  return (data?.results || []).map((r) => ({
    id: r.id,
    name: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    short: [r.name, r.country].filter(Boolean).join(", "),
    latitude: r.latitude,
    longitude: r.longitude,
  }));
};

const fetchWeather = async (latitude, longitude, signal) => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`,
    { signal },
  );
  if (!response.ok) throw new Error("weather lookup failed");

  const data = await response.json();
  const temp = data?.current?.temperature_2m;
  const code = data?.current?.weather_code;
  if (typeof temp !== "number") return null;

  const match = WEATHER[code] || { label: "—", icon: "🌡️" };
  return { temp: Math.round(temp), label: match.label, icon: match.icon };
};

const LiveStrip = () => {
  const [visitorNo, setVisitorNo] = useState(null);
  const [place, setPlace] = useState(null); // "Kota, India"
  const [weather, setWeather] = useState(null); // { temp, label, icon }
  const [os, setOs] = useState("Unknown");

  /* Manual location entry, for visitors whose location we can't detect. */
  const [locationFailed, setLocationFailed] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchState, setSearchState] = useState("idle"); // idle | busy | empty | error

  const displayedNo = useCountUp(visitorNo);

  /* OS is synchronous — resolve it immediately. */
  useEffect(() => {
    setOs(detectOs());
  }, []);

  /* Visitor number: local straight away, upgraded if the API answers. */
  useEffect(() => {
    setVisitorNo(readLocalVisitorNo());

    import("../services/visitorService").then(({ getOrIncrementFirestoreVisitorCount }) => {
      getOrIncrementFirestoreVisitorCount(VISITOR_BASE).then((fsCount) => {
        if (fsCount !== null) {
          setVisitorNo(fsCount);
          window.localStorage.setItem("pf_visitor_no", String(fsCount));
          window.localStorage.setItem("pf_visit_count", String(fsCount));
        }
      });
    }).catch(() => {});

    const onLogged = (event) => {
      const serverNo = Number(event?.detail?.visitorNo);
      if (Number.isFinite(serverNo) && serverNo > 0) setVisitorNo(serverNo);
    };

    window.addEventListener("visitLogged", onLogged);
    return () => window.removeEventListener("visitLogged", onLogged);
  }, []);

  /* Location, then weather for that location. */
  useEffect(() => {
    const controller = new AbortController();

    const applyWeather = async (latitude, longitude) => {
      try {
        const next = await fetchWeather(latitude, longitude, controller.signal);
        if (next) setWeather(next);
      } catch {
        /* weather is a bonus, never a failure */
      }
    };

    const load = async () => {
      // A location the visitor picked themselves always wins.
      const saved = readSavedLocation();
      if (saved) {
        setPlace(saved.name);
        await applyWeather(saved.latitude, saved.longitude);
        return;
      }

      try {
        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("geo lookup failed");

        const data = await response.json();
        const city = data.city || data.region;
        const country = data.country_name;

        if (city && country) setPlace(`${city}, ${country}`);
        else if (country) setPlace(country);
        else throw new Error("no place in response");

        if (
          typeof data.latitude === "number" &&
          typeof data.longitude === "number"
        ) {
          await applyWeather(data.latitude, data.longitude);
        }
      } catch (error) {
        // Denied, blocked by a tracker blocker, or simply unavailable — offer
        // the visitor a way to say where they are instead of a dead cell.
        if (error?.name !== "AbortError") setLocationFailed(true);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  /* Manual place lookup. */
  const runSearch = async (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;

    setSearchState("busy");
    setResults([]);

    try {
      const found = await searchPlaces(term);
      setResults(found);
      setSearchState(found.length ? "idle" : "empty");
    } catch {
      setSearchState("error");
    }
  };

  const choosePlace = async (choice) => {
    setPlace(choice.short);
    setLocationFailed(false);
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    setSearchState("idle");

    try {
      window.localStorage.setItem(
        SAVED_LOCATION_KEY,
        JSON.stringify({
          name: choice.short,
          latitude: choice.latitude,
          longitude: choice.longitude,
        }),
      );
    } catch {
      /* a saved preference is a nicety, not a requirement */
    }

    try {
      const next = await fetchWeather(choice.latitude, choice.longitude);
      if (next) setWeather(next);
    } catch {
      setWeather(null);
    }
  };

  return (
    <div className="livestrip" aria-label="Live visitor details">
      <span className="livestrip__pulse" aria-hidden="true" />

      <div className="livestrip__cell">
        <span className="livestrip__label">Visitor</span>
        <span className="livestrip__value">
          <strong>#{displayedNo ?? VISITOR_BASE}</strong>
        </span>
      </div>

      <div className="livestrip__cell livestrip__cell--location">
        <span className="livestrip__label">Location</span>

        <button
          type="button"
          className="livestrip__value livestrip__value--action"
          onClick={() => setSearchOpen((open) => !open)}
          title={place ? `${place} — click to change` : "Set your location"}
          aria-expanded={isSearchOpen}
        >
          {place ? (
            <>
              YOUR'E LOCACTED AT {place.toUpperCase()} AND TEMP IS {weather ? `${weather.temp}°C ${weather.icon}` : '...'}
            </>
          ) : locationFailed ? (
            <em>set location</em>
          ) : (
            <em>locating…</em>
          )}
        </button>

        {isSearchOpen && (
          <div className="livestrip__search">
            <form onSubmit={runSearch}>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a city…"
                aria-label="Search for your city"
              />
              <button type="submit" disabled={!query.trim()}>
                Go
              </button>
            </form>

            {searchState === "busy" && (
              <p className="livestrip__search-note">Searching…</p>
            )}
            {searchState === "empty" && (
              <p className="livestrip__search-note">
                No place matched that name.
              </p>
            )}
            {searchState === "error" && (
              <p className="livestrip__search-note">
                Search is unavailable right now.
              </p>
            )}

            {results.length > 0 && (
              <ul>
                {results.map((result) => (
                  <li key={result.id}>
                    <button type="button" onClick={() => choosePlace(result)}>
                      {result.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>



      <div className="livestrip__cell">
        <span className="livestrip__label">Academics</span>
        <span className="livestrip__value">
          8.24 CGPA
        </span>
      </div>

      <div className="livestrip__cell">
        <span className="livestrip__label">Leetcode</span>
        <span className="livestrip__value">
          1622 Rating
        </span>
      </div>

      <div className="livestrip__cell">
        <span className="livestrip__label">You&apos;re on</span>
        <span className="livestrip__value">
          <OsIcon os={os} /> {os === "Unknown" ? "your device" : os}
        </span>
      </div>
    </div>
  );
};

export default LiveStrip;
