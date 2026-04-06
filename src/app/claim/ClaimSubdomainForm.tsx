"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { rootDomain } from "@/lib/tenancy";

type CheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken" }
  | { status: "invalid" };

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 63);
}

export function ClaimSubdomainForm({
  initialSlug,
}: {
  initialSlug?: string;
}) {
  const [slug, setSlug] = useState(() =>
    initialSlug ? normalizeSlug(initialSlug) : "",
  );
  const [check, setCheck] = useState<CheckState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ siteUrl: string; slug: string } | null>(
    null,
  );
  const [existing, setExisting] = useState<{ slug: string; siteUrl: string } | null>(
    null,
  );

  const domain = useMemo(() => rootDomain(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/subdomains/me", { credentials: "include" });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { slug: string | null; siteUrl?: string };
      if (data.slug && data.siteUrl) {
        setExisting({ slug: data.slug, siteUrl: data.siteUrl });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      setCheck({ status: "idle" });
      return;
    }
    const t = window.setTimeout(async () => {
      setCheck({ status: "checking" });
      const res = await fetch(
        `/api/subdomains/check?slug=${encodeURIComponent(slug)}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        setCheck({ status: "invalid" });
        return;
      }
      const data = (await res.json()) as {
        available: boolean;
        reason?: string;
      };
      if (data.reason === "invalid_or_reserved") {
        setCheck({ status: "invalid" });
        return;
      }
      setCheck(
        data.available ? { status: "available" } : { status: "taken" },
      );
    }, 350);
    return () => window.clearTimeout(t);
  }, [slug]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!slug || check.status !== "available") return;
      setSubmitting(true);
      try {
        const res = await fetch("/api/subdomains/claim", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.error === "taken") setError("That name was just taken. Try another.");
          else if (data.error === "already_claimed")
            setError("You already have a subdomain. Only one free subdomain per browser for now.");
          else if (data.error === "no_visitor")
            setError("Enable cookies to claim a subdomain.");
          else if (data.error === "store_unavailable")
            setError("Claim storage is not available on this deployment. Use a host with a writable data directory or connect a database.");
          else setError("Could not claim. Try again.");
          return;
        }
        setSuccess({ siteUrl: data.siteUrl as string, slug: data.slug as string });
        setExisting({ slug: data.slug as string, siteUrl: data.siteUrl as string });
      } finally {
        setSubmitting(false);
      }
    },
    [slug, check.status],
  );

  if (existing && !success) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-6">
        <p className="text-sm font-medium text-zinc-800">Your subdomain</p>
        <p className="mt-2 font-mono text-lg text-zinc-900">
          {existing.slug}.{domain}
        </p>
        <a
          href={existing.siteUrl}
          className="mt-4 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Open your site
        </a>
        <p className="mt-4 text-xs text-zinc-500">
          One free subdomain per browser until accounts are added. Clearing cookies starts a fresh session.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-6">
        <p className="text-sm font-semibold text-emerald-900">You are live</p>
        <p className="mt-2 font-mono text-lg text-emerald-950">
          {success.slug}.{domain}
        </p>
        <a
          href={success.siteUrl}
          className="mt-4 inline-flex rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900"
        >
          Visit {success.slug}.{domain}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-zinc-700">
          Choose your subdomain
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-900/10">
          <input
            id="slug"
            name="slug"
            autoComplete="off"
            spellCheck={false}
            placeholder="your-name"
            value={slug}
            onChange={(e) => setSlug(normalizeSlug(e.target.value))}
            className="min-w-0 flex-1 border-0 bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400"
            maxLength={63}
          />
          <span className="shrink-0 text-sm text-zinc-400">.{domain}</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Letters, numbers, hyphens. 3–63 characters. Cannot start or end with a hyphen.
        </p>
      </div>

      <div className="min-h-[1.5rem] text-sm">
        {check.status === "checking" && (
          <span className="text-zinc-500">Checking availability…</span>
        )}
        {check.status === "available" && (
          <span className="font-medium text-emerald-700">Available</span>
        )}
        {check.status === "taken" && (
          <span className="text-amber-700">Already claimed</span>
        )}
        {check.status === "invalid" && slug.length > 0 && (
          <span className="text-red-600">Invalid or reserved name</span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || check.status !== "available"}
        className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Claiming…" : "Claim for free"}
      </button>
    </form>
  );
}
