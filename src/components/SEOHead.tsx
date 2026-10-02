import { useEffect } from "react";
import { ArticlePost, SiteSettings } from "../types";

export interface CalculatorSEOMeta {
  name: string;
  title: string;
  description: string;
  urlPath: string;
}

interface SEOHeadProps {
  post?: ArticlePost | null;
  settings: SiteSettings;
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string;
  urlPath?: string;
  calculatorMeta?: CalculatorSEOMeta | null;
}

/**
 * Extracts and normalizes a dynamic, comma-separated keywords string from an article post,
 * custom keywords prop, or calculator metadata to maximize search engine discoverability.
 */
export function extractArticleKeywords(
  post?: ArticlePost | null,
  customKeywords?: string,
  calculatorMeta?: CalculatorSEOMeta | null
): string {
  if (customKeywords && customKeywords.trim()) {
    return customKeywords.trim();
  }

  if (calculatorMeta) {
    return [
      calculatorMeta.name,
      "mutual fund calculator",
      "SIP calculator",
      "financial planning India",
      "wealth compounding",
      "AMFI calculator",
      "mutual funds India",
    ].join(", ");
  }

  if (post) {
    const candidates = [
      post.seoMetadata?.primaryKeyword,
      ...(Array.isArray(post.tags) ? post.tags : []),
      ...(Array.isArray(post.seoMetadata?.secondaryKeywords) ? post.seoMetadata.secondaryKeywords : []),
      post.category,
      "mutual funds India",
    ].filter((k): k is string => Boolean(k && typeof k === "string" && k.trim().length > 0));

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const item of candidates) {
      const clean = item.trim();
      const lower = clean.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(clean);
      }
    }

    if (unique.length > 0) {
      return unique.join(", ");
    }
  }

  return "mutual funds India, AMFI, SIP investment, mutual fund performance, rolling returns, Indian equity";
}

/**
 * Strips markdown syntax and returns a clean, concise social excerpt
 * formatted specifically for OpenGraph and Twitter card snippets (120-160 characters).
 */
export function cleanSocialExcerpt(rawExcerpt?: string, content?: string, maxLength = 155): string {
  const source = (rawExcerpt && rawExcerpt.trim().length > 0)
    ? rawExcerpt
    : (content || "");

  if (!source) return "Independent mutual fund research, rolling returns analysis, and portfolio reviews.";

  // Strip Markdown, HTML, and code artifacts
  let cleaned = source
    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`[^`]+`/g, "")
    // Remove markdown image embeds: ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    // Remove markdown links: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove markdown headings (# Heading)
    .replace(/^#{1,6}\s+/gm, "")
    // Remove blockquotes (> quote)
    .replace(/^>\s+/gm, "")
    // Remove bold and italic markers (*text*, **text**, _text_, __text__)
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, "$1")
    // Remove table borders and pipes
    .replace(/\|/g, " ")
    // Remove HTML tags
    .replace(/<[^>]+>/g, "")
    // Remove horizontal rules
    .replace(/[-*_]{3,}/g, " ")
    // Replace multiple spaces and newlines with a single space
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Trim safely at word boundary to avoid cutting words in half
  const truncated = cleaned.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const safeEnd = lastSpaceIndex > 80 ? lastSpaceIndex : maxLength;
  const result = truncated.slice(0, safeEnd).replace(/[,.:;!?-]+$/, "").trim();

  return `${result}...`;
}

/**
 * Resolves absolute URLs if an image explicitly exists (without generating placeholder photos).
 */
export function resolveSocialImageUrl(imageUrl?: string, fallbackOrigin?: string): string | null {
  if (!imageUrl || !imageUrl.trim()) {
    return null;
  }

  const trimmed = imageUrl.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  const origin = fallbackOrigin || (typeof window !== "undefined" ? window.location.origin : "https://www.yieldnest.online");
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${origin}${cleanPath}`;
}

