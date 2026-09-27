import React from "react";

interface FormattedTextProps {
  text: string;
  onNavigateSlug?: (slug: string) => void;
  className?: string;
}

/**
 * Parses inline markdown:
 * - Markdown links: [Anchor Text](/article/slug-name) or [Anchor Text](https://...)
 * - Bold: **text**
 * - Italic: *text*
 * - Code: `code`
 */
export function FormattedInlineText({ text, onNavigateSlug, className }: FormattedTextProps) {
  // Regex to detect links: [text](url)
  // We match links first, and within text segments we can handle bold/code
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const formatTextSegment = (raw: string, keyPrefix: string): React.ReactNode[] => {
    // Split by bold (**text**) and code (`text`)
    // Tokenize
    const tokens: React.ReactNode[] = [];
    const subRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let subLastIndex = 0;
    let subMatch: RegExpExecArray | null;

    while ((subMatch = subRegex.exec(raw)) !== null) {
      if (subMatch.index > subLastIndex) {
        tokens.push(raw.substring(subLastIndex, subMatch.index));
      }
      const matchedStr = subMatch[0];
      if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
        tokens.push(
          <strong key={`${keyPrefix}-b-${subMatch.index}`} className="font-semibold text-stone-900">
            {matchedStr.slice(2, -2)}
          </strong>
        );
      } else if (matchedStr.startsWith("`") && matchedStr.endsWith("`")) {
        tokens.push(
          <code
            key={`${keyPrefix}-c-${subMatch.index}`}
            className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 font-mono text-[0.9em]"
          >
            {matchedStr.slice(1, -1)}
          </code>
        );
      } else if (matchedStr.startsWith("*") && matchedStr.endsWith("*")) {
        tokens.push(
          <em key={`${keyPrefix}-i-${subMatch.index}`} className="italic">
            {matchedStr.slice(1, -1)}
          </em>
        );
      }
      subLastIndex = subRegex.lastIndex;
    }

    if (subLastIndex < raw.length) {
      tokens.push(raw.substring(subLastIndex));
    }

    return tokens;
  };

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push(...formatTextSegment(beforeText, `before-${match.index}`));
    }

    const anchorText = match[1];
    const href = match[2].trim();
    const linkKey = `link-${match.index}`;

    // Check if it's an internal article link
    // e.g. /article/parag-parikh-flexi-cap-vs-mirae-asset-large-midcap or /article/slug or article:slug
    const isInternalArticle =
      href.startsWith("/article/") ||
      href.startsWith("./") ||
      href.startsWith("/") && !href.startsWith("//") ||
      (!href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("mailto:") && !href.startsWith("#"));

    if (isInternalArticle && onNavigateSlug) {
      let slug = href;
      if (slug.startsWith("/article/")) {
        slug = slug.replace("/article/", "");
      } else if (slug.startsWith("/")) {
        slug = slug.slice(1);
      }
      // Remove any trailing query/hash
      slug = slug.split("?")[0].split("#")[0];

      parts.push(
        <button
          key={linkKey}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigateSlug(slug);
          }}
          className="inline font-medium text-[#4F46E5] hover:text-[#3730A3] underline decoration-[#C7D2FE] underline-offset-3 hover:decoration-[#4F46E5] transition-colors cursor-pointer text-left font-sans text-[0.98em]"
        >
          {anchorText}
        </button>
      );
    } else {
      parts.push(
        <a
          key={linkKey}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="inline font-medium text-[#4F46E5] hover:text-[#3730A3] underline decoration-[#C7D2FE] underline-offset-3 hover:decoration-[#4F46E5] transition-colors"
        >
          {anchorText}
        </a>
      );
    }

    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(...formatTextSegment(text.substring(lastIndex), `end-${lastIndex}`));
  }

  return <span className={className}>{parts}</span>;
}
