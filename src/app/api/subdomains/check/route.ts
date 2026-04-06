import { NextRequest, NextResponse } from "next/server";
import { isClaimableSlug } from "@/lib/subdomains/claimable";
import { isSlugClaimed } from "@/lib/subdomains/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("slug")?.trim().toLowerCase() ?? "";
  if (!raw) {
    return NextResponse.json({ error: "missing slug" }, { status: 400 });
  }

  if (!isClaimableSlug(raw)) {
    return NextResponse.json({
      available: false,
      reason: "invalid_or_reserved" as const,
    });
  }

  const taken = await isSlugClaimed(raw);
  return NextResponse.json({ available: !taken });
}
