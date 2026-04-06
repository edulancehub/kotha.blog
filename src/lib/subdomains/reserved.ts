/** Labels that must not be used as tenant subdomains (infra + hub routes). */
const RESERVED = new Set([
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "mail",
  "ftp",
  "cdn",
  "static",
  "assets",
  "claim",
  "help",
  "support",
  "status",
  "blog",
  "docs",
  "staging",
  "dev",
  "test",
  "_next",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug.toLowerCase());
}
