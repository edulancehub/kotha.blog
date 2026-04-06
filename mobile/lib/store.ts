// ── Local Data Store ────────────────────────────────────────────
// Mock data for UI development. Will be replaced with Supabase calls later.

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User, Post } from "./types";

const CURRENT_USER_KEY = "kotha_current_user";
const POSTS_KEY = "kotha_posts";

// ── Seed Data ───────────────────────────────────────────────────
const SEED_USERS: User[] = [
  {
    id: "u1",
    username: "sarah",
    displayName: "Sarah Chen",
    email: "sarah@kotha.blog",
    bio: "Writing about technology, design, and the spaces between.",
    avatarUrl: "",
    joinedAt: "2025-11-15T00:00:00Z",
    followers: 842,
    following: 156,
  },
  {
    id: "u2",
    username: "arjun",
    displayName: "Arjun Mehta",
    email: "arjun@kotha.blog",
    bio: "Researcher. Runner. Reader.",
    avatarUrl: "",
    joinedAt: "2025-12-01T00:00:00Z",
    followers: 391,
    following: 78,
  },
  {
    id: "u3",
    username: "elena",
    displayName: "Elena Rossi",
    email: "elena@kotha.blog",
    bio: "Exploring the intersection of art and code.",
    avatarUrl: "",
    joinedAt: "2026-01-10T00:00:00Z",
    followers: 1203,
    following: 211,
  },
];

const SEED_POSTS: Post[] = [
  {
    id: "p1",
    userId: "u1",
    slug: "the-architecture-of-attention",
    title: "The Architecture of Attention",
    subtitle: "How software shapes the way we think",
    excerpt:
      "In an age of infinite content, the most precious commodity isn't information — it's attention. Here's how the tools we build shape the way we focus.",
    content:
      "<p>In an age of infinite content, the most precious commodity isn't information — it's attention.</p><p>Every interface we design, every notification we send, every algorithm we tune — they all compete for the same finite resource: a human being's capacity to notice and care.</p><p>The question isn't whether technology shapes attention. It's whether we're shaping it intentionally.</p><h2>The Attention Stack</h2><p>Think of attention as a stack, much like a network protocol stack. At the bottom, there's raw sensory input — light, sound, vibration. Each layer above adds context, meaning, and intention.</p><p>Great software respects every layer. Poor software hijacks the lowest ones.</p><h2>Designing for Depth</h2><p>The best reading experiences — and Kotha aspires to be one — create conditions for deep engagement. That means thoughtful typography, restrained color, generous whitespace, and above all, an absence of interruption.</p><p>Writing deserves architecture. Not just decoration.</p>",
    coverImage: "",
    tags: ["Design", "Technology", "Focus"],
    published: true,
    claps: 127,
    views: 2340,
    readTime: 4,
    createdAt: "2026-04-01T10:00:00Z",
    updatedAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "p2",
    userId: "u2",
    slug: "running-as-metaphor",
    title: "Running as Metaphor",
    subtitle: "What 10,000 kilometers taught me about building products",
    excerpt:
      "There's a reason so many founders run. The discipline of putting one foot in front of the other — when you're tired, when it's raining — translates directly into startup life.",
    content:
      "<p>I started running during the hardest year of my startup. Revenue was flat, two co-founders had left, and I was running on fumes — metaphorically.</p><p>Then I started running literally. First a kilometer. Then five. Then marathons.</p><h2>The Parallels</h2><p>Building a product and running an ultra-marathon share the same core challenge: managing effort over time. You can't sprint the whole way. You have to find a sustainable pace.</p><p>The runners who finish aren't always the fastest. They're the ones who know when to walk, when to eat, and when to dig deep. Same with startups.</p><h2>The Wall</h2><p>Every marathon has a wall — usually around kilometer 30. Every startup has one too. It's the moment when you question everything. The trick is not to stop. Just slow down. Adjust. Keep moving.</p>",
    coverImage: "",
    tags: ["Life", "Startup", "Running"],
    published: true,
    claps: 89,
    views: 1560,
    readTime: 3,
    createdAt: "2026-03-28T14:00:00Z",
    updatedAt: "2026-03-28T14:00:00Z",
  },
  {
    id: "p3",
    userId: "u3",
    slug: "generative-art-and-the-new-canvas",
    title: "Generative Art and the New Canvas",
    subtitle: "Code as creative medium",
    excerpt:
      "When I first wrote a for-loop that drew something beautiful on screen, I knew I'd found my medium. Here's why code is the most exciting canvas of the 21st century.",
    content:
      "<p>My first generative piece was an accident. A bug in a physics simulation created patterns I never could have designed intentionally. That's the magic of code as art — it surprises you.</p><h2>The New Renaissance</h2><p>We're living through a creative renaissance. Tools like Processing, p5.js, and TouchDesigner have democratized computational art. But the real breakthrough is in thinking.</p><p>When artists think in systems — in rules, randomness, and emergence — they create work that is alive. It breathes, responds, evolves.</p><h2>Beyond the Screen</h2><p>Generative art is moving off screens and into architecture, fashion, and biology. Algorithms are designing buildings, weaving textiles, and growing crystals. The canvas is everywhere now.</p>",
    coverImage: "",
    tags: ["Art", "Technology", "Creative Coding"],
    published: true,
    claps: 234,
    views: 4100,
    readTime: 5,
    createdAt: "2026-04-03T08:00:00Z",
    updatedAt: "2026-04-03T08:00:00Z",
  },
  {
    id: "p4",
    userId: "u1",
    slug: "on-simplicity",
    title: "On Simplicity",
    subtitle: "The hardest feature to ship",
    excerpt:
      "Simplicity isn't the absence of complexity — it's the mastery of it. Here's how I think about reducing without losing meaning.",
    content:
      "<p>\"Simplicity is the ultimate sophistication.\" Leonardo da Vinci said it, and every product designer has quoted it. But few have achieved it.</p><h2>Why Simple is Hard</h2><p>Making something simple requires understanding it deeply. You have to know which parts are essential and which are merely familiar. Those are not the same thing.</p><p>A chef's knife is simple. A Swiss Army knife is complicated. Both have their place, but only one can julienne a carrot beautifully.</p><h2>The Subtraction Game</h2><p>Great design is about subtraction. Every feature you remove makes the remaining features more powerful. Every word you delete makes the remaining words more meaningful.</p><p>Kotha was designed with this philosophy. We didn't build a CMS with a hundred options. We built a writing tool with one great editor and the courage to leave the rest out.</p>",
    coverImage: "",
    tags: ["Design", "Product", "Philosophy"],
    published: true,
    claps: 312,
    views: 5200,
    readTime: 3,
    createdAt: "2026-04-05T16:00:00Z",
    updatedAt: "2026-04-05T16:00:00Z",
  },
  {
    id: "p5",
    userId: "u3",
    slug: "the-loneliness-of-open-source",
    title: "The Loneliness of Open Source",
    subtitle: "Maintaining a popular project is beautiful and brutal",
    excerpt:
      "Thousands of developers depend on my library. Most days that's motivating. Some days it's crushing. Here's what nobody tells you about open-source fame.",
    content:
      "<p>My library has 12,000 GitHub stars. I should be proud. Most days I am.</p><p>But on the hard days — when there are 47 open issues, three urgent PRs, and a breaking change in a dependency — it feels like drowning in public.</p><h2>The Invisible Contract</h2><p>When you open-source something popular, there's an unspoken contract: people expect you to maintain it. Forever. For free. They're polite about it, usually. But the expectation is always there.</p><h2>Finding Balance</h2><p>I've learned to set boundaries. I close issues that aren't actionable. I say no to scope creep. I take breaks without apologizing. The project survives. So do I.</p><p>If you maintain an open-source project, remember: your mental health is not a bug to be fixed in the next release.</p>",
    coverImage: "",
    tags: ["Open Source", "Mental Health", "Engineering"],
    published: true,
    claps: 456,
    views: 7800,
    readTime: 4,
    createdAt: "2026-04-06T09:00:00Z",
    updatedAt: "2026-04-06T09:00:00Z",
  },
];