export function SEOHead({ post, settings, customTitle, customDescription, customKeywords, urlPath = "", calculatorMeta }: SEOHeadProps) {
  // Canonical origin is strictly the primary domain for Google Search Console & Vercel production
  const canonicalOrigin = "https://www.yieldnest.online";
  const activePath = urlPath || calculatorMeta?.urlPath || (typeof window !== "undefined" ? window.location.pathname : "/");
  const cleanPath = activePath.length > 1 ? activePath.replace(/\/+$/, "") : activePath;
  const fullUrl = cleanPath === "/" ? `${canonicalOrigin}/` : `${canonicalOrigin}${cleanPath}`;

  // 1. Automated Title Generation
  const rawTitle = calculatorMeta
    ? calculatorMeta.title
    : post
    ? (post.seoMetadata?.metaTitle || `${post.title} | ${settings.siteName}`)
    : (customTitle || `${settings.siteName} – ${settings.tagline}`);
  const title = rawTitle.trim();

  // 2. Automated Clean Social Excerpt Generation
  const description = calculatorMeta
    ? calculatorMeta.description
    : post
    ? cleanSocialExcerpt(post.seoMetadata?.metaDescription || post.excerpt, post.content, 155)
    : (customDescription || settings.description);

  // 3. Dynamic Keywords Extraction (from article tags, category, primary/secondary keywords)
  const keywords = extractArticleKeywords(post, customKeywords, calculatorMeta);

  // 4. Image check (do not create or force images for articles)
  const socialImage = post?.coverImage ? resolveSocialImageUrl(post.coverImage, canonicalOrigin) : null;

  // 5. Author & Attribution (Strictly institutional desk, no individual names)
  const authorName = "YieldNest Research Desk";

  useEffect(() => {
    // A. Update Document Title
    document.title = title;

    // Helper to safely set or create single meta tag
    const setMetaTag = (attributeName: "name" | "property", attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
      return element;
    };

    const removeMetaTag = (attributeName: "name" | "property", attributeValue: string) => {
      const element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (element) {
        element.remove();
      }
    };

    // B. Standard Search Engine Meta
    setMetaTag("name", "description", description);
    setMetaTag("name", "keywords", keywords);
    setMetaTag("name", "author", authorName);
    setMetaTag("name", "robots", "index, follow, max-snippet:-1");
    if (settings.googleSearchConsoleVerification) {
      setMetaTag("name", "google-site-verification", settings.googleSearchConsoleVerification);
    }

    // C. OpenGraph Protocol Tags
    setMetaTag("property", "og:site_name", settings.siteName);
    setMetaTag("property", "og:locale", "en_IN");
    setMetaTag("property", "og:type", post ? "article" : "website");
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", fullUrl);

    // D. OpenGraph Image Tags: Only include if explicitly provided, do not fabricate
    if (socialImage) {
      setMetaTag("property", "og:image", socialImage);
      setMetaTag("property", "og:image:secure_url", socialImage.replace(/^http:\/\//i, "https://"));
      setMetaTag("property", "og:image:width", "1200");
      setMetaTag("property", "og:image:height", "630");
      setMetaTag("property", "og:image:alt", title);
    } else {
      removeMetaTag("property", "og:image");
      removeMetaTag("property", "og:image:secure_url");
      removeMetaTag("property", "og:image:width");
      removeMetaTag("property", "og:image:height");
      removeMetaTag("property", "og:image:alt");
    }

    // E. OpenGraph Article Extensions
    const existingArticleTags = document.querySelectorAll('meta[property="article:tag"]');
    existingArticleTags.forEach((el) => el.remove());

    if (post) {
      const publishDate = post.publishedAt || post.createdAt;
      const modifiedDate = post.updatedAt || post.createdAt;
      setMetaTag("property", "article:published_time", new Date(publishDate).toISOString());
      setMetaTag("property", "article:modified_time", new Date(modifiedDate).toISOString());
      setMetaTag("property", "article:section", post.category);
      setMetaTag("property", "article:author", authorName);

      const tagsList = [
        post.category,
        post.seoMetadata?.primaryKeyword,
        ...(post.seoMetadata?.secondaryKeywords || []),
        ...(post.tags || []),
      ].filter((t): t is string => Boolean(t && t.trim()));

      const uniqueTags = Array.from(new Set(tagsList));
      uniqueTags.forEach((tag) => {
        const metaTag = document.createElement("meta");
        metaTag.setAttribute("property", "article:tag");
        metaTag.setAttribute("content", tag);
        document.head.appendChild(metaTag);
      });
    } else {
      const articleProps = ["article:published_time", "article:modified_time", "article:section", "article:author"];
      articleProps.forEach((prop) => {
        removeMetaTag("property", prop);
      });
    }

    // F. Twitter / X Cards (Use clean 'summary' card when no image, or 'summary_large_image' if image exists)
    if (socialImage) {
      setMetaTag("name", "twitter:card", "summary_large_image");
      setMetaTag("name", "twitter:image", socialImage);
      setMetaTag("name", "twitter:image:alt", title);
    } else {
      setMetaTag("name", "twitter:card", "summary");
      removeMetaTag("name", "twitter:image");
      removeMetaTag("name", "twitter:image:alt");
    }
    setMetaTag("name", "twitter:site", "@YieldNestOnline");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);

    // G. Canonical Link Tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    // Google tag / Google Analytics tracking for SPA virtual pageviews
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "page_view", {
        page_title: title,
        page_location: fullUrl,
        page_path: urlPath || window.location.pathname,
      });
    }

    // H. Schema.org JSON-LD Structured Data
    let scriptTag = document.getElementById("structured-data-jsonld") as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "structured-data-jsonld";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    if (calculatorMeta) {
      const isHub = cleanPath === "/calculators" || cleanPath === "/calculator";
      const itemListElement = [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: canonicalOrigin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Calculators",
          item: `${canonicalOrigin}/calculators`,
        },
      ];

      if (!isHub) {
        itemListElement.push({
          "@type": "ListItem",
          position: 3,
          name: calculatorMeta.name,
          item: fullUrl,
        });
      }

      const calculatorSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebApplication",
            "@id": `${fullUrl}#app`,
            name: calculatorMeta.name,
            url: fullUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "All",
            browserRequirements: "Requires JavaScript",
            description: description,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
            },
            publisher: {
              "@type": "Organization",
              name: settings.siteName,
              url: canonicalOrigin,
            },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${fullUrl}#breadcrumb`,
            itemListElement,
          },
        ],
      };
      scriptTag.textContent = JSON.stringify(calculatorSchema, null, 2);
    } else if (post) {
      const words = post.content ? post.content.trim().split(/\s+/).length : 500;
      const readTime = post.readTimeMinutes || Math.max(1, Math.ceil(words / 200));

      const articleNode: Record<string, unknown> = {
        "@type": ["Article", "FinancialArticle"],
        "@id": `${fullUrl}#article`,
        "isPartOf": {
          "@type": "WebPage",
          "@id": fullUrl,
          "url": fullUrl,
          "name": title,
        },
        "headline": post.title,
        "description": description,
        "datePublished": new Date(post.publishedAt || post.createdAt).toISOString(),
        "dateModified": new Date(post.updatedAt || post.createdAt).toISOString(),
        "inLanguage": "en-IN",
        "wordCount": words,
        "timeRequired": `PT${readTime}M`,
        "author": {
          "@type": "Organization",
          "name": "YieldNest Research Desk",
        },
        publisher: {
          "@type": "Organization",
          "name": settings.siteName,
          "url": canonicalOrigin,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": fullUrl,
        },
        articleSection: post.category,
        keywords: [
          post.category,
          post.seoMetadata?.primaryKeyword,
          ...(post.seoMetadata?.secondaryKeywords || []),
          ...(post.tags || []),
        ].filter(Boolean).join(", "),
        about: {
          "@type": "Thing",
          name: post.category,
        },
      };

      if (socialImage) {
        articleNode["image"] = {
          "@type": "ImageObject",
          url: socialImage,
          width: 1200,
          height: 630,
        };
      }

      const categorySlugMap: Record<string, string> = {
        "Fund Comparison": "fund-comparison",
        "Performance Analysis": "performance-analysis",
        "Market Trends": "market-trends",
        "Category Deep-Dive": "category-deep-dive",
        "SIP Strategies": "sip-strategies",
      };
      const catSlug = categorySlugMap[post.category] || "fund-comparison";
      const categoryCanonicalUrl = `${canonicalOrigin}/category/${catSlug}`;

      const articleSchema = {
        "@context": "https://schema.org",
        "@graph": [
          articleNode,
          {
            "@type": "BreadcrumbList",
            "@id": `${fullUrl}#breadcrumb`,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: canonicalOrigin,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: post.category,
                item: categoryCanonicalUrl,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: fullUrl,
              },
            ],
          },
        ],
      };
      scriptTag.textContent = JSON.stringify(articleSchema, null, 2);
    } else {
      const websiteSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${canonicalOrigin}#website`,
            name: settings.siteName,
            url: canonicalOrigin,
            description: settings.description,
            publisher: {
              "@type": "Organization",
              name: settings.siteName,
              url: canonicalOrigin,
            },
            inLanguage: "en-IN",
          },
        ],
      };
      scriptTag.textContent = JSON.stringify(websiteSchema, null, 2);
    }

    return () => {
      const dynamicTags = document.querySelectorAll('meta[property="article:tag"]');
      dynamicTags.forEach((el) => el.remove());
    };
  }, [title, description, fullUrl, socialImage, authorName, post, settings, calculatorMeta, urlPath]);

  return null;
}
