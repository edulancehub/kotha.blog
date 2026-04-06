import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getSiteSettingsByUsername, getUserByUsername, incrementViews } from "@/lib/db";
import { isValidTenantSlug, hubBaseUrl } from "@/lib/tenancy";
import { ClapButton } from "@/components/ClapButton";
import { sanitizePostHtml } from "@/lib/security";

type Props = { params: Promise<{ username: string; slug: string }> };

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { username, slug } = await params;
  if (!isValidTenantSlug(username)) notFound();

  const post = getPostBySlug(username, slug);
  if (!post) notFound();
  const safePostHtml = sanitizePostHtml(post.content);

  // Count view
  incrementViews(post.id);

  const user = getUserByUsername(username);
  const settings = getSiteSettingsByUsername(username);

  const font = settings?.fontFamily === "mono" ? "font-mono" : settings?.fontFamily === "sans" ? "font-sans" : "font-serif";
  const accent = settings?.accentColor || "#0d9488";
  const bg = settings?.bgColor || "#fafaf9";
  const text = settings?.textColor || "#1c1917";

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, color: text }}>
      {/* Nav */}
      <header className="px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link href={`/p/${username}`} className={`${font} text-base font-semibold opacity-70 hover:opacity-100 transition-opacity`}>
            {settings?.siteName || user?.displayName + "'s Blog"}
          </Link>
          <a href={hubBaseUrl()} className="text-xs opacity-35 hover:opacity-60 transition-opacity">Kotha</a>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-6 pb-20 pt-6 animate-fade-in">
        {/* Author */}
        <div className="mb-8 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            {post.author.displayName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{post.author.displayName}</p>
            <div className="flex items-center gap-2 text-xs opacity-50">
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              <span>·</span>
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className={`${font} text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-[1.15]`}>
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="mt-3 text-xl opacity-55 leading-relaxed">{post.subtitle}</p>
        )}

        {/* Cover */}
        {post.coverImage && (
          <div className="mt-8 aspect-[2/1] overflow-hidden rounded-xl" style={{ background: `${text}06` }}>
            <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full px-3 py-1 text-xs font-medium opacity-50" style={{ background: `${text}06` }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className={`prose-content mt-8 text-[1.0625rem] leading-[1.85] ${font === "font-serif" ? "font-serif" : ""}`}
          dangerouslySetInnerHTML={{ __html: safePostHtml }}
        />

        {/* Actions bar */}
        <div className="mt-12 flex items-center justify-between py-4 border-y" style={{ borderColor: `${text}10` }}>
          <ClapButton postId={post.id} initialClaps={post.claps} accentColor={accent} />
          <div className="flex items-center gap-3 opacity-40">
            <button className="hover:opacity-100 transition-opacity" title="Share">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            <button className="hover:opacity-100 transition-opacity" title="Bookmark">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Author card */}
        <div className="mt-8 p-6 rounded-xl" style={{ background: `${accent}06` }}>
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              {post.author.displayName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{post.author.displayName}</p>
              {user?.bio && <p className="mt-1 text-sm opacity-55 leading-relaxed">{user.bio}</p>}
              <Link
                href={`/p/${username}`}
                className="mt-2 inline-block text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: accent }}
              >
                View all posts →
              </Link>
            </div>
          </div>
        </div>
      </article>

      <footer className="px-6 py-8 border-t" style={{ borderColor: `${text}08` }}>
        <div className="mx-auto max-w-2xl flex items-center justify-between text-xs opacity-30">
          <Link href={`/p/${username}`} className="hover:opacity-100 transition-opacity">{settings?.siteName || user?.displayName + "'s Blog"}</Link>
          <a href={hubBaseUrl()} className="hover:opacity-100 transition-opacity">Powered by Kotha</a>
        </div>
      </footer>
    </div>
  );
}
