import { NextRequest, NextResponse } from "next/server";
import { isUsernameAvailable } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("slug")?.trim().toLowerCase() ?? "";
  if (!raw) {
    return NextResponse.json(
      { error: "missing slug" },
      { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  const result = await isUsernameAvailable(raw);
  if (!result.available) {
    const invalid =
      result.reason?.includes("reserved") ||
      result.reason?.includes("Invalid") ||
      result.reason?.includes("lowercase");
    return NextResponse.json(
      {
        available: false,
        reason: invalid ? ("invalid_or_reserved" as const) : ("taken" as const),
        message: result.reason,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  return NextResponse.json(
    { available: true },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
