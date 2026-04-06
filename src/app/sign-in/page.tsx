"use client";

import { useActionState } from "react";
import { signInAction } from "@/lib/actions";
import Link from "next/link";

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(signInAction, null);

  return (
    <div className="flex min-h-screen">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-md text-white animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm mb-8">
            <span className="text-xl font-bold">K</span>
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-4 text-base text-teal-100 leading-relaxed">
            Your blog is waiting. Continue writing, customize your design, and grow your audience.
          </p>
          <div className="mt-10 rounded-xl bg-white/8 backdrop-blur-sm p-6 border border-white/10">
            <p className="text-teal-50 text-sm leading-relaxed italic">
              &ldquo;Every word you write is a bridge to someone who needs to hear it.&rdquo;
            </p>
            <p className="mt-3 text-teal-200/60 text-xs">— The Kotha Team</p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-[26rem] animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 lg:hidden mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">Kotha</span>
          </Link>

          <h2 className="font-serif text-3xl font-bold text-foreground tracking-tight">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-muted-dark">
            Enter your credentials to access your blog
          </p>

          {state?.error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 animate-fade-in">
              {state.error}
            </div>
          )}

          <form action={formAction} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="input-label">Email</label>
              <input id="email" name="email" type="email" required className="input-field" placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <input id="password" name="password" type="password" required className="input-field" placeholder="Your password" />
            </div>

            <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-[0.9375rem] mt-2">
              {pending ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-4 text-center text-sm text-muted-dark">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-semibold text-accent hover:underline">
              Create your blog
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
