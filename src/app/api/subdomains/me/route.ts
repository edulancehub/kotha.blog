import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { tenantSiteUrl } from "@/lib/tenancy";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { slug: null },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }
  const siteUrl = tenantSiteUrl(user.username, request.headers.get("host"));
  return NextResponse.json(
    { slug: user.username, siteUrl },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
