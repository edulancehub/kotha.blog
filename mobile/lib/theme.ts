// ── Kotha Mobile Design System ──────────────────────────────────
// Premium dark-mode palette with teal accent matching the web brand

export const Colors = {
  // Backgrounds
  bg: "#0A0F1E",
  bgCard: "#111827",
  bgElevated: "#1A2236",
  bgInput: "#151C2E",
  bgOverlay: "rgba(10, 15, 30, 0.85)",

  // Accent (teal)
  accent: "#14B8A6",
  accentDim: "#0D9488",
  accentGlow: "rgba(20, 184, 166, 0.15)",
  accentSoft: "rgba(20, 184, 166, 0.08)",

  // Gradient stops
  gradStart: "#0d9488",
  gradMid: "#059669",
  gradEnd: "#0891b2",

  // Text
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textInverse: "#0F172A",

  // Borders
  border: "#1E293B",
  borderLight: "#334155",

  // Semantic
  danger: "#EF4444",
  dangerBg: "rgba(239, 68, 68, 0.1)",
  success: "#10B981",
  successBg: "rgba(16, 185, 129, 0.1)",
  warning: "#F59E0B",

  // Misc
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const FontSize = {
  xxs: 10,
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
};
