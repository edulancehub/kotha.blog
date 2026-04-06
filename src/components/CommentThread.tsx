"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCommentAction } from "@/lib/actions";
import type { PostCommentView } from "@/lib/db";
import Link from "next/link";

function formatCommentDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommentThread({
  postId,
  comments,
  signedIn,
  signInHref = "/sign-in",
}: {
  postId: string;
  comments: PostCommentView[];
  signedIn: boolean;
  signInHref?: string;
}) {
  return (
    <section className="mt-14 border-t pt-10" style={{ borderColor: "inherit" }}>
      <h2 className="text-lg font-semibold tracking-tight">Comments</h2>
      <p className="mt-1 text-sm opacity-50">
        Kotha readers can discuss this story here.
      </p>

      <ul className="mt-6 space-y-5">
        {comments.length === 0 ? (
          <li className="text-sm opacity-45">No comments yet — start the thread.</li>
        ) : (
          comments.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-current/15 bg-current/[0.03] px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline gap-2 text-sm">
                <span className="font-semibold">
                  {c.author.displayName}
                  {c.author.username ? (
                    <span className="font-normal opacity-50">
                      {" "}
                      @{c.author.username}
                    </span>
                  ) : null}
                </span>
                <time className="text-xs opacity-40" dateTime={c.createdAt}>
                  {formatCommentDate(c.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed opacity-90">
                {c.body}
              </p>
            </li>
          ))
        )}
      </ul>

      <div className="mt-8">
        {signedIn ? (
          <CommentForm postId={postId} />
        ) : (
          <p className="text-sm opacity-55">
            <Link href={signInHref} className="font-medium underline hover:opacity-80">
              Sign in
            </Link>{" "}
            to leave a comment.
          </p>
        )}
      </div>
    </section>
  );
}

function CommentForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(addCommentAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      <label className="block text-sm font-medium opacity-70">
        Add a comment
        <textarea
          name="body"
          required
          rows={4}
          maxLength={4000}
          placeholder="Share your thoughts…"
          className="mt-2 w-full rounded-xl border border-current/20 bg-transparent px-3 py-2 text-sm text-inherit placeholder:opacity-40 outline-none focus:border-current/40"
        />
      </label>
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full px-4 py-2 text-sm font-medium opacity-90 ring-1 ring-current/30 hover:bg-current/10 disabled:opacity-50"
      >
        {pending ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
