/**
 * URL Slug Utilities for YieldNest.online
 * Enforces Google Search Console SEO best practices for canonical article URLs:
 * - Lowercase alphanumeric characters and single hyphens
 * - No special characters, punctuation, accents, or URL-encoded spaces
 * - Max length of 80 characters for optimal indexability
 * - Prevents reserved routing words
 */

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "category",
  "article",
  "sitemap",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
  "llms-full.txt",
  "index.html",
  "search",
  "auth",
  "login",
  "settings",
]);

export function sanitizeSlug(input: string): string {
  if (!input) return "";

  let cleaned = input
    .toLowerCase()
    .trim()
    // Strip protocol and domain if pasted as full URL
    .replace(/^https?:\/\/[^/]+/i, "")
    // Strip leading /article/ or /category/ if pasted
    .replace(/^\/?(article|category)\//i, "")
    // Normalize unicode accents (e.g. café -> cafe)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Replace spaces, underscores, and dots with hyphens
    .replace(/[\s_.]+/g, "-")
    // Remove all characters except lowercase alphanumeric and hyphens
    .replace(/[^a-z0-9-]/g, "")
    // Collapse consecutive hyphens into one
    .replace(/-+/g, "-")
    // Trim hyphens from beginning and end
    .replace(/^-+|-+$/g, "");

  // Cap at 80 characters without ending in hyphen
  if (cleaned.length > 80) {
    const trimmed = cleaned.slice(0, 80);
    const lastHyphen = trimmed.lastIndexOf("-");
    cleaned = (lastHyphen > 40 ? trimmed.slice(0, lastHyphen) : trimmed).replace(/-+$/, "");
  }

  // If slug is reserved, append suffix
  if (RESERVED_SLUGS.has(cleaned)) {
    cleaned = `${cleaned}-research`;
  }

  return cleaned;
}

export function validateSlug(slug: string, existingSlugs: string[] = [], currentArticleId?: string): {
  valid: boolean;
  message?: string;
  suggestedSlug?: string;
} {
  const sanitized = sanitizeSlug(slug);

  if (!sanitized) {
    return {
      valid: false,
      message: "Slug cannot be empty. Please enter a descriptive URL slug.",
    };
  }

  if (sanitized.length < 3) {
    return {
      valid: false,
      message: "Slug is too short (minimum 3 characters).",
    };
  }

  if (RESERVED_SLUGS.has(sanitized)) {
    return {
      valid: false,
      message: `"${sanitized}" is a reserved system keyword.`,
      suggestedSlug: `${sanitized}-analysis`,
    };
  }

  // Check for conflicts with other articles
  const isDuplicate = existingSlugs.some((s) => s.toLowerCase() === sanitized.toLowerCase());
  if (isDuplicate) {
    let counter = 2;
    let candidate = `${sanitized}-${counter}`;
    while (existingSlugs.some((s) => s.toLowerCase() === candidate)) {
      counter++;
      candidate = `${sanitized}-${counter}`;
    }
    return {
      valid: false,
      message: `A research article with URL slug "/article/${sanitized}" already exists.`,
      suggestedSlug: candidate,
    };
  }

  return { valid: true };
}

export function getCanonicalArticleUrl(slug: string): string {
  const clean = sanitizeSlug(slug);
  return `https://www.yieldnest.online/article/${clean}`;
}

export function getCanonicalCategoryUrl(categorySlug: string): string {
  return `https://www.yieldnest.online/category/${categorySlug}`;
}
