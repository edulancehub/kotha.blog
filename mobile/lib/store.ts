// ── Supabase-Powered Data Store ─────────────────────────────────
// All data flows through Supabase — real database, real auth

import { supabase } from "./supabase";
import type { User, Post } from "./types";

// ── Helper: snake_case row → camelCase ──────────────────────────
function mapProfile(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    username: row.username as string,
    displayName: (row.display_name as string) || "",
    email: (row.email as string) || "",
    bio: (row.bio as string) || "",
    avatarUrl: (row.avatar_url as string) || "",
    joinedAt: (row.joined_at as string) || new Date().toISOString(),
    followers: (row.followers as number) || 0,
    following: (row.following as number) || 0,
  };
}

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    slug: row.slug as string,
    title: (row.title as string) || "",
    subtitle: (row.subtitle as string) || "",
    excerpt: (row.excerpt as string) || "",
    content: (row.content as string) || "",
    coverImage: (row.cover_image as string) || "",
    tags: (row.tags as string[]) || [],
    published: (row.published as boolean) || false,
    claps: (row.claps as number) || 0,
    views: (row.views as number) || 0,
    readTime: (row.read_time as number) || 1,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  };
}

function mapPostWithAuthor(row: Record<string, unknown>): Post {
  const post = mapPost(row);
  const profiles = row.profiles as Record<string, unknown> | null;
  if (profiles) {
    post.author = mapProfile(profiles);
  }
  return post;
}

// ── Auth ────────────────────────────────────────────────────────

export async function signIn(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Sign in failed" };

  const profile = await getUserById(data.user.id);
  if (!profile) return { error: "Profile not found. Please sign up first." };
  return { user: profile };
}

export async function signUp(
  username: string,
  email: string,
  password: string,
  displayName: string
): Promise<{ user?: User; error?: string }> {
  if (password.length < 6)
    return { error: "Password must be at least 6 characters" };
  if (username.length < 2)
    return { error: "Username must be at least 2 characters" };

  // Check username availability
  const available = await checkUsername(username);
  if (!available.available) return { error: available.reason };

  // Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: displayName },
    },
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Sign up failed" };

  // Create profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: authData.user.id,
    username: username.toLowerCase(),
    display_name: displayName,
    email: email.toLowerCase(),
  });

  if (profileError) return { error: profileError.message };

  // Create default site settings
  await supabase.from("site_settings").upsert({
    user_id: authData.user.id,
    site_name: displayName + "'s Blog",
    tagline: "Welcome to my corner of the web",
    theme: "minimal",
  });

  const profile = await getUserById(authData.user.id);
  return { user: profile! };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getUserById(user.id);
}

// ── Username Check ──────────────────────────────────────────────

export async function checkUsername(
  username: string
): Promise<{ available: boolean; reason?: string }> {
  const slug = username.toLowerCase().trim();

  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
    return { available: false, reason: "Invalid format" };
  }
  if (slug.length < 2) {
    return { available: false, reason: "Must be at least 2 characters" };
  }

  // Check reserved
  const { data: reserved } = await supabase
    .from("reserved_usernames")
    .select("username")
    .eq("username", slug)
    .maybeSingle();
  if (reserved) return { available: false, reason: "This username is reserved" };

  // Check taken
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", slug)
    .maybeSingle();
  if (existing) return { available: false, reason: "Already taken" };

  return { available: true };
}

// ── Users ───────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapProfile(data) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return data ? mapProfile(data) : null;
}

// ── Posts ────────────────────────────────────────────────────────

export async function getFeedPosts(): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data || []).map(mapPostWithAuthor);
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .eq("id", id)
    .maybeSingle();

  return data ? mapPostWithAuthor(data) : null;
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data || []).map(mapPost);
}

export async function getTrendingPosts(): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .eq("published", true)
    .order("claps", { ascending: false })
    .limit(20);

  return (data || []).map(mapPostWithAuthor);
}

export async function searchPosts(query: string): Promise<Post[]> {
  const q = `%${query}%`;
  const { data } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .eq("published", true)
    .or(`title.ilike.${q},excerpt.ilike.${q}`)
    .order("claps", { ascending: false })
    .limit(20);

  return (data || []).map(mapPostWithAuthor);
}

export async function createPost(
  userId: string,
  title: string,
  content: string,
  tags: string[],
  published: boolean,
  subtitle = "",
  coverImage = ""
): Promise<Post | null> {
  const slug =
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) +
    "-" + Math.random().toString(36).slice(2, 10);

  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      slug,
      title,
      subtitle,
      excerpt: title.slice(0, 160),
      content,
      cover_image: coverImage,
      tags,
      published,
      read_time: readTime,
    })
    .select()
    .single();

  if (error) {
    console.error("Create post error:", error);
    return null;
  }
  return mapPost(data);
}

export async function updatePost(
  id: string,
  userId: string,
  updates: Partial<{
    title: string;
    subtitle: string;
    content: string;
    excerpt: string;
    coverImage: string;
    tags: string[];
    published: boolean;
  }>
): Promise<Post | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
  if (updates.content !== undefined) {
    dbUpdates.content = updates.content;
    const wc = updates.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
    dbUpdates.read_time = Math.max(1, Math.round(wc / 200));
  }
  if (updates.excerpt !== undefined) dbUpdates.excerpt = updates.excerpt;
  if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.published !== undefined) dbUpdates.published = updates.published;

  const { data } = await supabase
    .from("posts")
    .update(dbUpdates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  return data ? mapPost(data) : null;
}

export async function deletePost(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

export async function clapPost(postId: string): Promise<number> {
  const { data } = await supabase
    .from("posts")
    .select("claps")
    .eq("id", postId)
    .single();

  const newClaps = ((data?.claps as number) || 0) + 1;
  await supabase.from("posts").update({ claps: newClaps }).eq("id", postId);
  return newClaps;
}

// ── Site Settings ───────────────────────────────────────────────

export type BlogTheme = "minimal" | "dark-noir" | "vintage-press" | "neon-vapor" | "forest" | "ocean-breeze";

export const AVAILABLE_THEMES: { id: BlogTheme; name: string; desc: string; color: string }[] = [
  { id: "minimal", name: "Minimal", desc: "Clean & modern", color: "#fafaf9" },
  { id: "dark-noir", name: "Dark Noir", desc: "Bold & dramatic", color: "#0a0a0a" },
  { id: "vintage-press", name: "Vintage Press", desc: "Editorial elegance", color: "#f5f0e8" },
  { id: "neon-vapor", name: "Neon Vapor", desc: "Cyberpunk glow", color: "#0d0221" },
  { id: "forest", name: "Forest", desc: "Earthy & organic", color: "#f0f4ed" },
  { id: "ocean-breeze", name: "Ocean Breeze", desc: "Calm & professional", color: "#f0f7ff" },
];

export async function getSiteSettings(userId: string) {
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function updateSiteSettings(
  userId: string,
  updates: Record<string, unknown>
): Promise<boolean> {
  const { error } = await supabase
    .from("site_settings")
    .update(updates)
    .eq("user_id", userId);
  return !error;
}
