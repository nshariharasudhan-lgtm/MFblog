import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { INITIAL_ARTICLES } from "../src/lib/seedData";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const CANONICAL_ORIGIN = "https://www.yieldnest.online";

const CATEGORY_META: Record<string, { name: string; title: string; description: string }> = {
  "fund-comparison": {
    name: "Fund Comparison",
    title: "Fund Comparison Mutual Fund Research & Analysis | YieldNest.online",
    description: "Side-by-side mutual fund analyses, 5-year rolling returns, downside capture, and AMFI scheme comparisons on YieldNest.online.",
  },
  "performance-analysis": {
    name: "Performance Analysis",
    title: "Performance Analysis & Rolling Return Studies | YieldNest.online",
    description: "Quantitative mutual fund performance analysis, risk-adjusted ratios (Sharpe, Sortino), and rolling return evaluations.",
  },
  "market-trends": {
    name: "Market Trends",
    title: "Market Trends & AMFI Mutual Fund Inflow Analytics | YieldNest.online",
    description: "Analysis of Indian mutual fund market trends, AMFI monthly inflow trajectories, SIP book growth, and industry liquidity.",
  },
  "category-deep-dive": {
    name: "Category Deep-Dive",
    title: "Category Deep-Dive & Scheme Analyses | YieldNest.online",
    description: "Comprehensive deep-dives into Indian equity fund categories: Flexi Cap, Small Cap, Large & Mid Cap, and Index funds.",
  },
  "sip-strategies": {
    name: "SIP Strategies",
    title: "SIP Strategies & Compounding Wealth Tactics | YieldNest.online",
    description: "Mathematical frameworks for systematic investment planning, step-up SIP compounding, and direct plan cost optimization.",
  },
};

