import { NextResponse, type NextRequest } from "next/server";
import {
  getTenantSlugFromHost,
  hubUrlFromRequestHost,
  isValidTenantSlug,
} from "@/lib/tenancy";

/** Paths that only exist on the hub — redirect here when opened on a tenant subdomain. */
const HUB_ONLY_PREFIXES = [
  "/dashboard",
  "/sign-in",
  "/sign-up",
  "/claim",
];

function isHubOnlyPath(pathname: string): boolean {
  return HUB_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";
  const slug = getTenantSlugFromHost(host);

  if (!slug) {
    if (pathname.startsWith("/dashboard")) {
      const sessionCookie = request.cookies.get("kotha_session");
      if (!sessionCookie?.value) {
        const url = request.nextUrl.clone();
        url.pathname = "/sign-in";
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  if (!isValidTenantSlug(slug)) {
    return new NextResponse("Invalid subdomain", { status: 400 });
  }

  if (isHubOnlyPath(pathname)) {
    const base = hubUrlFromRequestHost(host);
    const target = new URL(
      `${pathname}${request.nextUrl.search}`,
      `${base}/`,
    );
    return NextResponse.redirect(target);
  }

  const url = request.nextUrl.clone();
  const suffix = pathname === "/" ? "" : pathname;
  url.pathname = `/p/${slug}${suffix}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)" ],
};
