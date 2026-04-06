import { headers } from "next/headers";
import Link from "next/link";
import type { User } from "@/lib/db";
import { rootDomain, tenantSiteUrl } from "@/lib/tenancy";

export async function LoggedInSubdomainCard({ user }: { user: User }) {
  const host = (await headers()).get("host");
  const siteUrl = tenantSiteUrl(user.username, host);
  const domain = rootDomain();

  return (
    <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/90 to-emerald-50/80 p-6">
      <p className="text-sm font-medium text-teal-900">Your subdomain</p>
      <p className="mt-2 font-mono text-lg font-semibold text-zinc-900">
        {user.username}.{domain}
      </p>
      <p className="mt-2 text-sm text-zinc-600">
        You claimed this when you signed up. Publish posts from the dashboard to
        fill your site and the hub feed.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={siteUrl}
          className="inline-flex rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Open your site
        </a>
        <Link
          href="/dashboard"
          className="inline-flex rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
