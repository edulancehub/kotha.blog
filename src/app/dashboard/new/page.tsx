import { BlogEditor } from "@/components/BlogEditor";
import { createPostAction } from "@/lib/actions";
import Link from "next/link";

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="btn-ghost p-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-serif text-xl font-bold text-foreground">New Post</h1>
      </div>
      <BlogEditor action={createPostAction} submitLabel="Publish" />
    </div>
  );
}
