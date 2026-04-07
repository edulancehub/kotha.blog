"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createProfile,
  createPost,
  updatePost,
  deletePost,
  updateSiteSettings,
  updateUser,
  clapPost,
  isUsernameAvailable,
  addComment,
  getPostById,
  getUserById,
  getUserReaction,
  setUserReaction,
  isUserAdmin,
  adminDeletePost,
  adminDeleteUser,
  type BlogTheme,
  type ReactionKind,
} from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// ── Auth Actions ───────────────────────────────────────────────
export async function signUpAction(_prev: unknown, formData: FormData) {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const displayName = (formData.get("displayName") as string)?.trim();

  if (!username || !email || !password || !displayName) {
    return { error: "All fields are required" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  // Check username availability
  const check = await isUsernameAvailable(username);
  if (!check.available) {
    return { error: check.reason };
  }

  // Create Supabase auth user
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: displayName },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create account" };
  }

  // Create profile in our profiles table
  const result = await createProfile(authData.user.id, username, email, displayName);
  if (result.error) {
    return { error: result.error };
  }

  redirect("/dashboard");
}

export async function signInAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password" };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ── Check Username ─────────────────────────────────────────────
export async function checkUsernameAction(username: string) {
  return isUsernameAvailable(username);
}

// ── Post Actions ───────────────────────────────────────────────
export async function createPostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const title = (formData.get("title") as string)?.trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() || "";
  const content = formData.get("content") as string;
  const excerpt = (formData.get("excerpt") as string)?.trim();
  const coverImage = (formData.get("coverImage") as string)?.trim() || "";
  const tagsStr = (formData.get("tags") as string)?.trim() || "";
  const published = formData.get("published") === "true";

  if (!title || !content) {
    return { error: "Title and content are required" };
  }

  const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
  await createPost(user.id, title, content, excerpt || title.slice(0, 160), coverImage, tags, published, subtitle);
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updatePostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() || "";
  const content = formData.get("content") as string;
  const excerpt = (formData.get("excerpt") as string)?.trim();
  const coverImage = (formData.get("coverImage") as string)?.trim() || "";
  const tagsStr = (formData.get("tags") as string)?.trim() || "";
  const published = formData.get("published") === "true";

  if (!id || !title || !content) {
    return { error: "Title and content are required" };
  }

  const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
  await updatePost(id, user.id, { title, subtitle, content, excerpt, coverImage, tags, published });
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deletePostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  await deletePost(formData.get("id") as string, user.id);
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function clapPostAction(postId: string) {
  return clapPost(postId);
}

export async function addCommentAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Sign in to comment on Kotha." };
  }
  const postId = (formData.get("postId") as string)?.trim();
  const body = formData.get("body") as string;
  if (!postId) return { error: "Missing post." };

  const result = await addComment(postId, user.id, body || "");
  if (result.error) return { error: result.error };

  const post = await getPostById(postId);
  const author = post ? await getUserById(post.userId) : null;
  if (post && author) {
    revalidatePath(`/p/${author.username}/${post.slug}`);
    revalidatePath(`/p/${author.username}`);
    revalidatePath("/");
    revalidatePath("/dashboard");
  }
  return { ok: true as const };
}

export async function reactToPostAction(postId: string, kind: ReactionKind): Promise<{
  error: string | null;
  summary: Record<ReactionKind, number> | null;
  mine: ReactionKind | null;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Sign in to react.", summary: null, mine: null };
  }
  const current = await getUserReaction(postId, user.id);
  const next: ReactionKind | null = current === kind ? null : kind;
  const { summary, mine } = await setUserReaction(postId, user.id, next);

  const post = await getPostById(postId);
  const author = post ? await getUserById(post.userId) : null;
  if (post && author) {
    revalidatePath(`/p/${author.username}/${post.slug}`);
  }

  return { error: null, summary, mine };
}

export async function updateAdSettingsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  await updateSiteSettings(user.id, {
    adsEnabled: formData.get("adsEnabled") === "true",
    adSlotHeader: (formData.get("adSlotHeader") as string) || "",
    adSlotFooter: (formData.get("adSlotFooter") as string) || "",
    adSlotInArticle: (formData.get("adSlotInArticle") as string) || "",
  });
  revalidatePath("/dashboard/settings");
  revalidatePath(`/p/${user.username}`);
}

// ── Site Settings Actions ──────────────────────────────────────
export async function updateSiteSettingsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const data = {
    siteName: (formData.get("siteName") as string)?.trim() || user.displayName + "'s Blog",
    tagline: (formData.get("tagline") as string)?.trim() || "",
    theme: (formData.get("theme") as BlogTheme) || "minimal",
    accentColor: (formData.get("accentColor") as string) || "#0d9488",
    bgColor: (formData.get("bgColor") as string) || "#fafaf9",
    textColor: (formData.get("textColor") as string) || "#1c1917",
    fontFamily: (formData.get("fontFamily") as "serif" | "sans" | "mono") || "serif",
    headerStyle: (formData.get("headerStyle") as "minimal" | "bold" | "centered") || "centered",
    showBio: formData.get("showBio") === "true",
    socialLinks: {
      twitter: (formData.get("twitter") as string)?.trim() || undefined,
      github: (formData.get("github") as string)?.trim() || undefined,
      website: (formData.get("website") as string)?.trim() || undefined,
    },
  };

  await updateSiteSettings(user.id, data);
  revalidatePath("/dashboard/settings");
}

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const displayName = (formData.get("displayName") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();

  if (displayName) {
    await updateUser(user.id, { displayName, bio: bio || "" });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}

// ── Admin Actions ──────────────────────────────────────────────
export async function adminDeletePostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!(await isUserAdmin(user.id))) redirect("/");

  const postId = formData.get("postId") as string;
  if (postId) {
    await adminDeletePost(postId);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath("/");
}

export async function adminDeleteUserAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!(await isUserAdmin(user.id))) redirect("/");

  const userId = formData.get("userId") as string;
  if (userId && userId !== user.id) {
    await adminDeleteUser(userId);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/");
}
