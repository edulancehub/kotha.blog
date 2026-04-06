import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPostBySlug,
  getSiteSettingsByUsername,
  getUserByUsername,
  incrementViews,
  getReactionSummary,
  getUserReaction,
  listCommentsForPost,
} from "@/lib/db";
import { isValidTenantSlug, hubBaseUrl } from "@/lib/tenancy";
import { ClapButton } from "@/components/ClapButton";
import { BlogAdStrip } from "@/components/BlogAdStrip";
import { ReactionBar } from "@/components/ReactionBar";
import { CommentThread } from "@/components/CommentThread";
import { sanitizePostHtml } from "@/lib/security";
import { getTheme } from "@/lib/themes";
import { getCurrentUser } from "@/lib/auth";

type Props = { params: Promise<{ username: string; slug: string }> };

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { username, slug } = await params;
  if (!isValidTenantSlug(username)) notFound();

  const post = await getPostBySlug(username, slug);
  if (!post) notFound();
  const safePostHtml = sanitizePostHtml(post.content);

  const viewCount = await incrementViews(post.id);

  const user = await getUserByUsername(username);
  const settings = await getSiteSettingsByUsername(username);
  const theme = getTheme(settings?.theme || "minimal");

  const sessionUser = await getCurrentUser();
  const [reactionSummary, comments] = await Promise.all([
    getReactionSummary(post.id),
    listCommentsForPost(post.id),
  ]);
  const myReaction =
    sessionUser ? await getUserReaction(post.id, sessionUser.id) : null;

  const showAds = settings?.adsEnabled === true;
  const signInHref = `${hubBaseUrl()}/sign-in`;

  const accent = settings?.accentColor || theme.accent;
  const bg = theme.bg;
  const text = theme.text;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .post-page { background: ${bg}; color: ${text}; font-family: ${theme.bodyFont}; min-height: 100vh; }
        .post-page a { color: ${accent}; }
        .post-nav { padding: 1rem 1.5rem; ${theme.navStyle === "glass" ? `background: ${bg}cc; backdrop-filter: blur(20px);` : theme.navStyle === "solid" ? `background: ${theme.bgSecondary}; border-bottom: 1px solid ${theme.border};` : ""} position: sticky; top: 0; z-index: 40; }
        .post-nav-inner { max-width: 42rem; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .post-nav-title { font-family: ${theme.headingFont}; font-size: 0.9375rem; font-weight: 600; color: ${text}; text-decoration: none; opacity: 0.7; transition: opacity 0.2s; }
        .post-nav-title:hover { opacity: 1; }
        .post-hub { font-size: 0.75rem; color: ${theme.textSecondary}; text-decoration: none; opacity: 0.4; transition: opacity 0.2s; }
        .post-hub:hover { opacity: 0.8; }
        .post-article { max-width: 42rem; margin: 0 auto; padding: 1.5rem 1.5rem 5rem; animation: postFadeIn 0.5s ease-out; }
        .post-author { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
        .post-avatar { width: 2.5rem; height: 2.5rem; border-radius: 50%; background: ${theme.avatarGradient}; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.875rem; flex-shrink: 0; }
        .post-author-name { font-size: 0.875rem; font-weight: 600; color: ${text}; }
        .post-author-meta { font-size: 0.75rem; color: ${theme.textSecondary}; opacity: 0.5; margin-top: 2px; }
        .post-title { font-family: ${theme.headingFont}; font-size: 2.25rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; color: ${text}; ${theme.id === "neon-vapor" ? `text-shadow: 0 0 30px ${accent}30;` : ""} }
        .post-subtitle { margin-top: 0.75rem; font-size: 1.25rem; color: ${theme.textSecondary}; opacity: 0.55; line-height: 1.5; }
        .post-cover { margin-top: 2rem; aspect-ratio: 2/1; overflow: hidden; border-radius: 0.75rem; background: ${theme.border}; }
        .post-cover img { width: 100%; height: 100%; object-fit: cover; }
        .post-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem; }
        .post-tag { background: ${theme.tagBg}; color: ${theme.tagText}; padding: 0.125rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
        .post-content { margin-top: 2rem; font-size: 1.0625rem; line-height: 1.85; }
        .post-content h2 { font-family: ${theme.headingFont}; font-size: 1.5rem; font-weight: 700; margin: 2rem 0 0.75rem; letter-spacing: -0.01em; }
        .post-content h3 { font-family: ${theme.headingFont}; font-size: 1.25rem; font-weight: 600; margin: 1.75rem 0 0.5rem; }
        .post-content p { margin-bottom: 1.25rem; }
        .post-content blockquote { border-left: 3px solid ${theme.quoteBorder}; padding-left: 1.25rem; margin: 1.5rem 0; color: ${theme.quoteText}; font-style: italic; }
        .post-content pre, .post-content code { background: ${theme.codeBg}; color: ${theme.codeText}; }
        .post-content pre { border-radius: 0.5rem; padding: 1rem 1.25rem; overflow-x: auto; margin: 1.5rem 0; }
        .post-content code { padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.9em; }
        .post-content pre code { padding: 0; background: transparent; }
        .post-content a { color: ${accent}; text-decoration: underline; text-underline-offset: 2px; }
        .post-content img { max-width: 100%; border-radius: 0.5rem; margin: 1.5rem 0; }
        .post-actions { margin-top: 3rem; display: flex; flex-direction: column; gap: 1.25rem; padding: 1.25rem 0; border-top: 1px solid ${theme.border}; border-bottom: 1px solid ${theme.border}; }
        .post-actions-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .post-author-card { margin-top: 2rem; padding: 1.5rem; border-radius: 0.75rem; background: ${theme.cardBg}; border: 1px solid ${theme.border}; }
        .post-author-card-inner { display: flex; align-items: flex-start; gap: 1rem; }
        .post-author-card .post-avatar { width: 3rem; height: 3rem; font-size: 1.125rem; }
        .post-footer { padding: 2rem 1.5rem; border-top: 1px solid ${theme.border}; background: ${theme.footerBg}; }
        .post-footer-inner { max-width: 42rem; margin: 0 auto; display: flex; justify-content: space-between; font-size: 0.75rem; color: ${theme.footerText}; }
        .post-footer a { color: ${theme.footerText}; text-decoration: none; opacity: 0.6; transition: opacity 0.2s; }
        .post-footer a:hover { opacity: 1; }
        @keyframes postFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        ${theme.id === "neon-vapor" ? `.post-page { background: radial-gradient(ellipse at top, #1a0a3e 0%, #0d0221 60%); }` : ""}
        ${theme.id === "ocean-breeze" ? `.post-nav { background: linear-gradient(135deg, #0077b6, #00a8e8); } .post-nav-title { color: #fff; } .post-hub { color: #90e0ef; }` : ""}
        ${theme.id === "vintage-press" ? `.post-title { font-style: italic; }` : ""}
      `}} />

      <div className="post-page">
        <header className="post-nav">
          <div className="post-nav-inner">
            <Link href={`/p/${username}`} className="post-nav-title">
              {settings?.siteName || user?.displayName + "'s Blog"}
            </Link>
            <a href={hubBaseUrl()} className="post-hub">Kotha</a>
          </div>
        </header>

        {showAds && settings?.adSlotHeader ? (
          <BlogAdStrip html={settings.adSlotHeader} />
        ) : null}

        <article className="post-article">
          <div className="post-author">
            <div className="post-avatar">{post.author.displayName[0]?.toUpperCase()}</div>
            <div>
              <p className="post-author-name">{post.author.displayName}</p>
              <div className="post-author-meta">
                <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time> · {post.readTime} min read ·{" "}
                {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
              </div>
            </div>
          </div>

          <h1 className="post-title">{post.title}</h1>
          {post.subtitle && <p className="post-subtitle">{post.subtitle}</p>}

          {post.coverImage && (
            <div className="post-cover"><img src={post.coverImage} alt="" /></div>
          )}

          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag) => <span key={tag} className="post-tag">{tag}</span>)}
            </div>
          )}

          <div className="post-content" dangerouslySetInnerHTML={{ __html: safePostHtml }} />

          {showAds && settings?.adSlotInArticle ? (
            <BlogAdStrip html={settings.adSlotInArticle} />
          ) : null}

          <div className="post-actions">
            <ReactionBar
              postId={post.id}
              initialSummary={reactionSummary}
              initialMine={myReaction}
              signedIn={!!sessionUser}
              signInHref={signInHref}
            />
            <div className="post-actions-row">
              <ClapButton postId={post.id} initialClaps={post.claps} accentColor={accent} />
              <div style={{ display: "flex", gap: "0.75rem", opacity: 0.4 }}>
                <button type="button" title="Share">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                </button>
              </div>
            </div>
          </div>

          <CommentThread
            postId={post.id}
            comments={comments}
            signedIn={!!sessionUser}
            signInHref={signInHref}
          />

          <div className="post-author-card">
            <div className="post-author-card-inner">
              <div className="post-avatar">{post.author.displayName[0]?.toUpperCase()}</div>
              <div>
                <p style={{ fontWeight: 600 }}>{post.author.displayName}</p>
                {user?.bio && <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", opacity: 0.55, lineHeight: 1.5 }}>{user.bio}</p>}
                <Link href={`/p/${username}`} style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: accent }}>
                  View all posts →
                </Link>
              </div>
            </div>
          </div>
        </article>

        {showAds && settings?.adSlotFooter ? (
          <BlogAdStrip html={settings.adSlotFooter} />
        ) : null}

        <footer className="post-footer">
          <div className="post-footer-inner">
            <Link href={`/p/${username}`}>{settings?.siteName || user?.displayName + "'s Blog"}</Link>
            <a href={hubBaseUrl()}>Powered by Kotha</a>
          </div>
        </footer>
      </div>
    </>
  );
}
