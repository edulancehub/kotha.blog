const ROOT =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN?.toLowerCase() ?? "kotha.blog";

/** Subdomain labels allowed for tenant sites (DNS-safe). */
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function rootDomain(): string {
  return ROOT;
}

/** URL for the main hub (feed, signup). Override in dev with NEXT_PUBLIC_HUB_URL. */
export function hubBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_HUB_URL) {
    return process.env.NEXT_PUBLIC_HUB_URL.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return `https://${ROOT}`;
}

/**
 * Public URL for a tenant site, using the same port as the current request in local dev.
 */
export function tenantSiteUrl(slug: string, requestHost: string | null): string {
  const host = requestHost?.split(":")[0]?.toLowerCase() ?? "";
  const port = requestHost?.includes(":") ? requestHost.split(":")[1] : "";

  if (host === "localhost" || host.endsWith(".localhost")) {
    const p = port || "3000";
    return `http://${slug}.localhost:${p}`;
  }

  return `https://${slug}.${ROOT}`;
}

export function isValidTenantSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

/**
 * Returns tenant slug when the request is for a user site, e.g. `alice.kotha.blog`.
 * Apex / `www` / plain `localhost` → hub (no tenant).
 */
export function getTenantSlugFromHost(host: string): string | null {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname) return null;

  if (hostname === "localhost" || hostname === "127.0.0.1") return null;

  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    if (!sub || sub === "www") return null;
    return isValidTenantSlug(sub) ? sub : null;
  }

  if (hostname === ROOT || hostname === `www.${ROOT}`) return null;

  if (hostname.endsWith(`.${ROOT}`)) {
    const sub = hostname.slice(0, -(ROOT.length + 1));
    if (!sub || sub.includes(".") || sub === "www") return null;
    return isValidTenantSlug(sub) ? sub : null;
  }

  return null;
}
