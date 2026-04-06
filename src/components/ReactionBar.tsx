"use client";

import { useState, useTransition } from "react";
import { reactToPostAction } from "@/lib/actions";
import type { ReactionKind } from "@/lib/db";
import Link from "next/link";

type Summary = Record<ReactionKind, number>;

const BTNS: { kind: ReactionKind; label: string; emoji: string }[] = [
  { kind: "like", label: "Like", emoji: "👍" },
  { kind: "dislike", label: "Dislike", emoji: "👎" },
  { kind: "love", label: "Love", emoji: "❤️" },
];

export function ReactionBar({
  postId,
  initialSummary,
  initialMine,
  signedIn,
  signInHref = "/sign-in",
}: {
  postId: string;
  initialSummary: Summary;
  initialMine: ReactionKind | null;
  signedIn: boolean;
  signInHref?: string;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [mine, setMine] = useState<ReactionKind | null>(initialMine);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onPick(kind: ReactionKind) {
    if (!signedIn) return;
    setErr(null);
    start(async () => {
      const r = await reactToPostAction(postId, kind);
      if (r.error) setErr(r.error);
      else if (r.summary) {
        setSummary(r.summary);
        setMine(r.mine ?? null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {BTNS.map(({ kind, label, emoji }) => {
          const active = mine === kind;
          return (
            <button
              key={kind}
              type="button"
              disabled={!signedIn || pending}
              onClick={() => onPick(kind)}
              title={signedIn ? `${label} (tap again to remove)` : "Sign in to react"}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-current bg-black/[0.06] font-medium"
                  : "border-black/10 opacity-80 hover:opacity-100 hover:bg-black/[0.04]"
              } ${!signedIn ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span aria-hidden>{emoji}</span>
              <span>{summary[kind]}</span>
            </button>
          );
        })}
      </div>
      {!signedIn && (
        <p className="text-xs opacity-50">
          <Link href={signInHref} className="underline hover:opacity-80">
            Sign in
          </Link>{" "}
          to like, dislike, or love this post.
        </p>
      )}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}
