import sanitizeHtml from "sanitize-html";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidEmail(input: string): boolean {
  return EMAIL_RE.test(normalizeEmail(input));
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 10) {
    return "Password must be at least 10 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number";
  }
  return null;
}

export function sanitizePostHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "blockquote",
      "code",
      "pre",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "h4",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  });
}

export function sanitizeOptionalHttpUrl(input?: string): string | undefined {
  const value = input?.trim();
  if (!value) return undefined;

  try {
    const parsed = new URL(value);
    if (!SAFE_PROTOCOLS.has(parsed.protocol)) {
      return undefined;
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}