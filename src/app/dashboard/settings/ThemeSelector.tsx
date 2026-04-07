"use client";

import { useState, useTransition } from "react";
import { updateSiteSettingsAction } from "@/lib/actions";
import type { BlogTheme } from "@/lib/db";

type ThemeItem = {
  id: BlogTheme;
  name: string;
  description: string;
  preview: string;
  profession: string;
};

type Props = {
  themes: ThemeItem[];
  currentTheme: BlogTheme;
  userId: string;
  currentSettings: {
    siteName: string;
    tagline: string;
    accentColor: string;
    bgColor: string;
    textColor: string;
    fontFamily: string;
    headerStyle: string;
  };
};

// Profession icons
const professionIcons: Record<string, string> = {
  "General": "✨",
  "Developers & Tech": "💻",
  "Journalists & Writers": "📰",
  "Gamers & Streamers": "🎮",
  "Nature & Environment": "🌿",
  "Travel & Adventure": "✈️",
  "Poets & Lyricists": "🪶",
  "Software Engineers": "⌨️",
  "Doctors & Healthcare": "⚕️",
  "Engineers & Architects": "📐",
  "Artists & Designers": "🎨",
  "Content Creators": "🌅",
  "News & Media": "📡",
  "Mindfulness & Yoga": "🧘",
  "Entrepreneurs & Startups": "🚀",
  "Researchers & Professors": "🎓",
  "Fashion & Beauty": "👗",
  "Musicians & Producers": "🎵",
  "Food Bloggers & Chefs": "🍳",
  "Lawyers & Legal": "⚖️",
  "Photographers": "📸",
  "Health & Wellness": "🌸",
  "Sports & Fitness": "⚽",
  "Teachers & Educators": "📚",
  "Business & Corporate": "💼",
};

function isDark(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
}

export function ThemeSelector({ themes, currentTheme, currentSettings }: Props) {
  const [selected, setSelected] = useState<BlogTheme>(currentTheme);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  function applyTheme(themeId: BlogTheme) {
    setSelected(themeId);
    setSuccess(false);

    const formData = new FormData();
    formData.set("theme", themeId);
    formData.set("siteName", currentSettings.siteName);
    formData.set("tagline", currentSettings.tagline);
    formData.set("accentColor", currentSettings.accentColor);
    formData.set("bgColor", currentSettings.bgColor);
    formData.set("textColor", currentSettings.textColor);
    formData.set("fontFamily", currentSettings.fontFamily);
    formData.set("headerStyle", currentSettings.headerStyle);

    startTransition(async () => {
      await updateSiteSettingsAction(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    });
  }

  return (
    <div>
      {/* Success message */}
      {success && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-100 px-4 py-2.5 text-sm text-green-700 animate-fade-in flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Template applied! View your blog to see the changes.
        </div>
      )}

      {/* Themes Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {themes.map((theme) => {
          const isActive = selected === theme.id;
          const dark = isDark(theme.preview);
          const icon = professionIcons[theme.profession] || "🌟";

          return (
            <button
              key={theme.id}
              type="button"
              disabled={pending}
              onClick={() => applyTheme(theme.id)}
              className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all duration-200 ${
                isActive
                  ? "border-accent ring-2 ring-accent/20 scale-[1.02]"
                  : "border-border hover:border-muted hover:shadow-md"
              } ${pending ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
            >
              {/* Preview Color Block */}
              <div
                className="relative h-20 w-full flex items-center justify-center"
                style={{ background: theme.preview }}
              >
                <span className="text-2xl opacity-70">{icon}</span>
                {/* Active Checkmark */}
                {isActive && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white animate-fade-in-scale">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                {/* Text Preview */}
                <div className="absolute bottom-1.5 left-2.5 right-2.5">
                  <div
                    className="h-1.5 rounded-full mb-1 w-3/4"
                    style={{ background: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
                  />
                  <div
                    className="h-1 rounded-full w-1/2"
                    style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5 bg-white">
                <p className="text-xs font-semibold text-foreground leading-tight">{theme.name}</p>
                <p className="text-[10px] text-accent font-medium mt-0.5">{theme.profession}</p>
                <p className="text-[10px] text-muted-dark leading-snug mt-0.5 line-clamp-2">{theme.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
