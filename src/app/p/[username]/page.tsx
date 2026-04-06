import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserByUsername, getSiteSettingsByUsername, getPublishedPostsByUsername } from "@/lib/db";
import { isValidTenantSlug, hubBaseUrl } from "@/lib/tenancy";
import { getTheme, type ThemeConfig } from "@/lib/themes";

type Props = { params: Promise<{ username: string }> };

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function TenantHomePage({ params }: Props) {
  const { username } = await params;
  if (!isValidTenantSlug(username)) notFound();

  const user = await getUserByUsername(username);
  if (!user) notFound();

  const settings = await getSiteSettingsByUsername(username);
  const posts = await getPublishedPostsByUsername(username);
  const theme = getTheme(settings?.theme || "minimal");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(theme, settings) }} />
      <div className="themed-blog" style={{ minHeight: "100vh" }}>
        {/* ── Navigation ── */}
        <nav className="themed-nav">
          <div className="themed-nav-inner">
            <div className="themed-logo">
              <div className="themed-avatar">
                {user.displayName[0]?.toUpperCase()}
              </div>
              <span className="themed-site-name">
                {settings?.siteName || user.displayName + "'s Blog"}
              </span>
            </div>
            <a href={hubBaseUrl()} className="themed-hub-link">
              Kotha Feed ↗
            </a>
          </div>
        </nav>

        {/* ── Hero Header ── */}
        <header className="themed-header">
          <div className="themed-header-inner">
            {settings?.headerStyle !== "minimal" && (
              <div className="themed-hero-avatar">
                {user.displayName[0]?.toUpperCase()}
              </div>
            )}
            <h1 className="themed-title">
              {settings?.siteName || user.displayName + "'s Blog"}
            </h1>
            {settings?.tagline && (
              <p className="themed-tagline">{settings.tagline}</p>
            )}
            {settings?.showBio && user.bio && (
              <p className="themed-bio">{user.bio}</p>
            )}
            {/* Social Links */}
            {settings?.socialLinks && Object.values(settings.socialLinks).some(Boolean) && (
              <div className="themed-socials">
                {settings.socialLinks.twitter && (
                  <a href={`https://twitter.com/${settings.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="themed-social-link">
                    <svg className="themed-social-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {settings.socialLinks.github && (
                  <a href={`https://github.com/${settings.socialLinks.github}`} target="_blank" rel="noopener noreferrer" className="themed-social-link">
                    <svg className="themed-social-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                )}
                {settings.socialLinks.website && (
                  <a href={settings.socialLinks.website} target="_blank" rel="noopener noreferrer" className="themed-social-link">
                    <svg className="themed-social-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </header>

        {/* ── Posts List ── */}
        <main className="themed-main">
          {posts.length === 0 ? (
            <div className="themed-empty">
              <p>No posts published yet.</p>
            </div>
          ) : (
            <div className="themed-posts">
              {posts.map((post, idx) => (
                <article key={post.id} className="themed-post-card" style={{ animationDelay: `${idx * 60}ms` }}>
                  <Link href={`/p/${username}/${post.slug}`} className="themed-post-link">
                    {post.coverImage && (
                      <div className="themed-post-cover">
                        <img src={post.coverImage} alt="" className="themed-post-image" />
                      </div>
                    )}
                    <h2 className="themed-post-title">{post.title}</h2>
                    {post.subtitle && (
                      <p className="themed-post-subtitle">{post.subtitle}</p>
                    )}
                    <p className="themed-post-excerpt">{post.excerpt}</p>
                    <div className="themed-post-meta">
                      <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                      <span>·</span>
                      <span>{post.readTime} min read</span>
                      {post.claps > 0 && <><span>·</span><span>👏 {post.claps}</span></>}
                    </div>
                    {post.tags.length > 0 && (
                      <div className="themed-post-tags">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="themed-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </main>

        {/* ── Footer ── */}
        <footer className="themed-footer">
          <div className="themed-footer-inner">
            <span>© {new Date().getFullYear()} {user.displayName}</span>
            <a href={hubBaseUrl()} className="themed-footer-link">Powered by Kotha</a>
          </div>
        </footer>
      </div>
    </>
  );
}

// ── Dynamic CSS Generation ─────────────────────────────────────
function generateThemeCSS(theme: ThemeConfig, settings: ReturnType<typeof getSiteSettingsByUsername> extends Promise<infer T> ? T : never): string {
  const accent = settings?.accentColor || theme.accent;

  return `
    .themed-blog {
      background: ${theme.bg};
      color: ${theme.text};
      font-family: ${theme.bodyFont};
      -webkit-font-smoothing: antialiased;
    }

    /* ── Nav ── */
    .themed-nav {
      position: sticky;
      top: 0;
      z-index: 40;
      ${theme.navStyle === "glass"
        ? `background: ${theme.bg}cc; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);`
        : theme.navStyle === "solid"
        ? `background: ${theme.bgSecondary}; border-bottom: 1px solid ${theme.border};`
        : `background: transparent;`}
    }
    .themed-nav-inner {
      max-width: 48rem;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .themed-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .themed-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 0.5rem;
      background: ${theme.avatarGradient};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: #fff;
    }
    .themed-site-name {
      font-family: ${theme.headingFont};
      font-size: 1rem;
      font-weight: 700;
      color: ${theme.text};
    }
    .themed-hub-link {
      font-size: 0.75rem;
      color: ${theme.textSecondary};
      text-decoration: none;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .themed-hub-link:hover { opacity: 1; }

    /* ── Header ── */
    .themed-header {
      padding: ${settings?.headerStyle === "bold" ? "5rem 1.5rem" : settings?.headerStyle === "minimal" ? "2.5rem 1.5rem" : "3.5rem 1.5rem"};
      text-align: ${settings?.headerStyle === "centered" ? "center" : "left"};
      ${theme.headerBg.startsWith("linear-gradient") ? `background: ${theme.headerBg}; color: ${theme.headerText};` : ""}
    }
    .themed-header-inner {
      max-width: 48rem;
      margin: 0 auto;
    }
    .themed-hero-avatar {
      width: 4rem;
      height: 4rem;
      border-radius: 1.25rem;
      background: ${theme.avatarGradient};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1.25rem;
      ${theme.id === "neon-vapor" ? `box-shadow: 0 0 30px ${theme.accent}40;` : ""}
    }
    .themed-title {
      font-family: ${theme.headingFont};
      font-size: ${settings?.headerStyle === "bold" ? "2.75rem" : "1.75rem"};
      font-weight: 700;
      color: ${theme.headerBg.startsWith("linear-gradient") ? theme.headerText : theme.text};
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .themed-tagline {
      margin-top: 0.5rem;
      font-size: 1rem;
      color: ${theme.headerBg.startsWith("linear-gradient") ? theme.headerAccent : theme.textSecondary};
      opacity: 0.7;
      ${settings?.headerStyle === "centered" ? "max-width: 24rem; margin-left: auto; margin-right: auto;" : ""}
    }
    .themed-bio {
      margin-top: 0.75rem;
      font-size: 0.875rem;
      color: ${theme.textSecondary};
      opacity: 0.6;
      line-height: 1.6;
      max-width: 28rem;
      ${settings?.headerStyle === "centered" ? "margin-left: auto; margin-right: auto;" : ""}
    }

    /* ── Socials ── */
    .themed-socials {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1rem;
      ${settings?.headerStyle === "centered" ? "justify-content: center;" : ""}
    }
    .themed-social-link {
      color: ${theme.textSecondary};
      opacity: 0.5;
      transition: opacity 0.2s;
    }
    .themed-social-link:hover { opacity: 1; }
    .themed-social-icon { width: 1rem; height: 1rem; }

    /* ── Main ── */
    .themed-main {
      max-width: 48rem;
      margin: 0 auto;
      padding: 0 1.5rem 5rem;
    }
    .themed-main::before {
      content: "";
      display: block;
      height: 1px;
      background: ${theme.border};
      margin-bottom: 2rem;
    }

    /* ── Posts ── */
    .themed-posts { }
    .themed-post-card {
      padding: 1.75rem 0;
      border-bottom: 1px solid ${theme.border};
      animation: themeCardFadeIn 0.4s ease-out both;
    }
    .themed-post-card:last-child { border-bottom: none; }
    .themed-post-link {
      display: block;
      text-decoration: none;
      color: inherit;
      transition: opacity 0.2s;
    }
    .themed-post-link:hover { opacity: 0.8; }
    .themed-post-cover {
      aspect-ratio: 2.2 / 1;
      overflow: hidden;
      border-radius: 0.75rem;
      margin-bottom: 1rem;
      background: ${theme.border};
    }
    .themed-post-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.7s ease;
    }
    .themed-post-link:hover .themed-post-image { transform: scale(1.02); }
    .themed-post-title {
      font-family: ${theme.headingFont};
      font-size: 1.375rem;
      font-weight: 700;
      color: ${theme.text};
      letter-spacing: -0.01em;
      line-height: 1.3;
    }
    .themed-post-subtitle {
      margin-top: 0.25rem;
      font-size: 1rem;
      color: ${theme.textSecondary};
    }
    .themed-post-excerpt {
      margin-top: 0.5rem;
      font-size: 0.9375rem;
      color: ${theme.textSecondary};
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .themed-post-meta {
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: ${theme.textSecondary};
      opacity: 0.6;
    }
    .themed-post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin-top: 0.75rem;
    }
    .themed-tag {
      background: ${theme.tagBg};
      color: ${theme.tagText};
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 500;
    }

    /* ── Empty ── */
    .themed-empty {
      text-align: center;
      padding: 4rem 0;
      color: ${theme.textSecondary};
      opacity: 0.5;
    }

    /* ── Footer ── */
    .themed-footer {
      background: ${theme.footerBg};
      border-top: 1px solid ${theme.border};
      padding: 2rem 1.5rem;
    }
    .themed-footer-inner {
      max-width: 48rem;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: ${theme.footerText};
    }
    .themed-footer-link {
      color: ${theme.footerText};
      text-decoration: none;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .themed-footer-link:hover { opacity: 1; }

    /* ── Neon Vapor Specials ── */
    ${theme.id === "neon-vapor" ? `
      .themed-blog { background: radial-gradient(ellipse at top, #1a0a3e 0%, #0d0221 60%); }
      .themed-post-title { text-shadow: 0 0 20px ${theme.accent}30; }
      .themed-hero-avatar { animation: neonPulse 3s ease-in-out infinite; }
      @keyframes neonPulse {
        0%, 100% { box-shadow: 0 0 20px ${theme.accent}40; }
        50% { box-shadow: 0 0 40px ${theme.accent}60, 0 0 80px ${theme.gradientTo}20; }
      }
    ` : ""}

    /* ── Dark Noir Specials ── */
    ${theme.id === "dark-noir" ? `
      .themed-post-title { font-weight: 800; letter-spacing: -0.03em; }
      .themed-header { border-bottom: 1px solid ${theme.border}; }
    ` : ""}

    /* ── Vintage Press Specials ── */
    ${theme.id === "vintage-press" ? `
      .themed-post-card { padding-left: 1rem; padding-right: 1rem; }
      .themed-post-title { font-style: italic; }
      .themed-main::before {
        height: 3px;
        background: ${theme.text};
        margin-bottom: 2.5rem;
      }
      .themed-main::after {
        content: "❧";
        display: block;
        text-align: center;
        font-size: 1.5rem;
        color: ${theme.textSecondary};
        opacity: 0.3;
        margin-top: 2rem;
      }
    ` : ""}

    /* ── Ocean Breeze Specials ── */
    ${theme.id === "ocean-breeze" ? `
      .themed-header {
        background: linear-gradient(135deg, #0077b6, #00a8e8);
        color: #ffffff;
        border-radius: 0 0 2rem 2rem;
        padding-bottom: 3rem;
      }
      .themed-title { color: #ffffff; }
      .themed-tagline { color: #90e0ef; }
      .themed-bio { color: rgba(255,255,255,0.6); }
    ` : ""}

    /* ── Forest Specials ── */
    ${theme.id === "forest" ? `
      .themed-blog { background: linear-gradient(180deg, #f0f4ed 0%, #e8ede5 100%); }
      .themed-hero-avatar { border: 2px solid #52b788; }
    ` : ""}

    @keyframes themeCardFadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Custom CSS from user ── */
    ${settings?.customCss || ""}
  `;
}
