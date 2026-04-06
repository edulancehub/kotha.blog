import { createAdminClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────────
export type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  joinedAt: string;
  followers: number;
  following: number;
};

export type Post = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  published: boolean;
  claps: number;
  views: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
};

export type BlogTheme = "minimal" | "dark-noir" | "vintage-press" | "neon-vapor" | "forest" | "ocean-breeze";

export type SiteSettings = {
  userId: string;
  siteName: string;
  tagline: string;
  theme: BlogTheme;
  accentColor: string;
  bgColor: string;
  textColor: string;
  fontFamily: "serif" | "sans" | "mono";
  headerStyle: "minimal" | "bold" | "centered";
  showBio: boolean;
  socialLinks: { twitter?: string; github?: string; website?: string };
  customCss: string;
  logoUrl: string;
  /** Owner enables third-party ad snippets on their public blog */
  adsEnabled: boolean;
  adSlotHeader: string;
  adSlotFooter: string;
  adSlotInArticle: string;
};

export type ReactionKind = "like" | "dislike" | "love";

export type PostCommentView = {
  id: string;
  body: string;
  createdAt: string;
  author: { displayName: string; username: string; avatarUrl: string };
};

// ── Helper: snake_case DB row → camelCase ──────────────────────
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

function mapSettings(row: Record<string, unknown>): SiteSettings {
  return {
    userId: row.user_id as string,
    siteName: (row.site_name as string) || "",
    tagline: (row.tagline as string) || "",
    theme: (row.theme as BlogTheme) || "minimal",
    accentColor: (row.accent_color as string) || "#0d9488",
    bgColor: (row.bg_color as string) || "#fafaf9",
    textColor: (row.text_color as string) || "#1c1917",
    fontFamily: (row.font_family as "serif" | "sans" | "mono") || "serif",
    headerStyle: (row.header_style as "minimal" | "bold" | "centered") || "centered",
    showBio: row.show_bio !== false,
    socialLinks: {
      twitter: (row.social_twitter as string) || undefined,
      github: (row.social_github as string) || undefined,
      website: (row.social_website as string) || undefined,
    },
    customCss: (row.custom_css as string) || "",
    logoUrl: (row.logo_url as string) || "",
    adsEnabled: row.ads_enabled === true,
    adSlotHeader: (row.ad_slot_header as string) || "",
    adSlotFooter: (row.ad_slot_footer as string) || "",
    adSlotInArticle: (row.ad_slot_in_article as string) || "",
  };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function genSlugSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Admin client (bypasses RLS) ────────────────────────────────
function db() {
  return createAdminClient();
}

// ── Username Validation ────────────────────────────────────────
export async function isReservedUsername(slug: string): Promise<boolean> {
  const { data } = await db()
    .from("reserved_usernames")
    .select("username")
    .eq("username", slug.toLowerCase())
    .maybeSingle();
  return !!data;
}

export async function isUsernameAvailable(
  username: string
): Promise<{ available: boolean; reason?: string }> {
  const slug = username.toLowerCase().trim();

  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
    return { available: false, reason: "Invalid format. Use lowercase letters, numbers, hyphens (1-63 chars)" };
  }
  if (slug.length < 2) {
    return { available: false, reason: "Username must be at least 2 characters" };
  }
  if (await isReservedUsername(slug)) {
    return { available: false, reason: "This username is reserved" };
  }
  const { data } = await db()
    .from("profiles")
    .select("id")
    .eq("username", slug)
    .maybeSingle();
  if (data) {
    return { available: false, reason: "This username is already taken" };
  }
  return { available: true };
}

