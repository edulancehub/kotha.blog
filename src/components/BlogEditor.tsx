"use client";

import { useState, useRef, useCallback } from "react";

type EditorProps = {
  action: (formData: FormData) => void;
  defaultValues?: {
    id?: string;
    title?: string;
    subtitle?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    tags?: string[];
    published?: boolean;
  };
  submitLabel?: string;
};

export function BlogEditor({ action, defaultValues = {}, submitLabel = "Publish" }: EditorProps) {
  const [content, setContent] = useState(defaultValues.content || "");
  const [published, setPublished] = useState(defaultValues.published ?? true);
  const editorRef = useRef<HTMLDivElement>(null);

  const syncContent = useCallback(() => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  function execCmd(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    syncContent();
  }

  const toolbarItems = [
    { label: "B", cmd: "bold", title: "Bold", style: "font-bold" },
    { label: "I", cmd: "italic", title: "Italic", style: "italic" },
    { label: "U̲", cmd: "underline", title: "Underline" },
    { type: "divider" },
    { label: "H2", cmd: "formatBlock", value: "h2", title: "Heading" },
    { label: "H3", cmd: "formatBlock", value: "h3", title: "Subheading" },
    { label: "¶", cmd: "formatBlock", value: "p", title: "Paragraph" },
    { type: "divider" },
    { label: "•", cmd: "insertUnorderedList", title: "Bullet list" },
    { label: "1.", cmd: "insertOrderedList", title: "Number list" },
    { label: "❝", cmd: "formatBlock", value: "blockquote", title: "Quote" },
    { type: "divider" },
    { label: "🔗", cmd: "link", title: "Insert link" },
    { label: "🖼", cmd: "image", title: "Insert image" },
  ];

  function handleToolbar(item: typeof toolbarItems[0]) {
    if (item.cmd === "link") {
      const url = prompt("Enter URL:");
      if (url) execCmd("createLink", url);
    } else if (item.cmd === "image") {
      const url = prompt("Enter image URL:");
      if (url) execCmd("insertImage", url);
    } else if (item.value) {
      execCmd(item.cmd!, item.value);
    } else if (item.cmd) {
      execCmd(item.cmd);
    }
  }

  return (
    <form action={action} className="space-y-5 animate-fade-in">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="published" value={published ? "true" : "false"} />

      {/* Title */}
      <input
        name="title"
        type="text"
        defaultValue={defaultValues.title}
        required
        placeholder="Title"
        className="w-full bg-transparent font-serif text-3xl sm:text-4xl font-bold text-foreground placeholder:text-border outline-none tracking-tight leading-tight"
      />

      {/* Subtitle */}
      <input
        name="subtitle"
        type="text"
        defaultValue={defaultValues.subtitle}
        placeholder="Add a subtitle (optional)"
        className="w-full bg-transparent text-lg text-muted-dark placeholder:text-border outline-none"
      />

      {/* Meta fields in a grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="input-label">Cover Image URL</label>
          <input
            name="coverImage"
            type="url"
            defaultValue={defaultValues.coverImage}
            placeholder="https://..."
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="input-label">Tags (comma separated)</label>
          <input
            name="tags"
            type="text"
            defaultValue={defaultValues.tags?.join(", ")}
            placeholder="tech, writing, ai"
            className="input-field text-sm"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="input-label">Excerpt</label>
        <textarea
          name="excerpt"
          defaultValue={defaultValues.excerpt}
          placeholder="A brief summary that appears in the feed..."
          rows={2}
          className="input-field text-sm resize-none"
        />
      </div>

      {/* Editor Toolbar */}
      <div className="editor-toolbar rounded-lg border border-border bg-surface/80 px-2 py-1.5 gap-0.5">
        {toolbarItems.map((item, i) =>
          item.type === "divider" ? (
            <span key={i} className="w-px h-5 bg-border mx-1" />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => handleToolbar(item)}
              title={item.title}
              className={item.style || ""}
            >
              {item.label}
            </button>
          )
        )}
      </div>

      {/* Content Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="prose-content min-h-[350px] rounded-xl border border-border bg-white px-5 py-4 text-base text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle leading-relaxed"
        onInput={syncContent}
        onBlur={syncContent}
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: defaultValues.content || "" }}
        data-placeholder="Start writing your story..."
        style={{
          position: "relative",
        }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--muted);
          pointer-events: none;
          position: absolute;
        }
      `}</style>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <span className="text-sm text-muted-dark">Publish immediately</span>
        </label>
        <button type="submit" className="btn-primary px-6">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
