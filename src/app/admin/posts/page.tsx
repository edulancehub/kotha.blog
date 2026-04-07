import Link from "next/link";
import { getAllPosts } from "@/lib/db";
import { adminDeletePostAction } from "@/lib/actions";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminPostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">All Posts</h1>
          <p className="mt-1 text-sm text-white/40">{posts.length} total posts across all subdomains</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white/30">Post Title</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white/30">Author</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-white/30">Status</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-white/30">Views</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white/30">Created</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-white/30">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3 max-w-xs">
                    <Link
                      href={`/p/${post.author.username}/${post.slug}`}
                      className="text-sm font-medium text-white hover:text-blue-400 transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    {post.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 text-[10px] font-bold text-white">
                        {post.author.displayName[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/60 truncate">{post.author.displayName}</p>
                        <p className="text-[10px] text-white/25 font-mono">@{post.author.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {post.published ? (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-400">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-400">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-white/40">{(post.views ?? 0).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/30">{formatDate(post.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={adminDeletePostAction} className="inline">
                      <input type="hidden" name="postId" value={post.id} />
                      <button
                        type="submit"
                        className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          if (!confirm(`Delete "${post.title}" by @${post.author.username}? This action is permanent.`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete Post
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20 text-white/20 text-sm">
          No posts created yet.
        </div>
      )}
    </div>
  );
}
