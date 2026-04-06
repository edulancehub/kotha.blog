import Link from "next/link";
import { HubHeader } from "@/components/hub/HubHeader";
import { getCurrentUser } from "@/lib/auth";
import { ClaimSubdomainForm } from "./ClaimSubdomainForm";
import { LoggedInSubdomainCard } from "./LoggedInSubdomainCard";

type Props = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function ClaimPage({ searchParams }: Props) {
  const { slug: slugParam } = await searchParams;
  const initial =
    typeof slugParam === "string" && slugParam.length > 0
      ? slugParam
      : undefined;

  const user = await getCurrentUser();

  return (
    <div className="min-h-full bg-white text-zinc-900">
      <HubHeader />
      <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <p className="text-sm font-medium text-zinc-500">Free subdomain</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Your address on Kotha
        </h1>
        <p className="mt-3 text-zinc-600">
          Your blog lives at{" "}
          <span className="font-mono text-zinc-800">you.kotha.blog</span> (or{" "}
          <span className="font-mono text-zinc-800">you.localhost</span> in
          development). It is reserved when you{" "}
          <strong className="font-medium text-zinc-800">create your account</strong>
          — pick a unique username.
        </p>
        <div className="mt-10">
          {user ? (
            <LoggedInSubdomainCard user={user} />
          ) : (
            <ClaimSubdomainForm initialSlug={initial} />
          )}
        </div>
        <p className="mt-10 text-center text-sm text-zinc-400">
          <Link href="/" className="underline decoration-zinc-300 hover:text-zinc-600">
            Back to feed
          </Link>
        </p>
      </main>
    </div>
  );
}
