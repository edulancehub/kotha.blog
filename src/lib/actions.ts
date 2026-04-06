"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createUser,
  authenticateUser,
  createSession,
  deleteSession,
  createPost,
  updatePost,
  deletePost,
  updateSiteSettings,
  updateUser,
  clapPost,
  isUsernameAvailable,
} from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  isValidEmail,
  normalizeEmail,
  sanitizeOptionalHttpUrl,
  sanitizePostHtml,
  validatePasswordStrength,
} from "@/lib/security";

const SESSION_COOKIE = "kotha_session";

// ── Auth Actions ───────────────────────────────────────────────
export async function signUpAction(_prev: unknown, formData: FormData) {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const email = normalizeEmail((formData.get("email") as string) ?? "");
  const password = formData.get("password") as string;
  const displayName = (formData.get("displayName") as string)?.trim();

  if (!username || !email || !password || !displayName) {
    return { error: "All fields are required" };
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address" };
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return { error: passwordError };
  }

  // Check username availability (with reserved word + uniqueness check)
  const check = isUsernameAvailable(username);
  if (!check.available) {
    return { error: check.reason };
  }

  const result = createUser(username, email, password, displayName);
  if (result.error) {
    return { error: result.error };
  }

  const token = createSession(result.user!.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  redirect("/dashboard");
}

export async function signInAction(_prev: unknown, formData: FormData) {
  const email = normalizeEmail((formData.get("email") as string) ?? "");
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (!isValidEmail(email)) {
    return { error: "Invalid email or password" };
  }

  const user = authenticateUser(email, password);
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const token = createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  redirect("/dashboard");
}

export async function signOutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    deleteSession(token);
    cookieStore.delete(SESSION_COOKIE);
  }
  redirect("/");
}

// ── Check Username (for live validation) ───────────────────────
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
  const coverImage = sanitizeOptionalHttpUrl((formData.get("coverImage") as string) ?? "") || "";
  const tagsStr = (formData.get("tags") as string)?.trim() || "";
  const published = formData.get("published") === "true";

  if (!title || !content) {
    return { error: "Title and content are required" };
  }

  const safeContent = sanitizePostHtml(content);
  const tags = tagsStr.split(",").map((t) => t.trim().slice(0, 24)).filter(Boolean).slice(0, 8);
  createPost(user.id, title.slice(0, 120), safeContent, (excerpt || title).slice(0, 220), coverImage, tags, published, subtitle.slice(0, 160));
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
  const coverImage = sanitizeOptionalHttpUrl((formData.get("coverImage") as string) ?? "") || "";
  const tagsStr = (formData.get("tags") as string)?.trim() || "";
  const published = formData.get("published") === "true";

  if (!id || !title || !content) {
    return { error: "Title and content are required" };
  }

  const safeContent = sanitizePostHtml(content);
  const tags = tagsStr.split(",").map((t) => t.trim().slice(0, 24)).filter(Boolean).slice(0, 8);
  updatePost(id, user.id, {
    title: title.slice(0, 120),
    subtitle: subtitle.slice(0, 160),
    content: safeContent,
    excerpt: (excerpt || title).slice(0, 220),
    coverImage,
    tags,
    published,
  });
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deletePostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  deletePost(formData.get("id") as string, user.id);
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function clapPostAction(postId: string) {
  return clapPost(postId);
}

// ── Site Settings Actions ──────────────────────────────────────
export async function updateSiteSettingsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const data = {
    siteName: (formData.get("siteName") as string)?.trim() || user.displayName + "'s Blog",
    tagline: (formData.get("tagline") as string)?.trim() || "",
    accentColor: (formData.get("accentColor") as string) || "#0d9488",
    bgColor: (formData.get("bgColor") as string) || "#fafaf9",
    textColor: (formData.get("textColor") as string) || "#1c1917",
    fontFamily: (formData.get("fontFamily") as "serif" | "sans" | "mono") || "serif",
    headerStyle: (formData.get("headerStyle") as "minimal" | "bold" | "centered") || "centered",
    showBio: formData.get("showBio") === "true",
    socialLinks: {
      twitter: sanitizeOptionalHttpUrl((formData.get("twitter") as string) ?? ""),
      github: sanitizeOptionalHttpUrl((formData.get("github") as string) ?? ""),
      website: sanitizeOptionalHttpUrl((formData.get("website") as string) ?? ""),
    },
  };

  updateSiteSettings(user.id, data);
  revalidatePath("/dashboard/settings");
}

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const displayName = (formData.get("displayName") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();

  if (displayName) {
    updateUser(user.id, { displayName, bio: bio || "" });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}
