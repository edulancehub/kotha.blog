import { NextResponse, type NextRequest } from "next/server";
import { getTenantSlugFromHost, isValidTenantSlug } from "@/lib/tenancy";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Refresh Supabase session on every request
  const { user, supabaseResponse } = await updateSession(request);

  const host = request.headers.get("host") ?? "";
  const slug = getTenantSlugFromHost(host);

  if (!slug) {
    // Hub traffic — protect dashboard
    if (pathname.startsWith("/dashboard")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/sign-in";
        return NextResponse.redirect(url);
      }
    }
    return supabaseResponse;
  }

  if (!isValidTenantSlug(slug)) {
    return new NextResponse("Invalid subdomain", { status: 400 });
  }

  const url = request.nextUrl.clone();
  const suffix = pathname === "/" ? "" : pathname;
  url.pathname = `/p/${slug}${suffix}`;

  // Rewrite needs to carry Supabase cookies
  const rewriteResponse = NextResponse.rewrite(url, { request });
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    rewriteResponse.cookies.set(cookie.name, cookie.value);
  });

  return rewriteResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
