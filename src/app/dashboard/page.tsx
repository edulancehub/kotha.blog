import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getPostsByUser, getUserStats, getCommentCountsForPostIds } from "@/lib/db";
import { deletePostAction } from "@/lib/actions";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function DashboardPage() {
  const user = (await getCurrentUser())!;
  const posts = await getPostsByUser(user.id);
  const stats = await getUserStats(user.id);
  const commentCounts = await getCommentCountsForPostIds(posts.map((p) => p.id));

  return (
    <div className="animate-fade-in">
      {/* Welcome + Stats */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground tracking-tight">
              Welcome back, {user.displayName.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-muted-dark">
              <Link href={`/p/${user.username}`} className="font-mono text-accent hover:underline">{user.username}.kotha.blog</Link>
            </p>
          </div>
          <Link href="/dashboard/new" className="btn-primary text-sm shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Post
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="stat-card animate-fade-in animate-delay-100">
            <div className="stat-value">{stats.totalPosts}</div>
            <div className="stat-label">Published</div>
          </div>
          <div className="stat-card animate-fade-in animate-delay-200">
            <div className="stat-value">{stats.totalViews}</div>
            <div className="stat-label">Post views</div>
          </div>
          <div className="stat-card animate-fade-in animate-delay-300">
            <div className="stat-value">{stats.totalComments}</div>
            <div className="stat-label">Comments</div>
          </div>
          <div className="stat-card animate-fade-in" style={{ animationDelay: "240ms" }}>
            <div className="stat-value">{stats.totalClaps}</div>
            <div className="stat-label">Claps</div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Your Posts</h2>
        <span className="text-xs text-muted">{posts.length} total</span>
      </div>

      {posts.length === 0 ? (
        <div className="card-flat text-center py-16 px-6 animate-fade-in">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle">
            <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-bold text-foreground">Write your first post</h3>
          <p className="mt-1.5 text-sm text-muted-dark max-w-xs mx-auto">Share your thoughts with the world</p>
          <Link href="/dashboard/new" className="btn-primary mt-4 inline-flex text-sm">
            Start writing
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="card p-4 sm:p-5 flex items-start gap-4 animate-fade-in"
              style={{ animationDelay: `${(i + 4) * 60}ms` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${post.published ? "badge-success" : "badge-warning"}`}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-muted">{formatDate(post.createdAt)}</span>
                </div>
                <Link
                  href={post.published ? `/p/${user.username}/${post.slug}` : `/dashboard/edit/${post.id}`}
                  className="font-serif text-base font-bold text-foreground hover:text-accent transition-colors line-clamp-1"
                >
                  {post.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted-dark line-clamp-1">{post.excerpt}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                  <span>{post.readTime} min read</span>
                  <span>· {post.views ?? 0} views</span>
                  <span>· {commentCounts[post.id] ?? 0} comments</span>
                  {post.claps > 0 && <span>· 👏 {post.claps}</span>}
                  {post.tags.length > 0 && (
                    <span className="rounded-full bg-surface px-2 py-0.5">{post.tags[0]}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Link href={`/dashboard/edit/${post.id}`} className="btn-ghost text-xs py-1.5 px-2.5">
                  Edit
                </Link>
                <form action={deletePostAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <button type="submit" className="btn-ghost text-xs py-1.5 px-2.5 text-danger hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
