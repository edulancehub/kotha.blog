import Link from "next/link";
import { getAdminStats } from "@/lib/db";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "from-blue-500 to-blue-600" },
    { label: "Total Posts", value: stats.totalPosts, icon: "📝", color: "from-emerald-500 to-emerald-600" },
    { label: "Published", value: stats.totalPublished, icon: "✅", color: "from-green-500 to-green-600" },
    { label: "Comments", value: stats.totalComments, icon: "💬", color: "from-purple-500 to-purple-600" },
    { label: "Total Views", value: stats.totalViews, icon: "👁️", color: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-white/40">Overview of Kotha.blog platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{s.icon}</span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">{s.label}</span>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/users"
          className="group rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.05] transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Manage Users</h3>
              <p className="text-xs text-white/30">View and manage all subdomain owners</p>
            </div>
          </div>
          <p className="text-xs text-white/20 group-hover:text-white/40 transition-colors">
            {stats.totalUsers} registered users →
          </p>
        </Link>

        <Link
          href="/admin/posts"
          className="group rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.05] transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Manage Posts</h3>
              <p className="text-xs text-white/30">View and moderate all blog posts</p>
            </div>
          </div>
          <p className="text-xs text-white/20 group-hover:text-white/40 transition-colors">
            {stats.totalPosts} total posts →
          </p>
        </Link>

        <Link
          href="/"
          className="group rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.05] transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">View Site</h3>
              <p className="text-xs text-white/30">Go to the public Kotha feed</p>
            </div>
          </div>
          <p className="text-xs text-white/20 group-hover:text-white/40 transition-colors">
            Open hub →
          </p>
        </Link>
      </div>
    </div>
  );
}
