/**
 * Server-side visitor enrichment.
 *
 * A raw IP tells you nothing useful on its own. This resolves it into a
 * readable place plus the network that owns it — the network/org field is
 * what actually hints at "someone at a company looked at this", because
 * corporate offices and VPNs announce their own ASN while home broadband
 * announces a consumer ISP.
 *
 * Both providers are free and keyless. Results are cached in memory so a
 * refresh-happy visitor doesn't burn the rate limit.
 */

const cache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const LOOKUP_TIMEOUT_MS = 4000;

const EMPTY_GEO = {
  city: null,
  region: null,
  country: null,
  countryCode: null,
  flag: null,
  ipLatitude: null,
  ipLongitude: null,
  ipTimezone: null,
  isp: null,
  org: null,
  asn: null,
  networkType: "unknown",
  geoSource: "none",
};

/** Consumer ISPs — an IP on one of these is almost certainly a home connection. */
const CONSUMER_ISP_HINTS = [
  "jio", "airtel", "bsnl", "vodafone", "idea", "act fibernet", "hathway",
  "excitel", "tikona", "you broadband", "comcast", "spectrum", "verizon",
  "at&t", "t-mobile", "cox communications", "charter", "centurylink",
  "virgin media", "sky broadband", "bt group", "orange", "telefonica",
  "deutsche telekom", "telstra", "rogers", "bell canada", "shaw",
  "broadband", "telecom", "mobile", "cellular", "wireless", "cable",
];

/** Cloud / hosting networks — bots, scrapers, VPN exits, previews. */
const HOSTING_HINTS = [
  "amazon", "aws", "google cloud", "google llc", "microsoft", "azure",
  "digitalocean", "linode", "vultr", "hetzner", "ovh", "cloudflare",
  "oracle cloud", "alibaba", "fastly", "akamai", "vercel", "netlify",
  "hosting", "datacenter", "data center", "server", "vpn", "proxy",
];

const classifyNetwork = (rawType, isp, org) => {
  const haystack = `${isp || ""} ${org || ""}`.toLowerCase();
  if (!haystack.trim()) return "unknown";

  if (HOSTING_HINTS.some((h) => haystack.includes(h))) return "hosting";
  if (rawType && ["hosting", "business"].includes(String(rawType).toLowerCase())) {
    return String(rawType).toLowerCase() === "hosting" ? "hosting" : "corporate";
  }
  if (CONSUMER_ISP_HINTS.some((h) => haystack.includes(h))) return "consumer";

  // Named org that is neither a known consumer ISP nor a cloud provider —
  // most often a company's own network. Treated as a hint, not a fact.
  return org ? "corporate" : "unknown";
};

const fetchJson = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const isPrivateIp = (ip) =>
  !ip ||
  ip === "unknown" ||
  ip === "::1" ||
  ip.startsWith("127.") ||
  ip.startsWith("10.") ||
  ip.startsWith("192.168.") ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

/** Primary provider: ipwho.is — HTTPS, keyless, includes connection details. */
const viaIpwhois = async (ip) => {
  const data = await fetchJson(`https://ipwho.is/${encodeURIComponent(ip)}`);
  if (!data || data.success === false) return null;

  return {
    city: data.city || null,
    region: data.region || null,
    country: data.country || null,
    countryCode: data.country_code || null,
    flag: data.flag?.emoji || null,
    ipLatitude: data.latitude ?? null,
    ipLongitude: data.longitude ?? null,
    ipTimezone: data.timezone?.id || null,
    isp: data.connection?.isp || null,
    org: data.connection?.org || null,
    asn: data.connection?.asn ? `AS${data.connection.asn}` : null,
    networkType: classifyNetwork(
      data.type,
      data.connection?.isp,
      data.connection?.org,
    ),
    geoSource: "ipwho.is",
  };
};

