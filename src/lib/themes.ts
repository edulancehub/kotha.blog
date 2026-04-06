// ── Blog Themes Configuration ──────────────────────────────────
// Each theme defines a complete visual identity for tenant blog sites.
// Applied via the /p/[username] route when users select a theme.

import type { BlogTheme } from "@/lib/db";

export type ThemeConfig = {
  id: BlogTheme;
  name: string;
  // Colors
  bg: string;
  bgSecondary: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  border: string;
  cardBg: string;
  // Typography
  headingFont: string;
  bodyFont: string;
  // Header
  headerBg: string;
  headerText: string;
  headerAccent: string;
  // Post card
  postHoverBg: string;
  tagBg: string;
  tagText: string;
  // Code blocks
  codeBg: string;
  codeText: string;
  // Blockquote
  quoteBorder: string;
  quoteText: string;
  // Footer
  footerBg: string;
  footerText: string;
  // Special
  gradientFrom?: string;
  gradientTo?: string;
  avatarGradient: string;
  navStyle: "transparent" | "solid" | "glass";
  bodyClass: string;
};

export const THEMES: Record<BlogTheme, ThemeConfig> = {
  // ── 1. Minimal ──────────────────────────────────────────────
  minimal: {
    id: "minimal",
    name: "Minimal",
    bg: "#fafaf9",
    bgSecondary: "#ffffff",
    text: "#1c1917",
    textSecondary: "#78716c",
    accent: "#0d9488",
    accentHover: "#0f766e",
    border: "#e7e5e4",
    cardBg: "#ffffff",
    headingFont: "'Lora', var(--font-lora), Georgia, serif",
    bodyFont: "'Inter', var(--font-geist-sans), system-ui, sans-serif",
    headerBg: "#fafaf9",
    headerText: "#1c1917",
    headerAccent: "#0d9488",
    postHoverBg: "#f5f5f4",
    tagBg: "#f0fdfa",
    tagText: "#0d9488",
    codeBg: "#1c1917",
    codeText: "#e7e5e4",
    quoteBorder: "#0d9488",
    quoteText: "#57534e",
    footerBg: "#fafaf9",
    footerText: "#a8a29e",
    avatarGradient: "linear-gradient(135deg, #0d9488, #059669)",
    navStyle: "transparent",
    bodyClass: "",
  },

  // ── 2. Dark Noir ────────────────────────────────────────────
  "dark-noir": {
    id: "dark-noir",
    name: "Dark Noir",
    bg: "#0a0a0a",
    bgSecondary: "#141414",
    text: "#e5e5e5",
    textSecondary: "#737373",
    accent: "#f5f5f5",
    accentHover: "#d4d4d4",
    border: "#262626",
    cardBg: "#141414",
    headingFont: "'Inter', var(--font-geist-sans), system-ui, sans-serif",
    bodyFont: "'Inter', var(--font-geist-sans), system-ui, sans-serif",
    headerBg: "#0a0a0a",
    headerText: "#f5f5f5",
    headerAccent: "#ffffff",
    postHoverBg: "#1a1a1a",
    tagBg: "rgba(255,255,255,0.06)",
    tagText: "#a3a3a3",
    codeBg: "#1a1a1a",
    codeText: "#a3e635",
    quoteBorder: "#404040",
    quoteText: "#a3a3a3",
    footerBg: "#0a0a0a",
    footerText: "#525252",
    avatarGradient: "linear-gradient(135deg, #404040, #262626)",
    navStyle: "solid",
    bodyClass: "dark-noir-theme",
  },

  // ── 3. Vintage Press ────────────────────────────────────────
  "vintage-press": {
    id: "vintage-press",
    name: "Vintage Press",
    bg: "#f5f0e8",
    bgSecondary: "#faf7f2",
    text: "#2c2416",
    textSecondary: "#8b7e6a",
    accent: "#8b4513",
    accentHover: "#6d3710",
    border: "#d4c9b8",
    cardBg: "#faf7f2",
    headingFont: "'Playfair Display', 'Lora', var(--font-lora), Georgia, serif",
    bodyFont: "'Lora', var(--font-lora), Georgia, serif",
    headerBg: "#f5f0e8",
    headerText: "#2c2416",
    headerAccent: "#8b4513",
    postHoverBg: "#efe8db",
    tagBg: "#e8dcc8",
    tagText: "#6d5b3e",
    codeBg: "#2c2416",
    codeText: "#d4c9b8",
    quoteBorder: "#8b4513",
    quoteText: "#6d5b3e",
    footerBg: "#efe8db",
    footerText: "#a89a82",
    avatarGradient: "linear-gradient(135deg, #8b4513, #a0522d)",
    navStyle: "transparent",
    bodyClass: "vintage-press-theme",
  },

  // ── 4. Neon Vapor ───────────────────────────────────────────
  "neon-vapor": {
    id: "neon-vapor",
    name: "Neon Vapor",
    bg: "#0d0221",
    bgSecondary: "#150535",
    text: "#e0d7ff",
    textSecondary: "#8b7ec8",
    accent: "#ff2d95",
    accentHover: "#e0196e",
    border: "#2a1650",
    cardBg: "#150535",
    headingFont: "'Inter', var(--font-geist-sans), system-ui, sans-serif",
    bodyFont: "'Inter', var(--font-geist-sans), system-ui, sans-serif",
    headerBg: "#0d0221",
    headerText: "#e0d7ff",
    headerAccent: "#ff2d95",
    postHoverBg: "#1a0a3a",
    tagBg: "rgba(255,45,149,0.12)",
    tagText: "#ff2d95",
    codeBg: "#0a0118",
    codeText: "#00ff88",
    quoteBorder: "#ff2d95",
    quoteText: "#8b7ec8",
    footerBg: "#0d0221",
    footerText: "#4a3b6b",
    gradientFrom: "#ff2d95",
    gradientTo: "#00d4ff",
    avatarGradient: "linear-gradient(135deg, #ff2d95, #00d4ff)",
    navStyle: "glass",
    bodyClass: "neon-vapor-theme",
  },

  // ── 5. Forest ───────────────────────────────────────────────
  forest: {
    id: "forest",
    name: "Forest",
    bg: "#f0f4ed",
    bgSecondary: "#f8faf6",
    text: "#1a2e1a",
    textSecondary: "#4a6741",
    accent: "#2d6a4f",
    accentHover: "#1b4332",
    border: "#c8d5c1",
    cardBg: "#f8faf6",
    headingFont: "'Lora', var(--font-lora), Georgia, serif",
    bodyFont: "'Inter', var(--font-geist-sans), system-ui, sans-serif",
    headerBg: "#f0f4ed",
    headerText: "#1a2e1a",
    headerAccent: "#2d6a4f",
    postHoverBg: "#e4ece0",
    tagBg: "#d8e8d0",
    tagText: "#2d6a4f",
    codeBg: "#1a2e1a",
    codeText: "#a7c9a0",
    quoteBorder: "#2d6a4f",
    quoteText: "#4a6741",
    footerBg: "#e8ede5",
    footerText: "#7a9171",
    avatarGradient: "linear-gradient(135deg, #2d6a4f, #52b788)",
    navStyle: "transparent",
    bodyClass: "forest-theme",
  },

  // ── 6. Ocean Breeze ─────────────────────────────────────────
  "ocean-breeze": {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    bg: "#f0f7ff",
    bgSecondary: "#ffffff",
    text: "#0c2d48",
    textSecondary: "#5b8db8",
    accent: "#0077b6",
    accentHover: "#005f8d",
    border: "#c9dff0",
    cardBg: "#ffffff",
    headingFont: "'Inter', var(--font-geist-sans), system-ui, sans-serif",
    bodyFont: "'Inter', var(--font-geist-sans), system-ui, sans-serif",
    headerBg: "linear-gradient(135deg, #0077b6, #00a8e8)",
    headerText: "#ffffff",
    headerAccent: "#90e0ef",
    postHoverBg: "#e5f0fa",
    tagBg: "#dbeafe",
    tagText: "#0077b6",
    codeBg: "#0c2d48",
    codeText: "#90e0ef",
    quoteBorder: "#0077b6",
    quoteText: "#5b8db8",
    footerBg: "#e5f0fa",
    footerText: "#7baac7",
    gradientFrom: "#0077b6",
    gradientTo: "#00a8e8",
    avatarGradient: "linear-gradient(135deg, #0077b6, #00a8e8)",
    navStyle: "solid",
    bodyClass: "ocean-breeze-theme",
  },
};

export function getTheme(id: BlogTheme): ThemeConfig {
  return THEMES[id] || THEMES.minimal;
}