// ── Users ──────────────────────────────────────────────────────
export async function createProfile(
  userId: string,
  username: string,
  email: string,
  displayName: string
): Promise<{ user?: User; error?: string }> {
  const slug = username.toLowerCase().trim();
  const check = await isUsernameAvailable(slug);
  if (!check.available) return { error: check.reason };

  const { data, error } = await db()
    .from("profiles")
    .insert({
      id: userId,
      username: slug,
      display_name: displayName,
      email: email.toLowerCase(),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Create default site settings
  await db().from("site_settings").insert({
    user_id: userId,
    site_name: displayName + "'s Blog",
    tagline: "Welcome to my corner of the web",
    theme: "minimal",
  });

  return { user: mapProfile(data) };
}

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await db()
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapProfile(data) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data } = await db()
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return data ? mapProfile(data) : null;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, "displayName" | "bio" | "avatarUrl">>
): Promise<User | null> {
  const update: Record<string, unknown> = {};
  if (data.displayName !== undefined) update.display_name = data.displayName;
  if (data.bio !== undefined) update.bio = data.bio;
  if (data.avatarUrl !== undefined) update.avatar_url = data.avatarUrl;

  const { data: row, error } = await db()
    .from("profiles")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  return row && !error ? mapProfile(row) : null;
}

// ── Posts ───────────────────────────────────────────────────────
export async function createPost(
  userId: string,
  title: string,
  content: string,
  excerpt: string,
  coverImage: string,
  tags: string[],
  published: boolean,
  subtitle = ""
): Promise<Post> {
  const { data } = await db()
    .from("posts")
    .insert({
      user_id: userId,
      slug: slugify(title) + "-" + genSlugSuffix(),
      title,
      subtitle,
      excerpt: excerpt || title.slice(0, 160),
      content,
      cover_image: coverImage,
      tags,
      published,
      read_time: estimateReadTime(content),
    })
    .select()
    .single();

  return mapPost(data!);
}

export async function updatePost(
  id: string,
  userId: string,
  data: Partial<Pick<Post, "title" | "content" | "excerpt" | "coverImage" | "published" | "tags" | "subtitle">>
): Promise<Post | null> {
  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.content !== undefined) {
    update.content = data.content;
    update.read_time = estimateReadTime(data.content);
  }
  if (data.excerpt !== undefined) update.excerpt = data.excerpt;
  if (data.coverImage !== undefined) update.cover_image = data.coverImage;
  if (data.published !== undefined) update.published = data.published;
  if (data.tags !== undefined) update.tags = data.tags;
  if (data.subtitle !== undefined) update.subtitle = data.subtitle;

  const { data: row } = await db()
    .from("posts")
    .update(update)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  return row ? mapPost(row) : null;
}

export async function deletePost(id: string, userId: string): Promise<boolean> {
  const { error } = await db()
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data } = await db()
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapPost(data) : null;
}

export async function getPostBySlug(
  username: string,
  slug: string
): Promise<(Post & { author: User }) | null> {
  const user = await getUserByUsername(username);
  if (!user) return null;
  const { data } = await db()
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!data) return null;
  return { ...mapPost(data), author: user };
}

/** Increments views once per page load; works for traffic from kotha.blog, subdomains, or external referrers. */
export async function incrementViews(postId: string): Promise<number> {
  const client = db();
  const { data: rpcVal, error: rpcErr } = await client.rpc("increment_post_views", {
    p_post_id: postId,
  });
  if (!rpcErr && typeof rpcVal === "number") {
    return rpcVal;
  }
  const { data: row } = await client.from("posts").select("views").eq("id", postId).maybeSingle();
  const next = ((row?.views as number) ?? 0) + 1;
  await client.from("posts").update({ views: next }).eq("id", postId);
  return next;
}

export async function getPostsByUser(userId: string, publishedOnly = false): Promise<Post[]> {
  let query = db()
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (publishedOnly) query = query.eq("published", true);
  const { data } = await query;
  return (data || []).map(mapPost);
}

export async function getPublishedPostsByUsername(
  username: string
): Promise<(Post & { author: User })[]> {
  const user = await getUserByUsername(username);
  if (!user) return [];
  const { data } = await db()
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .eq("published", true)
    .order("created_at", { ascending: false });
  return ((data || []) as Record<string, unknown>[]).map((row) => ({ ...mapPost(row), author: user }));
}

