import fs from "fs";
import path from "path";
import crypto from "crypto";

// ── Types ──────────────────────────────────────────────────────
export type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
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
  readTime: number; // minutes
  createdAt: string;
  updatedAt: string;
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

type Database = {
  users: User[];
  posts: Post[];
  siteSettings: SiteSettings[];
  sessions: { token: string; userId: string; expiresAt: string }[];
};

// ── Reserved usernames that cannot be claimed ──────────────────
const RESERVED_SLUGS = new Set([
  "www", "app", "api", "admin", "dashboard", "mail", "ftp", "cdn",
  "static", "assets", "claim", "help", "support", "status", "blog",
  "docs", "staging", "dev", "test", "_next", "sign-in", "sign-up",
  "signin", "signup", "login", "logout", "register", "settings",
  "explore", "trending", "feed", "search", "new", "edit", "delete",
  "account", "profile", "notifications", "messages", "billing",
  "kotha", "about", "contact", "privacy", "terms", "legal",
]);

// ── File Path with atomic writes ───────────────────────────────
const DB_PATH = path.join(process.cwd(), "data", "db.json");

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readDb(): Database {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    const empty: Database = { users: [], posts: [], siteSettings: [], sessions: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

/** Atomic write: write to temp file first, then rename */
function writeDb(db: Database) {
  ensureDir();
  const tmpPath = DB_PATH + `.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2));
  fs.renameSync(tmpPath, DB_PATH);
}

function genId(): string {
  return crypto.randomUUID();
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.startsWith("scrypt$")) {
    const [, saltHex, hashHex] = storedHash.split("$");
    if (!saltHex || !hashHex) return false;

    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const derived = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(derived, expected);
  }

  // Backward compatibility for old demo hashes; auto-upgrade happens on login.
  const legacy = crypto.createHash("sha256").update("kotha_v1_" + password).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(legacy), Buffer.from(storedHash));
}

function hashSessionToken(token: string): string {
  const secret = process.env.SESSION_SECRET ?? "kotha_dev_session_secret_change_me";
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ── Subdomain Validation ───────────────────────────────────────
export function isReservedUsername(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

export function isUsernameAvailable(username: string): { available: boolean; reason?: string } {
  const slug = username.toLowerCase().trim();

  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
    return { available: false, reason: "Invalid format. Use lowercase letters, numbers, hyphens (1-63 chars)" };
  }
  if (slug.length < 2) {
    return { available: false, reason: "Username must be at least 2 characters" };
  }
  if (isReservedUsername(slug)) {
    return { available: false, reason: "This username is reserved" };
  }
  const db = readDb();
  if (db.users.find((u) => u.username === slug)) {
    return { available: false, reason: "This username is already taken" };
  }
  return { available: true };
}

// ── Users ──────────────────────────────────────────────────────
export function createUser(username: string, email: string, password: string, displayName: string): { user?: User; error?: string } {
  const slug = username.toLowerCase().trim();
  const check = isUsernameAvailable(slug);
  if (!check.available) return { error: check.reason };

  const db = readDb();
  const normalizedEmail = email.toLowerCase().trim();
  if (db.users.find((u) => u.email === normalizedEmail)) {
    return { error: "Email is already registered" };
  }

  const user: User = {
    id: genId(),
    username: slug,
    displayName: displayName.trim().slice(0, 80),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    bio: "",
    avatarUrl: "",
    joinedAt: new Date().toISOString(),
    followers: 0,
    following: 0,
  };
  db.users.push(user);

  const settings: SiteSettings = {
    userId: user.id,
    siteName: displayName + "'s Blog",
    tagline: "Welcome to my corner of the web",
    accentColor: "#0d9488",
    bgColor: "#fafaf9",
    textColor: "#1c1917",
    fontFamily: "serif",
    headerStyle: "centered",
    showBio: true,
    socialLinks: {},
  };
  db.siteSettings.push(settings);
  writeDb(db);
  return { user };
}

export function authenticateUser(email: string, password: string): User | null {
  const db = readDb();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user) return null;

  const ok = verifyPassword(password, user.passwordHash);
  if (!ok) return null;

  if (!user.passwordHash.startsWith("scrypt$")) {
    user.passwordHash = hashPassword(password);
    writeDb(db);
  }

  return user;
}

export function getUserById(id: string): User | null {
  return readDb().users.find((u) => u.id === id) ?? null;
}

export function getUserByUsername(username: string): User | null {
  return readDb().users.find((u) => u.username === username.toLowerCase()) ?? null;
}

export function updateUser(id: string, data: Partial<Pick<User, "displayName" | "bio" | "avatarUrl">>): User | null {
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...data };
  writeDb(db);
  return db.users[idx];
}

// ── Sessions ───────────────────────────────────────────────────
export function createSession(userId: string): string {
  const db = readDb();
  // Clean expired sessions while we're here
  const now = new Date();
  db.sessions = db.sessions.filter((s) => new Date(s.expiresAt) > now);

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.sessions.push({ token: tokenHash, userId, expiresAt });
  writeDb(db);
  return token;
}

export function getSession(token: string): { userId: string } | null {
  const tokenHash = hashSessionToken(token);
  const session = readDb().sessions.find(
    (s) => (s.token === tokenHash || s.token === token) && new Date(s.expiresAt) > new Date(),
  );
  return session ? { userId: session.userId } : null;
}

export function deleteSession(token: string) {
  const db = readDb();
  const tokenHash = hashSessionToken(token);
  db.sessions = db.sessions.filter((s) => s.token !== tokenHash && s.token !== token);
  writeDb(db);
}

// ── Posts ───────────────────────────────────────────────────────
export function createPost(
  userId: string, title: string, content: string,
  excerpt: string, coverImage: string, tags: string[],
  published: boolean, subtitle = ""
): Post {
  const db = readDb();
  const post: Post = {
    id: genId(),
    userId,
    slug: slugify(title) + "-" + genId().slice(0, 8),
    title,
    subtitle,
    excerpt: excerpt || title.slice(0, 160),
    content,
    coverImage,
    tags,
    published,
    claps: 0,
    views: 0,
    readTime: estimateReadTime(content),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.posts.push(post);
  writeDb(db);
  return post;
}

export function updatePost(
  id: string, userId: string,
  data: Partial<Pick<Post, "title" | "content" | "excerpt" | "coverImage" | "published" | "tags" | "subtitle">>
): Post | null {
  const db = readDb();
  const idx = db.posts.findIndex((p) => p.id === id && p.userId === userId);
  if (idx === -1) return null;
  const updated = {
    ...db.posts[idx],
    ...data,
    readTime: data.content ? estimateReadTime(data.content) : db.posts[idx].readTime,
    updatedAt: new Date().toISOString(),
  };
  db.posts[idx] = updated;
  writeDb(db);
  return updated;
}

export function deletePost(id: string, userId: string): boolean {
  const db = readDb();
  const len = db.posts.length;
  db.posts = db.posts.filter((p) => !(p.id === id && p.userId === userId));
  if (db.posts.length === len) return false;
  writeDb(db);
  return true;
}

export function getPostById(id: string): Post | null {
  return readDb().posts.find((p) => p.id === id) ?? null;
}

export function getPostBySlug(username: string, slug: string): (Post & { author: User }) | null {
  const db = readDb();
  const user = db.users.find((u) => u.username === username.toLowerCase());
  if (!user) return null;
  const post = db.posts.find((p) => p.userId === user.id && p.slug === slug && p.published);
  if (!post) return null;
  return { ...post, author: user };
}

export function incrementViews(postId: string): void {
  const db = readDb();
  const idx = db.posts.findIndex((p) => p.id === postId);
  if (idx !== -1) {
    db.posts[idx].views += 1;
    writeDb(db);
  }
}

export function getPostsByUser(userId: string, publishedOnly = false): Post[] {
  return readDb().posts
    .filter((p) => p.userId === userId && (!publishedOnly || p.published))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPublishedPostsByUsername(username: string): (Post & { author: User })[] {
  const db = readDb();
  const user = db.users.find((u) => u.username === username.toLowerCase());
  if (!user) return [];
  return db.posts
    .filter((p) => p.userId === user.id && p.published)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((p) => ({ ...p, author: user }));
}

export function getFeedPosts(limit = 20): (Post & { author: User })[] {
  const db = readDb();
  return db.posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((p) => ({ ...p, author: db.users.find((u) => u.id === p.userId)! }))
    .filter((p) => p.author);
}

export function clapPost(id: string): number {
  const db = readDb();
  const idx = db.posts.findIndex((p) => p.id === id);
  if (idx === -1) return 0;
  db.posts[idx].claps += 1;
  writeDb(db);
  return db.posts[idx].claps;
}

// ── Site Settings ──────────────────────────────────────────────
export function getSiteSettings(userId: string): SiteSettings | null {
  return readDb().siteSettings.find((s) => s.userId === userId) ?? null;
}

export function getSiteSettingsByUsername(username: string): SiteSettings | null {
  const db = readDb();
  const user = db.users.find((u) => u.username === username.toLowerCase());
  if (!user) return null;
  return db.siteSettings.find((s) => s.userId === user.id) ?? null;
}

export function updateSiteSettings(userId: string, data: Partial<Omit<SiteSettings, "userId">>): SiteSettings | null {
  const db = readDb();
  const idx = db.siteSettings.findIndex((s) => s.userId === userId);
  if (idx === -1) return null;
  db.siteSettings[idx] = { ...db.siteSettings[idx], ...data };
  writeDb(db);
  return db.siteSettings[idx];
}

// ── Stats ──────────────────────────────────────────────────────
export function getUserStats(userId: string): { totalPosts: number; totalClaps: number; totalViews: number } {
  const posts = readDb().posts.filter((p) => p.userId === userId);
  return {
    totalPosts: posts.filter((p) => p.published).length,
    totalClaps: posts.reduce((sum, p) => sum + p.claps, 0),
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
  };
}
