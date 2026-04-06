/**
 * Renders owner-provided HTML (e.g. AdSense snippet). Only use trusted embed code;
 * malicious scripts affect all visitors to that subdomain.
 */
export function BlogAdStrip({ html }: { html: string }) {
  const t = html?.trim();
  if (!t) return null;
  return (
    <aside
      className="blog-owner-ad mx-auto max-w-2xl px-6 py-4"
      aria-label="Advertisement"
    >
      <div dangerouslySetInnerHTML={{ __html: t }} />
    </aside>
  );
}