export async function getFeedPosts(limit = 20): Promise<(Post & { author: User })[]> {
  const { data: posts } = await db()
    .from("posts")
    .select("*, profiles!posts_user_id_fkey(*)")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!posts) return [];

  return (posts as Record<string, unknown>[])
    .map((row) => {
      const profile = (row as Record<string, unknown>).profiles as Record<string, unknown> | null;
      if (!profile) return null;
      return { ...mapPost(row), author: mapProfile(profile) };
    })
    .filter(Boolean) as (Post & { author: User })[];
}

export async function clapPost(id: string): Promise<number> {
  const { data } = await db()
    .from("posts")
    .select("claps")
    .eq("id", id)
    .single();

  const newClaps = ((data?.claps as number) || 0) + 1;
  await db().from("posts").update({ claps: newClaps }).eq("id", id);
  return newClaps;
}

// ── Site Settings ──────────────────────────────────────────────
export async function getSiteSettings(userId: string): Promise<SiteSettings | null> {
  const { data } = await db()
    .from("site_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? mapSettings(data) : null;
}

export async function getSiteSettingsByUsername(
  username: string
): Promise<SiteSettings | null> {
  const user = await getUserByUsername(username);
  if (!user) return null;
  return getSiteSettings(user.id);
}

export async function updateSiteSettings(
  userId: string,
  data: Partial<Omit<SiteSettings, "userId">>
): Promise<SiteSettings | null> {
  const update: Record<string, unknown> = {};
  if (data.siteName !== undefined) update.site_name = data.siteName;
  if (data.tagline !== undefined) update.tagline = data.tagline;
  if (data.theme !== undefined) update.theme = data.theme;
  if (data.accentColor !== undefined) update.accent_color = data.accentColor;
  if (data.bgColor !== undefined) update.bg_color = data.bgColor;
  if (data.textColor !== undefined) update.text_color = data.textColor;
  if (data.fontFamily !== undefined) update.font_family = data.fontFamily;
  if (data.headerStyle !== undefined) update.header_style = data.headerStyle;
  if (data.showBio !== undefined) update.show_bio = data.showBio;
  if (data.customCss !== undefined) update.custom_css = data.customCss;
  if (data.logoUrl !== undefined) update.logo_url = data.logoUrl;
  if (data.adsEnabled !== undefined) update.ads_enabled = data.adsEnabled;
  if (data.adSlotHeader !== undefined) update.ad_slot_header = data.adSlotHeader;
  if (data.adSlotFooter !== undefined) update.ad_slot_footer = data.adSlotFooter;
  if (data.adSlotInArticle !== undefined) update.ad_slot_in_article = data.adSlotInArticle;
  if (data.socialLinks) {
    update.social_twitter = data.socialLinks.twitter || "";
    update.social_github = data.socialLinks.github || "";
    update.social_website = data.socialLinks.website || "";
  }

  const { data: row } = await db()
    .from("site_settings")
    .update(update)
    .eq("user_id", userId)
    .select()
    .single();

  return row ? mapSettings(row) : null;
}

// ── Stats ──────────────────────────────────────────────────────
export async function getUserStats(
  userId: string
): Promise<{
  totalPosts: number;
  totalClaps: number;
  totalViews: number;
  totalComments: number;
}> {
  const { data } = await db()
    .from("posts")
    .select("id, published, claps, views")
    .eq("user_id", userId);

  const posts = (data || []) as Record<string, unknown>[];
  const allIds = posts.map((p) => p.id as string);
  const commentCounts = await getCommentCountsForPostIds(allIds);
  const totalComments = Object.values(commentCounts).reduce((a, b) => a + b, 0);

  return {
    totalPosts: posts.filter((p) => Boolean(p.published)).length,
    totalClaps: posts.reduce((s, p) => s + ((p.claps as number) || 0), 0),
    totalViews: posts.reduce((s, p) => s + ((p.views as number) || 0), 0),
    totalComments,
  };
}

export async function getCommentCountsForPostIds(
  postIds: string[]
): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  if (postIds.length === 0) return out;
  for (const id of postIds) out[id] = 0;
  const { data, error } = await db()
    .from("post_comments")
    .select("post_id")
    .in("post_id", postIds);
  if (error) return out;
  for (const row of data || []) {
    const pid = row.post_id as string;
    if (pid in out) out[pid] += 1;
  }
  return out;
}

