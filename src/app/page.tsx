import { FeedArticleCard } from "@/components/hub/FeedArticleCard";
import { HubHeader } from "@/components/hub/HubHeader";
import { getFeedPosts } from "@/lib/db";
import Link from "next/link";

export default async function HubHomePage() {
  const feedPosts = await getFeedPosts(20);

  return (
    <div className="min-h-full bg-white text-foreground">
      <HubHeader />

      <div className="mx-auto flex max-w-6xl gap-10 px-4 pb-20 pt-6 sm:px-6">
        {/* ── Left Sidebar ── */}
        <aside className="hidden w-48 shrink-0 lg:block">
          <nav className="sticky top-[4.5rem] space-y-0.5 text-sm">
            {[
              { label: "Feed", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", active: true },
              { label: "Trending", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
              { label: "Latest", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map(({ label, icon, active }) => (
              <button
                key={label}
                type="button"
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                  active ? "bg-accent-subtle text-accent font-medium" : "text-muted-dark hover:bg-surface hover:text-foreground"
                }`}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                </svg>
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-xl bg-gradient-to-br from-accent-subtle to-emerald-50 border border-teal-100 p-4">
            <p className="text-xs font-bold text-accent-hover uppercase tracking-wider">Start Writing</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-dark">
              Claim your domain and publish beautiful stories.
            </p>
            <Link href="/sign-up" className="mt-3 inline-block text-xs font-semibold text-accent hover:underline">
              Create your blog →
            </Link>
          </div>
        </aside>

        {/* ── Main Feed ── */}
        <main className="min-w-0 flex-1">
          {/* Hero Banner */}
          <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 p-8 sm:p-10 text-white animate-fade-in relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Where ideas find<br className="hidden sm:block" /> their voice
              </h1>
              <p className="mt-3 max-w-md text-teal-100 text-sm sm:text-base leading-relaxed">
                Claim <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono">yourname.kotha.blog</code>{" "}
                — write, customize your site, and reach readers worldwide.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/sign-up" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-800 shadow-md hover:shadow-lg hover:bg-teal-50 transition-all">
                  Start writing — it&apos;s free
                </Link>
              </div>
            </div>
          </div>

          {/* Feed Tabs */}
          <div id="feed" className="mb-2 flex gap-1 text-sm">
            {["For you", "Featured", "Latest"].map((tab, i) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-4 py-2 font-medium transition-all ${
                  i === 0
                    ? "bg-foreground text-white"
                    : "text-muted-dark hover:bg-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Feed Content */}
          {feedPosts.length > 0 ? (
            <div className="divide-y divide-border-light">
              {feedPosts.map((item, i) => (
                <FeedArticleCard key={item.id} item={item} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center animate-fade-in">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-subtle">
                <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground">No stories yet</h2>
              <p className="mt-2 text-sm text-muted-dark max-w-xs mx-auto">
                Be the first to publish! Sign up, claim your subdomain, and start writing.
              </p>
              <Link href="/sign-up" className="btn-primary mt-5 inline-flex text-sm">
                Create your blog
              </Link>
            </div>
          )}
        </main>

        {/* ── Right Sidebar ── */}
        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-[4.5rem] space-y-6">
            {/* Staff Picks */}
            <section className="animate-fade-in animate-delay-100">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
                Staff picks
              </h2>
              <div className="space-y-4">
                {[
                  { author: "Editorial", title: "Welcome to Kotha", date: "Apr 6" },
                  { author: "Product", title: "Roadmap: themes, blocks, and RSS", date: "Apr 1" },
                  { author: "Community", title: "How to customize your site", date: "Mar 15" },
                ].map((p) => (
                  <div key={p.title} className="group cursor-pointer">
                    <p className="text-[11px] font-medium text-muted">{p.author}</p>
                    <p className="mt-0.5 font-serif text-sm font-bold leading-snug text-foreground group-hover:text-accent transition-colors">
                      {p.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">{p.date}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Topics */}
            <section className="animate-fade-in animate-delay-200">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
                Topics
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {["Technology", "Writing", "Design", "AI", "Culture", "Science", "Startup", "Philosophy"].map((tag) => (
                  <span key={tag} className="rounded-full bg-surface border border-border px-3 py-1.5 text-xs font-medium text-muted-dark hover:bg-surface-hover hover:text-foreground cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="card-flat p-5 animate-fade-in animate-delay-300">
              <h3 className="font-serif text-base font-bold text-foreground">
                Writing on Kotha
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-dark">
                Build a site that matches your voice — then let the hub surface your best work to readers.
              </p>
              <Link href="/sign-up" className="mt-3 inline-block text-xs font-semibold text-accent hover:underline">
                Get started →
              </Link>
            </section>

            {/* Footer links */}
            <div className="text-[11px] text-muted leading-relaxed">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <span>Help</span>
                <span>About</span>
                <span>Privacy</span>
                <span>Terms</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
