import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPostById } from "@/lib/db";
import { updatePostAction } from "@/lib/actions";
import { BlogEditor } from "@/components/BlogEditor";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const post = await getPostById(id);
  if (!post || post.userId !== user.id) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="btn-ghost p-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-serif text-xl font-bold text-foreground">Edit Post</h1>
      </div>
      <BlogEditor
        action={updatePostAction}
        defaultValues={{
          id: post.id,
          title: post.title,
          subtitle: post.subtitle,
          content: post.content,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          tags: post.tags,
          published: post.published,
        }}
        submitLabel="Update"
      />
    </div>
  );
}