export async function listCommentsForPost(postId: string): Promise<PostCommentView[]> {
  const { data: rows, error } = await db()
    .from("post_comments")
    .select("id, body, created_at, user_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) return [];
  if (!rows?.length) return [];

  const userIds = [...new Set((rows as Record<string, unknown>[]).map((r) => r.user_id as string))];
  const users = new Map<string, User>();
  await Promise.all(
    userIds.map(async (id) => {
      const u = await getUserById(id);
      if (u) users.set(id, u);
    })
  );

  return (rows as Record<string, unknown>[]).map((r) => {
    const u = users.get(r.user_id as string);
    return {
      id: r.id as string,
      body: r.body as string,
      createdAt: r.created_at as string,
      author: {
        displayName: u?.displayName ?? "Reader",
        username: u?.username ?? "",
        avatarUrl: u?.avatarUrl ?? "",
      },
    };
  });
}

export async function addComment(
  postId: string,
  userId: string,
  body: string
): Promise<{ error?: string }> {
  const trimmed = body.trim();
  if (trimmed.length < 1) return { error: "Comment cannot be empty" };
  if (trimmed.length > 4000) return { error: "Comment is too long (max 4000 characters)" };

  const post = await getPostById(postId);
  if (!post || !post.published) return { error: "Post not found" };

  const { error } = await db().from("post_comments").insert({
    post_id: postId,
    user_id: userId,
    body: trimmed,
  });

  if (error) return { error: error.message };
  return {};
}

export async function getReactionSummary(
  postId: string
): Promise<Record<ReactionKind, number>> {
  const base: Record<ReactionKind, number> = { like: 0, dislike: 0, love: 0 };
  const { data, error } = await db()
    .from("post_reactions")
    .select("reaction")
    .eq("post_id", postId);
  if (error) return base;
  for (const row of data || []) {
    const r = row.reaction as ReactionKind;
    if (r in base) base[r] += 1;
  }
  return base;
}

export async function getUserReaction(
  postId: string,
  userId: string
): Promise<ReactionKind | null> {
  const { data, error } = await db()
    .from("post_reactions")
    .select("reaction")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return null;
  const r = data?.reaction as ReactionKind | undefined;
  return r && ["like", "dislike", "love"].includes(r) ? r : null;
}

export async function setUserReaction(
  postId: string,
  userId: string,
  next: ReactionKind | null
): Promise<{ summary: Record<ReactionKind, number>; mine: ReactionKind | null }> {
  const client = db();
  await client.from("post_reactions").delete().eq("post_id", postId).eq("user_id", userId);
  if (next !== null) {
    await client.from("post_reactions").insert({
      post_id: postId,
      user_id: userId,
      reaction: next,
    });
  }
  const summary = await getReactionSummary(postId);
  const mine = await getUserReaction(postId, userId);
  return { summary, mine };
}

// ── Available Themes List ──────────────────────────────────────
export const BLOG_THEMES: { id: BlogTheme; name: string; description: string; preview: string }[] = [
  { id: "minimal", name: "Minimal", description: "Clean Swiss design with generous whitespace", preview: "#fafaf9" },
  { id: "dark-noir", name: "Dark Noir", description: "Dramatic dark background with bold typography", preview: "#0f0f0f" },
  { id: "vintage-press", name: "Vintage Press", description: "Editorial newspaper aesthetic with serif elegance", preview: "#f5f0e8" },
  { id: "neon-vapor", name: "Neon Vapor", description: "Cyberpunk-inspired with neon glows and gradients", preview: "#1a0a2e" },
  { id: "forest", name: "Forest", description: "Earthy, natural tones with organic warmth", preview: "#1a2e1a" },
  { id: "ocean-breeze", name: "Ocean Breeze", description: "Calm blue tones, professional and serene", preview: "#f0f7ff" },
];
