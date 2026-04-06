// ── Kotha Data Types ────────────────────────────────────────────
// Shared between screens — mirrors the web schema

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
  author?: User;
};

export type SiteSettings = {
  userId: string;
  siteName: string;
  tagline: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  fontFamily: "serif" | "sans" | "mono";
  headerStyle: "minimal" | "bold" | "centered";
  showBio: boolean;
  socialLinks: { twitter?: string; github?: string; website?: string };
};

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};
