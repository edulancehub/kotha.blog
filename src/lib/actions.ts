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

function friendlyAuthInfraMessage(detail?: string): string {
  const hint =
    "Authentication service is unreachable. Check Supabase config: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  if (!detail) return hint;
  const d = detail.toLowerCase();
  if (d.includes("fetch failed") || d.includes("network")) return hint;
  if (d.includes("invalid url")) return hint;
  if (d.includes("could not be resolved") || d.includes("enotfound")) {
    return "Supabase host cannot be resolved. NEXT_PUBLIC_SUPABASE_URL is wrong (DNS failed). Set your real project URL from Supabase dashboard.";
  }
  if (d.includes("host looks wrong")) return detail;
  if (d.includes("missing supabase env vars")) return detail;
  return detail;
}

function mapSignInError(message?: string): string {
  const raw = message?.trim() || "";
  const lower = raw.toLowerCase();

  if (!raw) return "Unable to sign in right now. Please try again.";
  if (lower.includes("email not confirmed") || lower.includes("email not verified")) {
    return "Please confirm your email before signing in. Check your inbox and spam folder.";
  }
  if (lower.includes("invalid login credentials") || lower.includes("invalid email") || lower.includes("invalid password")) {
    return "Invalid email or password";
  }

  return raw;
}

function isEmailConfirmationError(message?: string): boolean {
  const lower = (message || "").toLowerCase();
  return lower.includes("email not confirmed") || lower.includes("email not verified");
}

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
  let check;
  try {
    check = await isUsernameAvailable(username);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { error: friendlyAuthInfraMessage(msg) };
  }
  if (!check.available) {
    return { error: check.reason };
  }

  // Create Supabase auth user
  let authData;
  let authError;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName },
      },
    });
    authData = result.data;
    authError = result.error;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { error: friendlyAuthInfraMessage(msg) };
  }

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create account" };
  }

  const requiresEmailConfirmation = !authData.session;

  // Create profile in our profiles table
  const result = await createProfile(authData.user.id, username, email, displayName);
  if (result.error) {
    return { error: result.error };
  }

  if (requiresEmailConfirmation) {
    return {
      message:
        "Account created. Please confirm your email before signing in.",
    };
  }

  redirect("/dashboard");
}

export async function signInAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let error;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.signInWithPassword({ email, password });
    error = result.error;
  } catch (caught) {
    const msg = caught instanceof Error ? caught.message : "Unknown error";
    return { error: friendlyAuthInfraMessage(msg) };
  }

  if (error) {
    if (isEmailConfirmationError(error.message)) {
      try {
        const supabase = await createClient();
        await supabase.auth.resend({
          type: "signup",
          email,
        });
      } catch {
        // Best-effort resend only.
      }

      return {
        error:
          "Please confirm your email before signing in. We sent a new verification link. Check inbox/spam.",
      };
    }

    return { error: mapSignInError(error.message) };
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
  try {
    return await isUsernameAvailable(username);
  } catch {
    return {
      available: false,
      reason:
        "Username check unavailable right now. Verify Supabase URL/keys in environment.",
    };
  }
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
