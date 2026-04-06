import Link from "next/link";
import { headers } from "next/headers";
import { signOutAction } from "@/lib/actions";
import { tenantSiteUrl } from "@/lib/tenancy";

export async function UserMenu({
  user,
}: {
  user: { displayName: string; username: string };
}) {
  const host = (await headers()).get("host");
  const blogUrl = tenantSiteUrl(user.username, host);

  return (
    <div className="relative dropdown-trigger">
      <button
        type="button"
        className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 text-xs font-semibold text-white focus-ring"
        aria-expanded="false"
        aria-haspopup="true"
      >
        {user.displayName[0]?.toUpperCase()}
      </button>
      <div className="dropdown-menu w-52">
        <div className="px-3 py-2.5 border-b border-border-light">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.displayName}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted">
            @{user.username}
          </p>
        </div>
        <div className="py-1">
          <Link href="/dashboard" className="dropdown-item">
            Dashboard
          </Link>
          <Link href="/dashboard/settings" className="dropdown-item">
            Settings
          </Link>
          <a href={blogUrl} className="dropdown-item">
            My blog
          </a>
          <Link href="/claim" className="dropdown-item">
            Your subdomain
          </Link>
        </div>
        <div className="border-t border-border-light pt-1">
          <form action={signOutAction}>
            <button
              type="submit"
              className="dropdown-item dropdown-item-danger w-full"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