/** Fallback provider: ip-api.com. */
const viaIpApi = async (ip) => {
  const fields = "status,country,countryCode,regionName,city,lat,lon,timezone,isp,org,as,hosting";
  const data = await fetchJson(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`,
  );
  if (!data || data.status !== "success") return null;

  return {
    city: data.city || null,
    region: data.regionName || null,
    country: data.country || null,
    countryCode: data.countryCode || null,
    flag: null,
    ipLatitude: data.lat ?? null,
    ipLongitude: data.lon ?? null,
    ipTimezone: data.timezone || null,
    isp: data.isp || null,
    org: data.org || null,
    asn: data.as || null,
    networkType: data.hosting
      ? "hosting"
      : classifyNetwork(null, data.isp, data.org),
    geoSource: "ip-api.com",
  };
};

export const lookupIp = async (ip) => {
  if (isPrivateIp(ip)) {
    return { ...EMPTY_GEO, networkType: "local", geoSource: "local" };
  }

  const cached = cache.get(ip);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  const result = (await viaIpwhois(ip)) || (await viaIpApi(ip)) || EMPTY_GEO;
  cache.set(ip, { at: Date.now(), value: result });
  return result;
};

/* ------------------------------------------------------------------ */
/* User-agent parsing — small and dependency-free, good enough for a   */
/* visitor table. Order matters: Edge before Chrome, Chrome before     */
/* Safari, since each spoofs the previous one in its UA string.        */
/* ------------------------------------------------------------------ */

const BROWSERS = [
  [/Edg[eA]?\/([\d.]+)/, "Edge"],
  [/OPR\/([\d.]+)/, "Opera"],
  [/SamsungBrowser\/([\d.]+)/, "Samsung Internet"],
  [/Firefox\/([\d.]+)/, "Firefox"],
  [/Chrome\/([\d.]+)/, "Chrome"],
  [/Version\/([\d.]+).*Safari/, "Safari"],
];

const OSES = [
  [/Windows NT 10\.0/, "Windows 10/11"],
  [/Windows NT ([\d.]+)/, "Windows"],
  [/iPhone OS ([\d_]+)/, "iOS"],
  [/iPad.*OS ([\d_]+)/, "iPadOS"],
  [/Mac OS X ([\d_]+)/, "macOS"],
  [/Android ([\d.]+)/, "Android"],
  [/Linux/, "Linux"],
];

const BOT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|preview|curl|wget|python-requests|axios|postman/i;

export const parseUserAgent = (userAgent = "") => {
  const ua = String(userAgent);

  if (!ua || ua === "unknown") {
    return { browser: "unknown", os: "unknown", device: "unknown", isBot: false };
  }

  let browser = "unknown";
  for (const [pattern, name] of BROWSERS) {
    const match = ua.match(pattern);
    if (match) {
      browser = match[1] ? `${name} ${match[1].split(".")[0]}` : name;
      break;
    }
  }

  let os = "unknown";
  for (const [pattern, name] of OSES) {
    const match = ua.match(pattern);
    if (match) {
      os = match[1] ? `${name} ${match[1].replace(/_/g, ".")}` : name;
      break;
    }
  }

  const isTablet = /iPad|Tablet/i.test(ua);
  const isMobile = !isTablet && /Mobile|Android|iPhone/i.test(ua);

  return {
    browser,
    os,
    device: isTablet ? "tablet" : isMobile ? "mobile" : "desktop",
    isBot: BOT_PATTERN.test(ua),
  };
};

/** Where the visit came from, in words. */
export const describeReferrer = (referrer = "direct") => {
  if (!referrer || referrer === "direct") return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (/linkedin/.test(host)) return "LinkedIn";
    if (/github/.test(host)) return "GitHub";
    if (/google|bing|duckduckgo/.test(host)) return "Search";
    if (/naukri|indeed|internshala|wellfound|instahyre|hirist/.test(host))
      return "Job board";
    if (/mail\.|gmail|outlook/.test(host)) return "Email";
    return host;
  } catch {
    return referrer;
  }
};
