"use client";

import { useActionState, useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signUpAction, checkUsernameAction } from "@/lib/actions";
import Link from "next/link";

type CheckStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function normalizeUsernameInput(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 63);
}

export function SignUpClient() {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(signUpAction, null);
  const [username, setUsername] = useState("");
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [checkMessage, setCheckMessage] = useState("");
  const [, startCheck] = useTransition();

  useEffect(() => {
    const fromQuery = searchParams.get("username");
    if (fromQuery) {
      setUsername(normalizeUsernameInput(fromQuery));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!username || username.length < 2) {
      setCheckStatus("idle");
      setCheckMessage("");
      return;
    }

    setCheckStatus("checking");
    const timer = setTimeout(() => {
      startCheck(async () => {
        const result = await checkUsernameAction(username);
        if (result.available) {
          setCheckStatus("available");
          setCheckMessage(`${username}.kotha.blog is available!`);
        } else {
          setCheckStatus(
            result.reason?.includes("reserved") ||
              result.reason?.includes("Invalid")
              ? "invalid"
              : "taken",
          );
          setCheckMessage(result.reason || "Unavailable");
        }
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-md animate-fade-in text-white">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <span className="text-xl font-bold">K</span>
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight">
            Your words deserve
            <br />
            their own address
          </h1>
          <p className="mt-4 text-base leading-relaxed text-teal-100">
            Create a beautiful blog, claim your personal subdomain, and join a
            community of writers.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: "🌐", text: "Get yourname.kotha.blog instantly" },
              { icon: "🎨", text: "Customize colors, fonts, and layout" },
              { icon: "✍️", text: "Write with a beautiful editor" },
              { icon: "📡", text: "Appear on the global feed" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 text-sm text-teal-50"
              >
                <span className="shrink-0 text-lg">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-6 sm:p-12">
        <div className="animate-fade-in w-full max-w-[26rem]">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 lg:hidden"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">
              Kotha
            </span>
          </Link>

          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Create your blog
          </h2>
          <p className="mt-2 text-sm text-muted-dark">
            Claim your subdomain and start writing in minutes
          </p>

          {state?.error && (
            <div className="mt-4 animate-fade-in rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <form action={formAction} className="mt-7 space-y-4">
            <div>
              <label htmlFor="displayName" className="input-label">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                className="input-field"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label htmlFor="username" className="input-label">
                Username (subdomain)
              </label>
              <div className="flex items-stretch">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  pattern="[a-z0-9][a-z0-9-]{0,61}[a-z0-9]?"
                  className="input-field flex-1 rounded-r-none border-r-0"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) =>
                    setUsername(normalizeUsernameInput(e.target.value))
                  }
                />
                <span className="flex items-center whitespace-nowrap rounded-r-xl border border-l-0 border-border bg-surface px-3 text-sm text-muted">
                  .kotha.blog
                </span>
              </div>
              <div className="mt-1.5 h-5 text-xs">
                {checkStatus === "checking" && (
                  <span className="text-muted flex items-center gap-1">
                    <svg
                      className="h-3 w-3 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Checking...
                  </span>
                )}
                {checkStatus === "available" && (
                  <span className="flex items-center gap-1 font-medium text-success">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {checkMessage}
                  </span>
                )}
                {(checkStatus === "taken" || checkStatus === "invalid") && (
                  <span className="flex items-center gap-1 font-medium text-danger">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {checkMessage}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="input-field"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={
                username.length < 2 ||
                pending ||
                checkStatus === "taken" ||
                checkStatus === "invalid" ||
                checkStatus === "checking" ||
                (username.length >= 2 && checkStatus !== "available")
              }
              className="btn-primary mt-2 w-full py-3 text-[0.9375rem]"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating your blog...
                </span>
              ) : (
                "Claim your subdomain"
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-4 text-center text-sm text-muted-dark">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-accent hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
