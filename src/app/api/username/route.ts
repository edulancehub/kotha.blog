import { NextResponse, type NextRequest } from "next/server";
import { isUsernameAvailable } from "@/lib/db";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }
  const result = await isUsernameAvailable(username);
  return NextResponse.json(result);
}
