import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { UserMenu } from "./UserMenu";

export async function HubHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[3.5rem] max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
            <span className="text-sm font-bold text-white">K</span>
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-foreground hidden sm:inline">
            Kotha
          </span>
        </Link>

        <div className="hidden flex-1 sm:block sm:max-w-sm ml-4">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search stories..."
              className="w-full rounded-full bg-surface py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted outline-none border border-transparent focus:border-border focus:bg-white transition-all"
            />
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-1">
          <Link
            href="/claim"
            className="btn-ghost hidden py-2 text-sm text-accent sm:inline-flex"
          >
            Subdomain
          </Link>
          {user ? (
            <>
              <Link href="/dashboard/new" className="btn-ghost text-sm hidden sm:inline-flex">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Write
              </Link>
              <Link href="/dashboard" className="btn-ghost p-2" aria-label="Dashboard">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Link>
              <UserMenu user={{ displayName: user.displayName, username: user.username }} />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="btn-ghost text-sm">
                Sign in
              </Link>
              <Link href="/sign-up" className="btn-primary px-4 py-2 text-sm">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