const CATEGORY_NAME_TO_SLUG: Record<string, string> = {
  "Fund Comparison": "fund-comparison",
  "Performance Analysis": "performance-analysis",
  "Market Trends": "market-trends",
  "Category Deep-Dive": "category-deep-dive",
  "SIP Strategies": "sip-strategies",
};

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (_m, _lang, code) => {
    return `<pre style="background:#1c1a17;color:#f3f1e9;padding:1rem;border-radius:0.75rem;overflow-x:auto;font-size:0.8rem;margin:1.25rem 0;"><code>${code.trim()}</code></pre>`;
  });
  html = html.replace(/`([^`]+)`/g, `<code style="background:#eae8e0;padding:0.15rem 0.35rem;border-radius:0.25rem;font-size:0.85em;">$1</code>`);

  // Headings
  html = html.replace(/^### (.*$)/gim, `<h3 style="font-size:1.15rem;font-weight:600;margin-top:1.5rem;margin-bottom:0.5rem;color:#1a1a1a;">$1</h3>`);
  html = html.replace(/^## (.*$)/gim, `<h2 style="font-size:1.4rem;font-weight:600;margin-top:2rem;margin-bottom:0.75rem;padding-bottom:0.25rem;border-bottom:1px solid #eae8e0;color:#1a1a1a;">$1</h2>`);
  html = html.replace(/^# (.*$)/gim, `<h1 style="font-size:1.75rem;font-weight:700;margin-top:2rem;margin-bottom:1rem;color:#1a1a1a;">$1</h1>`);

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, `<blockquote style="border-left:4px solid #d97706;padding:0.5rem 1rem;margin:1rem 0;background:#fffbeb;font-style:italic;color:#451a03;border-radius:0 0.5rem 0.5rem 0;">$1</blockquote>`);

  // Horizontal rules
  html = html.replace(/^---$/gim, `<hr style="margin:1.75rem 0;border:0;border-top:1px solid #eae8e0;" />`);

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, `<strong>$1</strong>`);
  html = html.replace(/\*([^*]+)\*/g, `<em>$1</em>`);

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:#065f46;text-decoration:underline;font-weight:500;">$1</a>`);

  // Tables
  const lines = html.split("\n");
  const parsedLines: string[] = [];
  let inTable = false;
  let tableHeaderDone = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line.slice(1, -1).split("|").map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableHeaderDone = false;
        parsedLines.push(`<div style="overflow-x:auto;margin:1.5rem 0;"><table style="width:100%;font-size:0.85rem;border-collapse:collapse;border:1px solid #e5e3dc;background:#ffffff;border-radius:0.5rem;">`);
      }
      if (!tableHeaderDone) {
        tableHeaderDone = true;
        parsedLines.push(`<thead style="background:#f4f2eb;font-weight:600;border-bottom:1px solid #e5e3dc;"><tr>${cells.map((c) => `<th style="padding:0.6rem 0.8rem;text-align:left;">${c}</th>`).join("")}</tr></thead><tbody>`);
      } else {
        parsedLines.push(`<tr style="border-bottom:1px solid #f0eee6;">${cells.map((c) => `<td style="padding:0.6rem 0.8rem;">${c}</td>`).join("")}</tr>`);
      }
    } else {
      if (inTable) {
        inTable = false;
        parsedLines.push(`</tbody></table></div>`);
      }
      parsedLines.push(lines[i]);
    }
  }
  if (inTable) {
    parsedLines.push(`</tbody></table></div>`);
  }
  html = parsedLines.join("\n");

  // Paragraphs & Lists
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<table") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol")
      ) {
        return trimmed;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split("\n").filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
        return `<ul style="margin:1rem 0;padding-left:1.5rem;line-height:1.7;">${items.map((it) => `<li>${it.replace(/^[-*]\s+/, "")}</li>`).join("")}</ul>`;
      }
      return `<p style="margin-bottom:1.15rem;line-height:1.75;color:#2d2a26;">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

function loadAllArticles(): any[] {
  const articlesMap = new Map<string, any>();

  // 1. Load initial seed articles
  for (const art of INITIAL_ARTICLES) {
    if (art.status === "published") {
      articlesMap.set(art.slug, art);
    }
  }

  // 2. Load custom posts from server_data if available
  const customPostsFile = path.join(rootDir, "server_data", "custom_posts.json");
  if (fs.existsSync(customPostsFile)) {
    try {
      const customs = JSON.parse(fs.readFileSync(customPostsFile, "utf-8"));
      if (Array.isArray(customs)) {
        for (const art of customs) {
          if (art.status === "published") {
            articlesMap.set(art.slug, art);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load custom_posts.json:", e);
    }
  }

  // 3. Filter deleted post IDs
  const deletedFile = path.join(rootDir, "server_data", "deleted_post_ids.json");
  if (fs.existsSync(deletedFile)) {
    try {
      const deletedIds = JSON.parse(fs.readFileSync(deletedFile, "utf-8"));
      if (Array.isArray(deletedIds)) {
        const deletedSet = new Set(deletedIds);
        for (const [slug, art] of articlesMap.entries()) {
          if (deletedSet.has(art.id) || deletedSet.has(slug)) {
            articlesMap.delete(slug);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load deleted_post_ids.json:", e);
    }
  }

  return Array.from(articlesMap.values()).sort((a, b) => {
    const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

function injectHomepage(template: string, articles: any[]): string {
  const title = "YieldNest.online – Independent Mutual Fund Research & Analytics";
  const description = "Data-driven research on Indian Mutual Funds. Unbiased fund comparisons, rolling return analyses, portfolio overlap checks, and market analytics on YieldNest.online.";
  const url = `${CANONICAL_ORIGIN}/`;

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        "name": "YieldNest.online",
        "url": url,
        "description": description,
        "publisher": {
          "@type": "Organization",
          "name": "YieldNest.online",
          "url": url,
        },
        "inLanguage": "en-IN",
      },
      {
        "@type": "Organization",
        "@id": `${url}#organization`,
        "name": "YieldNest.online",
        "url": url,
        "description": "Independent Quantitative Mutual Fund Research & Analytics Publication",
      },
    ],
  });

  let modified = template;
  modified = modified.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  modified = modified.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${description}" />`);
  modified = modified.replace(/<link\s+rel=["']canonical["'][\s\S]*?>/i, `<link rel="canonical" href="${url}" />`);
  modified = modified.replace(/<meta\s+property=["']og:title["'][\s\S]*?>/i, `<meta property="og:title" content="${title}" />`);
  modified = modified.replace(/<meta\s+property=["']og:description["'][\s\S]*?>/i, `<meta property="og:description" content="${description}" />`);
  modified = modified.replace(/<meta\s+property=["']og:url["'][\s\S]*?>/i, `<meta property="og:url" content="${url}" />`);

  const schemaScript = `\n    <script type="application/ld+json" id="server-structured-data">\n${schemaJson}\n    </script>\n  `;
  modified = modified.replace("</head>", `${schemaScript}</head>`);

  const ssrBody = `<div class="max-w-5xl mx-auto px-4 py-8 font-serif-editorial">
    <header style="text-align:center;margin-bottom:3rem;padding-bottom:2rem;border-bottom:1px solid #eae8e0;">
      <h1 style="font-size:2.5rem;font-weight:700;color:#1a1a1a;margin-bottom:0.5rem;">
        YieldNest.online
      </h1>
      <p style="font-size:1.1rem;color:#57534e;max-w-2xl;margin:0 auto;line-height:1.6;">
        ${escapeHtml(description)}
      </p>
      <nav aria-label="Research Categories" style="margin-top:1.5rem;display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap;font-size:0.8rem;font-family:monospace;">
        <a href="/category/fund-comparison" style="color:#1a1a1a;padding:0.35rem 0.75rem;background:#eae8e0;border-radius:0.5rem;text-decoration:none;">Fund Comparisons</a>
        <a href="/category/performance-analysis" style="color:#1a1a1a;padding:0.35rem 0.75rem;background:#eae8e0;border-radius:0.5rem;text-decoration:none;">Performance Analysis</a>
        <a href="/category/market-trends" style="color:#1a1a1a;padding:0.35rem 0.75rem;background:#eae8e0;border-radius:0.5rem;text-decoration:none;">Market Trends</a>
        <a href="/category/category-deep-dive" style="color:#1a1a1a;padding:0.35rem 0.75rem;background:#eae8e0;border-radius:0.5rem;text-decoration:none;">Category Deep-Dive</a>
        <a href="/category/sip-strategies" style="color:#1a1a1a;padding:0.35rem 0.75rem;background:#eae8e0;border-radius:0.5rem;text-decoration:none;">SIP Tactics</a>
      </nav>
    </header>
    <main>
      <h2 style="font-size:1.2rem;font-family:monospace;font-weight:600;margin-bottom:1.5rem;text-transform:uppercase;letter-spacing:0.05em;color:#292524;">
        Mutual Fund Research & Analysis
      </h2>
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        ${articles
          .map(
            (art) => `<article style="padding:1.5rem;background:#fbfaf8;border:1px solid #eae8e0;border-radius:0.75rem;">
              <div style="font-size:0.75rem;font-family:monospace;color:#047857;font-weight:600;margin-bottom:0.35rem;">
                ${escapeHtml(art.category)}
              </div>
              <h3 style="font-size:1.35rem;font-weight:600;margin-bottom:0.5rem;">
                <a href="/article/${encodeURIComponent(art.slug)}" style="color:#1a1a1a;text-decoration:underline;">${escapeHtml(art.title)}</a>
              </h3>
              <p style="font-size:0.95rem;color:#57534e;line-height:1.6;margin-bottom:0.75rem;">
                ${escapeHtml(art.excerpt)}
              </p>
              <div style="font-size:0.75rem;font-family:monospace;color:#78716c;">
                <span>Published: ${new Date(art.publishedAt || art.createdAt || Date.now()).toLocaleDateString()}</span> • <span>${art.readTimeMinutes || 6} min read</span>
              </div>
            </article>`
          )
          .join("\n")}
      </div>
    </main>
  </div>`;

  return modified.replace('<div id="root"></div>', `<div id="root">${ssrBody}</div>`);
}

function injectCategory(template: string, categorySlug: string, articles: any[]): string {
  const meta = CATEGORY_META[categorySlug];
  if (!meta) return template;

  const title = `${meta.title}`;
  const description = `${meta.description}`;
  // Strictly clean canonical URL with NO trailing slash
  const url = `${CANONICAL_ORIGIN}/category/${categorySlug}`;
  const categoryArticles = articles.filter(
    (a) => (CATEGORY_NAME_TO_SLUG[a.category] || "").toLowerCase() === categorySlug.toLowerCase()
  );

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        "url": url,
        "name": title,
        "description": description,
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${CANONICAL_ORIGIN}/#website`,
          "name": "YieldNest.online",
          "url": `${CANONICAL_ORIGIN}/`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${CANONICAL_ORIGIN}/`,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": meta.name,
            "item": url,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#itemlist`,
        "name": `${meta.name} Research Articles`,
        "itemListElement": categoryArticles.map((art, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": art.title,
          "url": `${CANONICAL_ORIGIN}/article/${encodeURIComponent(art.slug)}`,
        })),
      },
    ],
  });

  let modified = template;
  modified = modified.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  modified = modified.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${description}" />`);
  modified = modified.replace(/<link\s+rel=["']canonical["'][\s\S]*?>/i, `<link rel="canonical" href="${url}" />`);
  modified = modified.replace(/<meta\s+property=["']og:title["'][\s\S]*?>/i, `<meta property="og:title" content="${title}" />`);
  modified = modified.replace(/<meta\s+property=["']og:description["'][\s\S]*?>/i, `<meta property="og:description" content="${description}" />`);
  modified = modified.replace(/<meta\s+property=["']og:url["'][\s\S]*?>/i, `<meta property="og:url" content="${url}" />`);
  modified = modified.replace(/<meta\s+name=["']twitter:title["'][\s\S]*?>/i, `<meta name="twitter:title" content="${title}" />`);
  modified = modified.replace(/<meta\s+name=["']twitter:description["'][\s\S]*?>/i, `<meta name="twitter:description" content="${description}" />`);

  const schemaScript = `\n    <script type="application/ld+json" id="server-structured-data">\n${schemaJson}\n    </script>\n  `;
  modified = modified.replace("</head>", `${schemaScript}</head>`);

  const ssrBody = `<div class="max-w-5xl mx-auto px-4 py-8 font-serif-editorial">
    <nav aria-label="Breadcrumb" style="font-size:0.75rem;font-family:monospace;margin-bottom:1.5rem;color:#78716c;">
      <a href="/" style="color:#44403c;text-decoration:underline;">Home</a> / <span style="color:#1c1917;">${escapeHtml(meta.name)}</span>
    </nav>
    <header style="margin-bottom:2.5rem;border-bottom:1px solid #eae8e0;padding-bottom:1.5rem;">
      <span style="display:inline-block;padding:0.25rem 0.6rem;background:#1a1a1a;color:#ffffff;border-radius:0.25rem;font-size:0.75rem;font-weight:600;margin-bottom:0.75rem;">
        Research Category
      </span>
      <h1 style="font-size:2.2rem;font-weight:700;color:#1a1a1a;margin-bottom:0.5rem;">
        ${escapeHtml(meta.name)} Mutual Fund Research
      </h1>
      <p style="font-size:1rem;color:#57534e;line-height:1.6;max-w-2xl;">
        ${escapeHtml(meta.description)}
      </p>
    </header>
    <section>
      <h2 style="font-size:1.1rem;font-family:monospace;font-weight:600;color:#44403c;margin-bottom:1.25rem;text-transform:uppercase;letter-spacing:0.05em;">
        Published Papers (${categoryArticles.length})
      </h2>
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        ${categoryArticles
          .map(
            (art) => `<article style="padding:1.5rem;background:#fbfaf8;border:1px solid #eae8e0;border-radius:0.75rem;">
              <h3 style="font-size:1.3rem;font-weight:600;margin-bottom:0.5rem;">
                <a href="/article/${encodeURIComponent(art.slug)}" style="color:#1a1a1a;text-decoration:underline;">${escapeHtml(art.title)}</a>
              </h3>
              <p style="font-size:0.9rem;color:#57534e;line-height:1.6;margin-bottom:0.75rem;">
                ${escapeHtml(art.excerpt)}
              </p>
              <div style="font-size:0.75rem;font-family:monospace;color:#78716c;">
                <span>Published: ${new Date(art.publishedAt || art.createdAt || Date.now()).toLocaleDateString()}</span> • <span>${art.readTimeMinutes || 6} min read</span>
              </div>
            </article>`
          )
          .join("\n")}
      </div>
    </section>
  </div>`;

  return modified.replace('<div id="root"></div>', `<div id="root">${ssrBody}</div>`);
}

function injectArticle(template: string, article: any): string {
  const title = `${escapeHtml(article.title)} | YieldNest.online`;
  const description = escapeHtml(article.excerpt || "Independent mutual fund research on YieldNest.online.");
  // Strictly clean canonical URL with NO trailing slash
  const url = `${CANONICAL_ORIGIN}/article/${encodeURIComponent(article.slug)}`;
  const datePublished = new Date(article.publishedAt || article.createdAt || Date.now()).toISOString();
  const dateModified = new Date(article.updatedAt || article.createdAt || Date.now()).toISOString();
  const catSlug = CATEGORY_NAME_TO_SLUG[article.category] || "fund-comparison";
  const catUrl = `${CANONICAL_ORIGIN}/category/${catSlug}`;

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FinancialArticle",
        "@id": `${url}#article`,
        "isPartOf": {
          "@type": "WebPage",
          "@id": url,
          "url": url,
          "name": title,
        },
        "headline": article.title,
        "description": article.excerpt,
        "url": url,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url,
        },
        "datePublished": datePublished,
        "dateModified": dateModified,
        "author": {
          "@type": "Organization",
          "name": "YieldNest Research Desk",
        },
        "publisher": {
          "@type": "Organization",
          "name": "YieldNest.online",
          "url": `${CANONICAL_ORIGIN}/`,
        },
        "articleSection": article.category,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${CANONICAL_ORIGIN}/`,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": article.category,
            "item": catUrl,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": article.title,
            "item": url,
          },
        ],
      },
    ],
  });

  let modified = template;
  modified = modified.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  modified = modified.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${description}" />`);
  modified = modified.replace(/<link\s+rel=["']canonical["'][\s\S]*?>/i, `<link rel="canonical" href="${url}" />`);
  modified = modified.replace(/<meta\s+property=["']og:title["'][\s\S]*?>/i, `<meta property="og:title" content="${title}" />`);
  modified = modified.replace(/<meta\s+property=["']og:description["'][\s\S]*?>/i, `<meta property="og:description" content="${description}" />`);
  modified = modified.replace(/<meta\s+property=["']og:url["'][\s\S]*?>/i, `<meta property="og:url" content="${url}" />`);
  modified = modified.replace(/<meta\s+property=["']og:type["'][\s\S]*?>/i, `<meta property="og:type" content="article" />`);
  modified = modified.replace(/<meta\s+name=["']twitter:title["'][\s\S]*?>/i, `<meta name="twitter:title" content="${title}" />`);
  modified = modified.replace(/<meta\s+name=["']twitter:description["'][\s\S]*?>/i, `<meta name="twitter:description" content="${description}" />`);

  const schemaScript = `\n    <script type="application/ld+json" id="server-structured-data">\n${schemaJson}\n    </script>\n  `;
  modified = modified.replace("</head>", `${schemaScript}</head>`);

  const renderedContent = renderMarkdownToHtml(article.content || "");
  const formattedDate = new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const ssrBody = `<div class="max-w-4xl mx-auto px-4 py-8 font-serif-editorial">
    <nav aria-label="Breadcrumb" style="font-size:0.75rem;font-family:monospace;margin-bottom:1.5rem;color:#78716c;">
      <a href="/" style="color:#44403c;text-decoration:underline;">Home</a> / <a href="${catUrl}" style="color:#44403c;text-decoration:underline;">${escapeHtml(article.category)}</a> / <span style="color:#1c1917;">${escapeHtml(article.title)}</span>
    </nav>
    <article>
      <header style="margin-bottom:2rem;border-bottom:1px solid #eae8e0;padding-bottom:1.5rem;">
        <div style="display:inline-block;padding:0.2rem 0.6rem;background:#eae8e0;color:#1c1917;border-radius:0.25rem;font-size:0.75rem;font-weight:600;margin-bottom:0.75rem;">
          ${escapeHtml(article.category)}
        </div>
        <h1 style="font-size:2.2rem;font-weight:700;line-height:1.2;color:#1a1a1a;margin-bottom:1rem;">
          ${escapeHtml(article.title)}
        </h1>
        <div style="font-size:0.8rem;font-family:monospace;color:#78716c;display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;">
          <span>By <strong>YieldNest Research Desk</strong></span>
          <span>•</span>
          <time datetime="${datePublished}">${formattedDate}</time>
          <span>•</span>
          <span>${article.readTimeMinutes || 6} min read</span>
          <span>•</span>
          <span style="color:#059669;font-weight:600;">AMFI Scheme Verified</span>
        </div>
        <p style="font-size:1.05rem;line-height:1.6;color:#57534e;margin-top:1rem;font-style:italic;">
          ${escapeHtml(article.excerpt)}
        </p>
      </header>
      <div class="article-body">
        ${renderedContent}
      </div>
      <footer style="margin-top:3rem;padding:1.5rem;background:#ffffff;border:1px solid #e5e3dc;border-radius:0.75rem;font-size:0.75rem;color:#57534e;line-height:1.6;">
        <strong style="color:#1c1917;">Statutory Disclosure:</strong> YieldNest.online is an independent quantitative investor education platform and is not SEBI or AMFI registered. Mutual fund investments are subject to market risks; read all scheme related documents carefully before investing.
      </footer>
    </article>
  </div>`;

  return modified.replace('<div id="root"></div>', `<div id="root">${ssrBody}</div>`);
}

function buildSitemapXmlString(articles: any[]): string {
  const today = new Date().toISOString().split("T")[0];
  const categories = Object.keys(CATEGORY_META);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${CANONICAL_ORIGIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${categories
  .map(
    (cat) => `  <url>
    <loc>${CANONICAL_ORIGIN}/category/${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("\n")}
${articles
  .map((art) => {
    const rawDate = art.updatedAt || art.publishedAt || today;
    const lastMod = rawDate.split("T")[0];
    return `  <url>
    <loc>${CANONICAL_ORIGIN}/article/${encodeURIComponent(art.slug)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;
}

async function runPrerender() {
  console.log("🚀 [Prerender] Starting static HTML generation for Vercel/production deployment...");

  const baseIndexPath = path.join(distDir, "index.html");
  if (!fs.existsSync(baseIndexPath)) {
    console.error("❌ [Prerender] dist/index.html not found! Run vite build first.");
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseIndexPath, "utf-8");
  const articles = loadAllArticles();
  console.log(`📑 [Prerender] Loaded ${articles.length} published research articles.`);

  // 1. Prerender Homepage
  const homepageHtml = injectHomepage(baseHtml, articles);
  fs.writeFileSync(baseIndexPath, homepageHtml, "utf-8");
  console.log("  ✓ Prerendered dist/index.html (Canonical: https://www.yieldnest.online/)");

  // 2. Prerender Category Pages
  for (const catSlug of Object.keys(CATEGORY_META)) {
    const catHtml = injectCategory(baseHtml, catSlug, articles);
    const catDir = path.join(distDir, "category", catSlug);
    fs.mkdirSync(catDir, { recursive: true });

    // Both dist/category/catSlug.html (for cleanUrls) and dist/category/catSlug/index.html
    fs.writeFileSync(path.join(distDir, "category", `${catSlug}.html`), catHtml, "utf-8");
    fs.writeFileSync(path.join(catDir, "index.html"), catHtml, "utf-8");
    console.log(`  ✓ Prerendered /category/${catSlug} (Canonical: https://www.yieldnest.online/category/${catSlug})`);
  }

  // 3. Prerender Article Pages
  for (const art of articles) {
    const artHtml = injectArticle(baseHtml, art);
    const artDir = path.join(distDir, "article", art.slug);
    fs.mkdirSync(artDir, { recursive: true });

    // Both dist/article/slug.html (for cleanUrls) and dist/article/slug/index.html
    fs.writeFileSync(path.join(distDir, "article", `${art.slug}.html`), artHtml, "utf-8");
    fs.writeFileSync(path.join(artDir, "index.html"), artHtml, "utf-8");
    console.log(`  ✓ Prerendered /article/${art.slug} (Canonical: https://www.yieldnest.online/article/${art.slug})`);
  }

  // 4. Generate and sync sitemap.xml to dist and public
  const sitemapXml = buildSitemapXmlString(articles);
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml, "utf-8");
  fs.writeFileSync(path.join(rootDir, "public", "sitemap.xml"), sitemapXml, "utf-8");
  console.log("  ✓ Synced sitemap.xml to dist/ and public/ with all www.yieldnest.online URLs");

  // 5. Sync robots.txt
  const robotsSrc = path.join(rootDir, "public", "robots.txt");
  if (fs.existsSync(robotsSrc)) {
    fs.copyFileSync(robotsSrc, path.join(distDir, "robots.txt"));
    console.log("  ✓ Copied robots.txt to dist/");
  }

  // 6. Sync llms.txt and llms-full.txt
  for (const llmFile of ["llms.txt", "llms-full.txt"]) {
    const src = path.join(rootDir, "public", llmFile);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(distDir, llmFile));
      console.log(`  ✓ Copied ${llmFile} to dist/`);
    }
  }

  // 7. Sync ai-catalog.json and ard.json for Agentic Browsing (ARD spec)
  const distWellKnown = path.join(distDir, ".well-known");
  fs.mkdirSync(distWellKnown, { recursive: true });
  for (const catalogFile of ["ai-catalog.json", "ard.json"]) {
    const src = path.join(rootDir, "public", ".well-known", catalogFile);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(distWellKnown, catalogFile));
      console.log(`  ✓ Copied .well-known/${catalogFile} to dist/.well-known/`);
    }
  }
  const rootCatalog = path.join(rootDir, "public", "ai-catalog.json");
  if (fs.existsSync(rootCatalog)) {
    fs.copyFileSync(rootCatalog, path.join(distDir, "ai-catalog.json"));
  }

  console.log("✨ [Prerender] All static SEO pages successfully pre-rendered with zero redirects!");
}

runPrerender().catch((err) => {
  console.error("❌ [Prerender] Error during static prerendering:", err);
  process.exit(1);
});