// ── Helpers ─────────────────────────────────────────────────────
function enrichPostsWithAuthors(posts: Post[]): Post[] {
  return posts.map((p) => ({
    ...p,
    author: SEED_USERS.find((u) => u.id === p.userId),
  }));
}

// ── Public API ──────────────────────────────────────────────────

export async function getFeedPosts(): Promise<Post[]> {
  return enrichPostsWithAuthors(
    [...SEED_POSTS]
      .filter((p) => p.published)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  );
}

export async function getPostById(id: string): Promise<Post | null> {
  const post = SEED_POSTS.find((p) => p.id === id);
  if (!post) return null;
  return {
    ...post,
    author: SEED_USERS.find((u) => u.id === post.userId),
  };
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  return enrichPostsWithAuthors(
    SEED_POSTS.filter((p) => p.userId === userId).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
}

export async function getTrendingPosts(): Promise<Post[]> {
  return enrichPostsWithAuthors(
    [...SEED_POSTS]
      .filter((p) => p.published)
      .sort((a, b) => b.claps - a.claps)
  );
}

export async function searchPosts(query: string): Promise<Post[]> {
  const q = query.toLowerCase();
  return enrichPostsWithAuthors(
    SEED_POSTS.filter(
      (p) =>
        p.published &&
        (p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)))
    )
  );
}

export async function getUserById(id: string): Promise<User | null> {
  return SEED_USERS.find((u) => u.id === id) || null;
}

export async function getUserByUsername(
  username: string
): Promise<User | null> {
  return SEED_USERS.find((u) => u.username === username) || null;
}

// ── Auth (local mock — will swap for Supabase) ─────────────────

export async function signIn(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  // Mock: accept any user with matching email, password ≥ 6 chars
  const user = SEED_USERS.find((u) => u.email === email);
  if (!user) return { error: "No account found with that email" };
  if (password.length < 6) return { error: "Invalid password" };

  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { user };
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

  const existing = SEED_USERS.find(
    (u) => u.username === username || u.email === email
  );
  if (existing) return { error: "Username or email already taken" };

  const newUser: User = {
    id: `u${Date.now()}`,
    username: username.toLowerCase(),
    displayName,
    email,
    bio: "",
    avatarUrl: "",
    joinedAt: new Date().toISOString(),
    followers: 0,
    following: 0,
  };

  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return { user: newUser };
}

export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}

export async function getCurrentUser(): Promise<User | null> {
  const json = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!json) return null;
  try {
    return JSON.parse(json) as User;
  } catch {
    return null;
  }
}

export async function clapPost(postId: string): Promise<number> {
  const post = SEED_POSTS.find((p) => p.id === postId);
  if (post) {
    post.claps += 1;
    return post.claps;
  }
  return 0;
}
