import Link from "next/link";
import { getAllUsers } from "@/lib/db";
import { adminDeleteUserAction } from "@/lib/actions";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Users & Subdomains</h1>
          <p className="mt-1 text-sm text-white/40">{users.length} total registered users</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white/30">User</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white/30">Subdomain</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-white/30">Posts</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white/30">Joined</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white/30">Role</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-white/30">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 text-xs font-bold text-white">
                        {user.displayName[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                        <p className="text-xs text-white/30 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/p/${user.username}`} className="font-mono text-xs text-blue-400 hover:underline">
                      {user.username}.kotha.blog
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-white/60">{user.postCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/40">{formatDate(user.joinedAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!user.isAdmin && (
                      <form action={adminDeleteUserAction} className="inline">
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            if (!confirm(`Delete ${user.username}.kotha.blog? This removes their account, all posts, and their subdomain permanently.`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Remove Subdomain
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-20 text-white/20 text-sm">
          No users registered yet.
        </div>
      )}
    </div>
  );
}
