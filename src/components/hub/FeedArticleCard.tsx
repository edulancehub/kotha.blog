import Image from "next/image";
import Link from "next/link";
import type { Post, User } from "@/lib/db";

export type FeedItem = Post & { author: User };

function formatDate(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function FeedArticleCard({ item, index = 0 }: { item: FeedItem; index?: number }) {
  const postUrl = `/p/${item.author.username}/${item.slug}`;
  const profileUrl = `/p/${item.author.username}`;

  return (
    <article
      className="group flex gap-5 py-7 border-b border-border-light last:border-0 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="min-w-0 flex-1">
        {/* Author line */}
        <div className="mb-2.5 flex items-center gap-2">
          <Link href={profileUrl} className="shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 text-[10px] font-bold text-white">
              {item.author.displayName[0]?.toUpperCase()}
            </div>
          </Link>
          <Link href={profileUrl} className="text-xs font-medium text-muted-dark hover:text-foreground transition-colors truncate">
            {item.author.displayName}
          </Link>
        </div>

        {/* Title */}
        <Link href={postUrl} className="block group/title">
          <h2 className="font-serif text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl group-hover/title:text-accent-hover transition-colors line-clamp-2">
            {item.title}
          </h2>
          {item.subtitle && (
            <p className="mt-1 text-sm text-muted-dark line-clamp-1 hidden sm:block">
              {item.subtitle}
            </p>
          )}
        </Link>

        {/* Excerpt */}
        <p className="mt-1.5 text-sm text-muted-dark line-clamp-2 leading-relaxed hidden sm:block">
          {item.excerpt}
        </p>

        {/* Meta */}
        <div className="mt-3 flex items-center gap-2.5 text-xs text-muted">
          <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
          <span className="text-border">·</span>
          <span>{item.readTime} min read</span>
          {item.tags.length > 0 && (
            <>
              <span className="text-border">·</span>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-muted-dark">
                {item.tags[0]}
              </span>
            </>
          )}
          <div className="ml-auto flex items-center gap-3">
            {item.claps > 0 && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {formatNumber(item.claps)}
              </span>
            )}
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5" aria-label="Save">
              <svg className="h-4 w-4 text-muted hover:text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      {item.coverImage && (
        <Link href={postUrl} className="relative shrink-0 hidden sm:block">
          <div className="h-[7.5rem] w-[7.5rem] overflow-hidden rounded-lg bg-surface">
            <Image
              src={item.coverImage}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="120px"
            />
          </div>
        </Link>
      )}
    </article>
  );
}
