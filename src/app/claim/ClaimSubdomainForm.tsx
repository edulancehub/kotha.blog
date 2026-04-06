"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

export function ClaimSubdomainForm({ initialSlug }: { initialSlug?: string }) {
  const [slug, setSlug] = useState(() =>
    initialSlug ? normalizeSlug(initialSlug) : "",
  );
  const [check, setCheck] = useState<CheckState>({ status: "idle" });

  const domain = useMemo(() => rootDomain(), []);

  useEffect(() => {
    if (!slug || slug.length < 2) {
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

  const canContinue = check.status === "available" && slug.length >= 2;
  const signUpHref = `/sign-up?username=${encodeURIComponent(slug)}`;

  return (
    <div className="space-y-6">
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
          Same as your username when you create an account. At least 2 characters;
          letters, numbers, hyphens; cannot start or end with a hyphen.
        </p>
      </div>

      <div className="min-h-[1.5rem] text-sm">
        {check.status === "checking" && (
          <span className="text-zinc-500">Checking availability…</span>
        )}
        {check.status === "available" && (
          <span className="font-medium text-emerald-700">Available — create your account to lock it in</span>
        )}
        {check.status === "taken" && (
          <span className="text-amber-700">Already taken — try another name</span>
        )}
        {check.status === "invalid" && slug.length > 0 && (
          <span className="text-red-600">Invalid or reserved name</span>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={canContinue ? signUpHref : "#"}
          className={`inline-flex justify-center rounded-full px-6 py-2.5 text-center text-sm font-medium text-white ${
            canContinue
              ? "bg-zinc-900 hover:bg-zinc-800"
              : "cursor-not-allowed bg-zinc-300 pointer-events-none opacity-70"
          }`}
          aria-disabled={!canContinue}
        >
          Continue to sign up
        </Link>
        <Link
          href="/sign-in"
          className="text-center text-sm text-zinc-600 underline decoration-zinc-300 hover:text-zinc-900 sm:text-left"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
