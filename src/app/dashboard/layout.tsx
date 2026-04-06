import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";
import { tenantSiteUrl } from "@/lib/tenancy";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const host = (await headers()).get("host");
  const publicBlogUrl = tenantSiteUrl(user.username, host);

  return (
    <div className="min-h-screen bg-surface/50">
      <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-xl safe-top">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
              <span className="text-xs font-bold text-white">K</span>
            </div>
          </Link>

          <nav className="ml-2 flex gap-0.5 text-sm">
            <Link href="/dashboard" className="btn-ghost py-1.5 px-3 text-sm">Posts</Link>
            <Link href="/dashboard/settings" className="btn-ghost py-1.5 px-3 text-sm">Settings</Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a
              href={publicBlogUrl}
              className="hidden font-mono text-xs text-accent hover:underline sm:inline"
            >
              {user.username}.kotha.blog
            </a>
            <Link href="/dashboard/new" className="btn-primary text-xs py-2 px-4">
              New Post
            </Link>
            <div className="relative dropdown-trigger">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 text-xs font-semibold text-white focus-ring"
              >
                {user.displayName[0]?.toUpperCase()}
              </button>
              <div className="dropdown-menu w-48">
                <div className="px-3 py-2.5 border-b border-border-light">
                  <p className="text-sm font-semibold text-foreground truncate">{user.displayName}</p>
                  <p className="text-xs text-muted font-mono mt-0.5">@{user.username}</p>
                </div>
                <div className="py-1">
                  <Link href="/" className="dropdown-item">Hub Feed</Link>
                  <a href={publicBlogUrl} className="dropdown-item">
                    My blog
                  </a>
                </div>
                <div className="border-t border-border-light pt-1">
                  <form action={signOutAction}>
                    <button type="submit" className="dropdown-item dropdown-item-danger w-full">Sign out</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
