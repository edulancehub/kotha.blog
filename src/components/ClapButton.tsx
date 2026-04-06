"use client";

import { useState, useTransition } from "react";
import { clapPostAction } from "@/lib/actions";

export function ClapButton({
  postId,
  initialClaps,
  accentColor = "#0f766e",
}: {
  postId: string;
  initialClaps: number;
  accentColor?: string;
}) {
  const [claps, setClaps] = useState(initialClaps);
  const [isPending, startTransition] = useTransition();
  const [animating, setAnimating] = useState(false);

  function handleClap() {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    startTransition(async () => {
      const newCount = await clapPostAction(postId);
      setClaps(newCount);
    });
  }

  return (
    <button
      onClick={handleClap}
      disabled={isPending}
      className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 disabled:opacity-50"
      style={{ color: accentColor }}
    >
      <span
        className={`text-xl ${animating ? "scale-125" : "scale-100"}`}
        style={{ transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        👏
      </span>
      <span className="font-medium">{claps}</span>
    </button>
  );
}
