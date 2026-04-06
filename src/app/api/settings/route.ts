import { NextResponse, type NextRequest } from "next/server";
import { getSiteSettings, updateSiteSettings, BLOG_THEMES } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await getSiteSettings(user.id);
  return NextResponse.json({ settings, themes: BLOG_THEMES });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updated = await updateSiteSettings(user.id, body);
  return NextResponse.json({ settings: updated });
}
