import { NextResponse } from "next/server";
import { getFeedPosts } from "@/lib/db";

export async function GET() {
  const posts = await getFeedPosts(50);
  return NextResponse.json({ posts });
}
