import { isValidTenantSlug } from "@/lib/tenancy";
import { isReservedSlug } from "@/lib/subdomains/reserved";

export function isClaimableSlug(slug: string): boolean {
  return isValidTenantSlug(slug) && !isReservedSlug(slug);
}
