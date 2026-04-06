import { NextResponse, type NextRequest } from "next/server";
import { getPostsByUser, createPost, getUserById } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await getPostsByUser(user.id);
  const profile = await getUserById(user.id);
  return NextResponse.json({ posts, user: profile });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, content, excerpt, coverImage, tags, published, subtitle } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const post = await createPost(
    user.id,
    title,
    content,
    excerpt || title.slice(0, 160),
    coverImage || "",
    tags || [],
    published ?? false,
    subtitle || ""
  );

  return NextResponse.json({ post }, { status: 201 });
}
