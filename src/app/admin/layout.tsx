import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isUserAdmin } from "@/lib/db";
import { signOutAction } from "@/lib/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const admin = await isUserAdmin(user.id);
  if (!admin) redirect("/");

  return (
    <div className="min-h-screen bg-[#0c0f1a]">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0c0f1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="text-sm font-bold text-white tracking-wide">ADMIN</span>
          </Link>

          <nav className="ml-2 flex gap-0.5 text-sm">
            <Link href="/admin" className="rounded-lg px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/users" className="rounded-lg px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              Users
            </Link>
            <Link href="/admin/posts" className="rounded-lg px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              Posts
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              ← Back to site
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="text-xs text-red-400/70 hover:text-red-400 transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
