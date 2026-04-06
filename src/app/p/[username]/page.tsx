import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserByUsername, getSiteSettingsByUsername, getPublishedPostsByUsername } from "@/lib/db";
import { isValidTenantSlug, hubBaseUrl } from "@/lib/tenancy";

type Props = { params: Promise<{ username: string }> };

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function TenantHomePage({ params }: Props) {
  const { username } = await params;
  if (!isValidTenantSlug(username)) notFound();

  const user = getUserByUsername(username);
  if (!user) {
    const signUpUrl = `${hubBaseUrl()}/sign-up?username=${encodeURIComponent(username)}`;
    return (
      <div className="min-h-screen bg-white px-6 py-24 text-center text-zinc-900">
        <p className="text-sm font-medium text-zinc-500">This subdomain is free</p>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight">
          {username}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-zinc-600">
          No blog here yet. If this should be yours, create an account with this
          username before someone else does.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={signUpUrl}
            className="inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sign up as {username}
          </a>
          <a
            href={`${hubBaseUrl()}/claim?slug=${encodeURIComponent(username)}`}
            className="text-sm text-zinc-600 underline decoration-zinc-300 hover:text-zinc-900"
          >
            Check another name
          </a>
        </div>
        <p className="mt-12 text-sm text-zinc-400">
          <a href={hubBaseUrl()} className="underline hover:text-zinc-600">
            ← Kotha feed
          </a>
        </p>
      </div>
    );
  }

  const settings = getSiteSettingsByUsername(username);
  const posts = getPublishedPostsByUsername(username);

  const font = settings?.fontFamily === "mono" ? "font-mono" : settings?.fontFamily === "sans" ? "font-sans" : "font-serif";
  const accent = settings?.accentColor || "#0d9488";
  const bg = settings?.bgColor || "#fafaf9";
  const text = settings?.textColor || "#1c1917";

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, color: text }}>
      {/* Header */}
      <header className={`px-6 ${settings?.headerStyle === "bold" ? "py-20 sm:py-28" : settings?.headerStyle === "minimal" ? "py-10" : "py-14 sm:py-20 text-center"}`}>
        <div className="mx-auto max-w-2xl">
          {settings?.headerStyle === "centered" && (
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              {user.displayName[0]?.toUpperCase()}
            </div>
          )}
          <h1 className={`${font} ${settings?.headerStyle === "bold" ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"} font-bold tracking-tight`}>
            {settings?.siteName || user.displayName + "'s Blog"}
          </h1>
          {settings?.tagline && (
            <p className="mt-2 text-base opacity-55" style={{ maxWidth: settings?.headerStyle === "centered" ? "24rem" : undefined, margin: settings?.headerStyle === "centered" ? "0.5rem auto 0" : undefined }}>
              {settings.tagline}
            </p>
          )}
          {settings?.showBio && user.bio && (
            <p className="mt-3 text-sm opacity-45 leading-relaxed max-w-md" style={{ margin: settings?.headerStyle === "centered" ? "0.75rem auto 0" : undefined }}>
              {user.bio}
            </p>
          )}
          {/* Social links */}
          {settings?.socialLinks && Object.values(settings.socialLinks).some(Boolean) && (
            <div className="mt-4 flex items-center gap-3" style={{ justifyContent: settings?.headerStyle === "centered" ? "center" : "flex-start" }}>
              {settings.socialLinks.twitter && (
                <a href={`https://twitter.com/${settings.socialLinks.twitter}`} className="opacity-40 hover:opacity-70 transition-opacity" target="_blank" rel="noopener noreferrer">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {settings.socialLinks.github && (
                <a href={`https://github.com/${settings.socialLinks.github}`} className="opacity-40 hover:opacity-70 transition-opacity" target="_blank" rel="noopener noreferrer">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              )}
              {settings.socialLinks.website && (
                <a href={settings.socialLinks.website} className="opacity-40 hover:opacity-70 transition-opacity" target="_blank" rel="noopener noreferrer">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </a>
              )}
            </div>
          )}
          <div className="mt-5">
            <a href={hubBaseUrl()} className="text-xs opacity-35 hover:opacity-60 transition-opacity" style={{ color: accent }}>
              ← Kotha Feed
            </a>
          </div>
        </div>
      </header>

      {/* Divider */}
      <div className="mx-auto max-w-2xl px-6">
        <div className="h-px" style={{ background: `${text}10` }} />
      </div>

      {/* Posts */}
      <main className="mx-auto max-w-2xl px-6 pb-20 pt-8">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base opacity-40">No posts published yet.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post, idx) => (
              <article key={post.id} className="group py-7 first:pt-0 border-b last:border-0" style={{ borderColor: `${text}08`, animationDelay: `${idx * 60}ms` }}>
                <Link href={`/p/${username}/${post.slug}`} className="block">
                  {post.coverImage && (
                    <div className="mb-4 aspect-[2.2/1] overflow-hidden rounded-xl" style={{ background: `${text}06` }}>
                      <img
                        src={post.coverImage}
                        alt=""
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    </div>
                  )}
                  <h2 className={`${font} text-xl sm:text-2xl font-bold tracking-tight group-hover:opacity-75 transition-opacity`}>
                    {post.title}
                  </h2>
                  {post.subtitle && (
                    <p className="mt-1 text-base opacity-50">{post.subtitle}</p>
                  )}
                  <p className="mt-2 text-sm opacity-50 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-2.5 text-xs opacity-35">
                    <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                    <span>·</span>
                    <span>{post.readTime} min read</span>
                    {post.claps > 0 && <><span>·</span><span>👏 {post.claps}</span></>}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t" style={{ borderColor: `${text}08` }}>
        <div className="mx-auto max-w-2xl flex items-center justify-between text-xs opacity-30">
          <span>© {new Date().getFullYear()} {user.displayName}</span>
          <a href={hubBaseUrl()} className="hover:opacity-100 transition-opacity">Powered by Kotha</a>
        </div>
      </footer>
    </div>
  );
}
