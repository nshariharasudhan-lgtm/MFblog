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
    title: "Fund Comparison & Analysis | YieldNest",
    description: "Side-by-side mutual fund analyses, 5-year rolling returns, downside capture, and AMFI scheme comparisons on YieldNest.online.",
  },
  "performance-analysis": {
    name: "Performance Analysis",
    title: "Performance & Rolling Returns | YieldNest",
    description: "Quantitative mutual fund performance analysis, risk-adjusted ratios (Sharpe, Sortino), and rolling return evaluations.",
  },
  "market-trends": {
    name: "Market Trends",
    title: "Market Trends & Inflow Analytics | YieldNest",
    description: "Analysis of Indian mutual fund market trends, AMFI monthly inflow trajectories, SIP book growth, and industry liquidity.",
  },
  "category-deep-dive": {
    name: "Category Deep-Dive",
    title: "Category Deep-Dive Analyses | YieldNest",
    description: "Comprehensive deep-dives into Indian equity fund categories: Flexi Cap, Small Cap, Large & Mid Cap, and Index funds.",
  },
  "sip-strategies": {
    name: "SIP Strategies",
    title: "SIP Strategies & Compounding | YieldNest",
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
    if (art && art.status === "published") {
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
          if (art && art.status === "published") {
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

function buildSharedFooterHtml(): string {
  return `<footer style="margin-top:3.5rem;padding-top:2rem;border-top:1px solid #eae8e0;font-family:system-ui, -apple-system, sans-serif;font-size:0.85rem;color:#57534e;">
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:2rem;margin-bottom:2rem;">
      <div>
        <div style="font-weight:700;color:#1a1a1a;margin-bottom:0.75rem;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;">Research Categories</div>
        <ul style="list-style:none;padding:0;margin:0;line-height:1.9;">
          <li><a href="/category/fund-comparison" style="color:#44403c;text-decoration:none;">Fund Comparisons</a></li>
          <li><a href="/category/performance-analysis" style="color:#44403c;text-decoration:none;">Performance Analysis</a></li>
          <li><a href="/category/market-trends" style="color:#44403c;text-decoration:none;">Market Trends</a></li>
          <li><a href="/category/category-deep-dive" style="color:#44403c;text-decoration:none;">Category Deep-Dive</a></li>
          <li><a href="/category/sip-strategies" style="color:#44403c;text-decoration:none;">SIP Strategies</a></li>
        </ul>
      </div>
      <div>
        <div style="font-weight:700;color:#1a1a1a;margin-bottom:0.75rem;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;">Financial Calculators</div>
        <ul style="list-style:none;padding:0;margin:0;line-height:1.9;">
          <li><a href="/calculators" style="color:#047857;font-weight:600;text-decoration:none;">🧮 Calculator Suite Hub</a></li>
          <li><a href="/calculator/direct-vs-regular" style="color:#44403c;text-decoration:none;">Direct vs Regular (TER Drag)</a></li>
          <li><a href="/calculator/step-up-sip" style="color:#44403c;text-decoration:none;">Step-Up SIP Calculator</a></li>
          <li><a href="/calculator/cost-of-delay" style="color:#44403c;text-decoration:none;">Cost of Delay (Procrastination Tax)</a></li>
          <li><a href="/calculator/sip-vs-lumpsum" style="color:#44403c;text-decoration:none;">SIP vs Lumpsum Comparator</a></li>
        </ul>
      </div>
      <div>
        <div style="font-weight:700;color:#1a1a1a;margin-bottom:0.75rem;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;">Sitemaps &amp; Verification</div>
        <ul style="list-style:none;padding:0;margin:0;line-height:1.9;">
          <li><a href="/sitemap.xml" style="color:#44403c;text-decoration:underline;">Sitemap.xml</a></li>
          <li><a href="/robots.txt" style="color:#44403c;text-decoration:underline;">Robots.txt</a></li>
          <li><a href="/llms.txt" style="color:#44403c;text-decoration:underline;">LLMs Context</a></li>
        </ul>
      </div>
    </div>
    <div style="padding:1rem;background:#ffffff;border:1px solid #eae8e0;border-radius:0.5rem;font-size:0.75rem;line-height:1.5;">
      <strong>Statutory Notice:</strong> YieldNest.online is an independent quantitative investor education platform. Content is strictly for research and academic evaluation, not financial advice. Mutual fund investments are subject to market risks; read all scheme related documents carefully.
    </div>
  </footer>`;
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
  const homeKeywords = "mutual funds India, AMFI, SIP investment, mutual fund performance, rolling returns, Indian equity, fund comparison, mutual fund calculator";
  modified = modified.replace(/<meta\s+name=["']keywords["'][\s\S]*?>/i, `<meta name="keywords" content="${homeKeywords}" />`);
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
      <nav aria-label="Research Categories & Calculators" style="margin-top:1.5rem;display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap;font-size:0.8rem;font-family:monospace;">
        <a href="/category/fund-comparison" style="color:#1a1a1a;padding:0.35rem 0.75rem;background:#eae8e0;border-radius:0.5rem;text-decoration:none;">Fund Comparisons</a>
        <a href="/category/performance-analysis" style="color:#1a1a1a;padding:0.35rem 0.75rem;background:#eae8e0;border-radius:0.5rem;text-decoration:none;">Performance Analysis</a>
        <a href="/category/market-trends" style="color:#1a1a1a;padding:0.35rem 0.75rem;background:#eae8e0;border-radius:0.5rem;text-decoration:none;">Market Trends</a>
        <a href="/category/category-deep-dive" style="color:#1a1a1a;padding:0.35rem 0.75rem;background:#eae8e0;border-radius:0.5rem;text-decoration:none;">Category Deep-Dive</a>
        <a href="/category/sip-strategies" style="color:#1a1a1a;padding:0.35rem 0.75rem;background:#eae8e0;border-radius:0.5rem;text-decoration:none;">SIP Tactics</a>
        <a href="/calculators" style="color:#065f46;background:#d1fae5;font-weight:700;padding:0.35rem 0.75rem;border-radius:0.5rem;text-decoration:none;border:1px solid #a7f3d0;">🧮 Calculators Suite</a>
      </nav>
    </header>
    <main>
      <section style="margin-bottom:3rem;padding:2rem;background:#fbfaf8;border:1px solid #eae8e0;border-radius:0.75rem;">
        <div style="font-size:0.75rem;font-family:monospace;color:#047857;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.35rem;">
          Financial Simulation Tools
        </div>
        <h2 style="font-size:1.5rem;font-weight:700;color:#1a1a1a;margin-bottom:0.5rem;">
          Mutual Fund Quantitative Calculator Suite
        </h2>
        <p style="font-size:0.95rem;color:#57534e;line-height:1.6;margin-bottom:1.25rem;">
          Mathematically simulate Total Expense Ratio drag, annual step-up compounding, SIP delay penalties, and lumpsum entry dynamics under Indian market conditions.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:1rem;">
          <a href="/calculator/direct-vs-regular" style="padding:1rem;background:#ffffff;border:1px solid #eae8e0;border-radius:0.5rem;text-decoration:none;color:#1a1a1a;display:block;">
            <strong style="display:block;font-size:0.95rem;color:#1a1a1a;margin-bottom:0.25rem;">Direct vs Regular Calculator</strong>
            <span style="font-size:0.8rem;color:#78716c;line-height:1.4;display:block;">Calculate how much corpus you forfeit to distributor trail commissions &amp; TER drag.</span>
          </a>
          <a href="/calculator/step-up-sip" style="padding:1rem;background:#ffffff;border:1px solid #eae8e0;border-radius:0.5rem;text-decoration:none;color:#1a1a1a;display:block;">
            <strong style="display:block;font-size:0.95rem;color:#1a1a1a;margin-bottom:0.25rem;">Step-Up SIP Calculator</strong>
            <span style="font-size:0.8rem;color:#78716c;line-height:1.4;display:block;">Model compounding acceleration by increasing your monthly SIP by 5% to 25% each year.</span>
          </a>
          <a href="/calculator/cost-of-delay" style="padding:1rem;background:#ffffff;border:1px solid #eae8e0;border-radius:0.5rem;text-decoration:none;color:#1a1a1a;display:block;">
            <strong style="display:block;font-size:0.95rem;color:#1a1a1a;margin-bottom:0.25rem;">Cost of Delay Calculator</strong>
            <span style="font-size:0.8rem;color:#78716c;line-height:1.4;display:block;">Find out the compound interest penalty of waiting 6 months to 5 years before starting.</span>
          </a>
          <a href="/calculator/sip-vs-lumpsum" style="padding:1rem;background:#ffffff;border:1px solid #eae8e0;border-radius:0.5rem;text-decoration:none;color:#1a1a1a;display:block;">
            <strong style="display:block;font-size:0.95rem;color:#1a1a1a;margin-bottom:0.25rem;">SIP vs Lumpsum Comparator</strong>
            <span style="font-size:0.8rem;color:#78716c;line-height:1.4;display:block;">Compare rupee-cost averaging against a one-time lump-sum allocation with delta analytics.</span>
          </a>
        </div>
      </section>

      <h2 style="font-size:1.2rem;font-family:monospace;font-weight:600;margin-bottom:1.5rem;text-transform:uppercase;letter-spacing:0.05em;color:#292524;">
        Mutual Fund Research &amp; Analysis
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
    ${buildSharedFooterHtml()}
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
  const catKeywords = `${meta.name}, mutual fund research, AMFI, performance analysis, rolling returns, Indian mutual funds`;
  modified = modified.replace(/<meta\s+name=["']keywords["'][\s\S]*?>/i, `<meta name="keywords" content="${catKeywords}" />`);
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
    ${buildSharedFooterHtml()}
  </div>`;

  return modified.replace('<div id="root"></div>', `<div id="root">${ssrBody}</div>`);
}

function injectArticle(template: string, article: any): string {
  const rawMetaTitle = article.seoMetadata?.metaTitle || `${article.title} | YieldNest`;
  const cleanTitle = rawMetaTitle.length > 58 ? rawMetaTitle.slice(0, 55).trim() + "..." : rawMetaTitle;
  const title = escapeHtml(cleanTitle);
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

  const rawKeywords = [
    article.seoMetadata?.primaryKeyword,
    ...(Array.isArray(article.tags) ? article.tags : []),
    ...(Array.isArray(article.seoMetadata?.secondaryKeywords) ? article.seoMetadata.secondaryKeywords : []),
    article.category,
    "mutual funds India",
  ].filter((k): k is string => Boolean(k && typeof k === "string" && k.trim().length > 0));

  const seenKw = new Set<string>();
  const uniqueKw: string[] = [];
  for (const item of rawKeywords) {
    const clean = item.trim();
    const lower = clean.toLowerCase();
    if (!seenKw.has(lower)) {
      seenKw.add(lower);
      uniqueKw.push(clean);
    }
  }
  const articleKeywords = uniqueKw.join(", ");

  let modified = template;
  modified = modified.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  modified = modified.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${description}" />`);
  modified = modified.replace(/<meta\s+name=["']keywords["'][\s\S]*?>/i, `<meta name="keywords" content="${escapeHtml(articleKeywords)}" />`);
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
      <section style="margin-top:2.5rem;padding:1.5rem;background:#fbfaf8;border:1px solid #eae8e0;border-radius:0.75rem;">
        <h3 style="font-size:1.1rem;font-weight:700;color:#1a1a1a;margin-bottom:0.5rem;">Explore Quantitative Investment Calculators</h3>
        <p style="font-size:0.85rem;color:#57534e;line-height:1.5;margin-bottom:1rem;">Model compounding math, fee friction, and optimal asset allocation on YieldNest:</p>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;font-size:0.8rem;font-family:monospace;">
          <a href="/calculator/direct-vs-regular" style="padding:0.4rem 0.8rem;background:#ffffff;border:1px solid #d6d3d1;border-radius:0.35rem;text-decoration:none;color:#1a1a1a;">Direct vs Regular TER Drag</a>
          <a href="/calculator/step-up-sip" style="padding:0.4rem 0.8rem;background:#ffffff;border:1px solid #d6d3d1;border-radius:0.35rem;text-decoration:none;color:#1a1a1a;">Step-Up SIP Calculator</a>
          <a href="/calculator/cost-of-delay" style="padding:0.4rem 0.8rem;background:#ffffff;border:1px solid #d6d3d1;border-radius:0.35rem;text-decoration:none;color:#1a1a1a;">Cost of Delay Tax</a>
          <a href="/calculator/sip-vs-lumpsum" style="padding:0.4rem 0.8rem;background:#ffffff;border:1px solid #d6d3d1;border-radius:0.35rem;text-decoration:none;color:#1a1a1a;">SIP vs Lumpsum Comparator</a>
        </div>
      </section>
      ${buildSharedFooterHtml()}
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
  <url>
    <loc>${CANONICAL_ORIGIN}/calculators</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${CANONICAL_ORIGIN}/calculator/direct-vs-regular</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${CANONICAL_ORIGIN}/calculator/step-up-sip</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${CANONICAL_ORIGIN}/calculator/cost-of-delay</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${CANONICAL_ORIGIN}/calculator/sip-vs-lumpsum</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
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

function injectCalculatorPage(template: string, calc: { slug: string; path: string; title: string; description: string; canonical: string }): string {
  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${calc.canonical}#app`,
        "name": calc.title,
        "url": calc.canonical,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript",
        "description": calc.description,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
        },
        "publisher": {
          "@type": "Organization",
          "name": "YieldNest.online",
          "url": CANONICAL_ORIGIN,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${calc.canonical}#breadcrumb`,
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
            "name": "Calculators",
            "item": `${CANONICAL_ORIGIN}/calculators`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": calc.title,
            "item": calc.canonical,
          },
        ],
      },
    ],
  });

  let modified = template;
  modified = modified.replace(/<title>.*?<\/title>/i, `<title>${calc.title}</title>`);
  modified = modified.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${calc.description}" />`);
  const calcKeywords = `${calc.title}, mutual fund calculator, SIP calculator, financial planning India, wealth compounding, AMFI calculator`;
  modified = modified.replace(/<meta\s+name=["']keywords["'][\s\S]*?>/i, `<meta name="keywords" content="${escapeHtml(calcKeywords)}" />`);
  modified = modified.replace(/<link\s+rel=["']canonical["'][\s\S]*?>/i, `<link rel="canonical" href="${calc.canonical}" />`);
  modified = modified.replace(/<meta\s+property=["']og:title["'][\s\S]*?>/i, `<meta property="og:title" content="${calc.title}" />`);
  modified = modified.replace(/<meta\s+property=["']og:description["'][\s\S]*?>/i, `<meta property="og:description" content="${calc.description}" />`);
  modified = modified.replace(/<meta\s+property=["']og:url["'][\s\S]*?>/i, `<meta property="og:url" content="${calc.canonical}" />`);
  modified = modified.replace(/<meta\s+name=["']twitter:title["'][\s\S]*?>/i, `<meta name="twitter:title" content="${calc.title}" />`);
  modified = modified.replace(/<meta\s+name=["']twitter:description["'][\s\S]*?>/i, `<meta name="twitter:description" content="${calc.description}" />`);

  const schemaScript = `\n    <script type="application/ld+json" id="server-structured-data">\n${schemaJson}\n    </script>\n  `;
  modified = modified.replace("</head>", `${schemaScript}</head>`);

  let mainBody = "";
  if (calc.slug === "direct-vs-regular") {
    mainBody = `
      <section style="margin-bottom:2.5rem;">
        <span style="font-size:0.75rem;font-family:monospace;color:#047857;font-weight:700;text-transform:uppercase;">Quantitative Fee Drag Simulation</span>
        <h1 style="font-size:2.2rem;font-weight:700;color:#1a1a1a;margin-top:0.35rem;margin-bottom:1rem;">Direct vs Regular Mutual Fund Calculator</h1>
        <p style="font-size:1.05rem;color:#44403c;line-height:1.6;margin-bottom:1.5rem;">
          In Indian mutual funds, regular plans include ongoing distributor commissions (typically 0.50% to 1.50% annually) deducted daily from your scheme's Net Asset Value (NAV). Direct plans eliminate this intermediary friction, compounding directly to your terminal corpus.
        </p>
        <div style="background:#ffffff;border:1px solid #e5e3dc;border-radius:0.75rem;padding:1.5rem;margin-bottom:2rem;">
          <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:0.75rem;">Mathematical Mechanics of the 1% Difference</h2>
          <p style="font-size:0.9rem;color:#57534e;line-height:1.6;margin-bottom:1rem;">
            Because mutual fund returns compound exponentially, a 1.00% difference in annual Total Expense Ratio (TER) does not mean a 1% loss in terminal wealth. Over 20 years, a 1% fee difference forfeits approximately 15% to 22% of your entire portfolio corpus.
          </p>
          <div style="overflow-x:auto;">
            <table style="width:100%;font-size:0.85rem;border-collapse:collapse;font-family:monospace;margin-top:1rem;">
              <thead>
                <tr style="background:#f5f4ef;border-bottom:2px solid #e5e3dc;text-align:left;">
                  <th style="padding:0.75rem;">Tenure</th>
                  <th style="padding:0.75rem;">Total Invested</th>
                  <th style="padding:0.75rem;">Direct (12.5% Net)</th>
                  <th style="padding:0.75rem;">Regular (11.5% Net)</th>
                  <th style="padding:0.75rem;color:#b91c1c;">Wealth Lost to Drag</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #eae8e0;">
                  <td style="padding:0.75rem;">10 Years</td>
                  <td style="padding:0.75rem;">₹12,00,000</td>
                  <td style="padding:0.75rem;">₹24,40,000</td>
                  <td style="padding:0.75rem;">₹22,90,000</td>
                  <td style="padding:0.75rem;color:#b91c1c;font-weight:600;">₹1,50,000</td>
                </tr>
                <tr style="border-bottom:1px solid #eae8e0;">
                  <td style="padding:0.75rem;">15 Years</td>
                  <td style="padding:0.75rem;">₹18,00,000</td>
                  <td style="padding:0.75rem;">₹53,20,000</td>
                  <td style="padding:0.75rem;">₹48,10,000</td>
                  <td style="padding:0.75rem;color:#b91c1c;font-weight:600;">₹5,10,000</td>
                </tr>
                <tr style="border-bottom:1px solid #eae8e0;">
                  <td style="padding:0.75rem;">20 Years</td>
                  <td style="padding:0.75rem;">₹24,00,000</td>
                  <td style="padding:0.75rem;">₹1,09,90,000</td>
                  <td style="padding:0.75rem;">₹96,50,000</td>
                  <td style="padding:0.75rem;color:#b91c1c;font-weight:600;">₹13,40,000</td>
                </tr>
                <tr>
                  <td style="padding:0.75rem;">25 Years</td>
                  <td style="padding:0.75rem;">₹30,00,000</td>
                  <td style="padding:0.75rem;">₹2,21,40,000</td>
                  <td style="padding:0.75rem;">₹1,87,30,000</td>
                  <td style="padding:0.75rem;color:#b91c1c;font-weight:600;">₹34,10,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p style="font-size:0.95rem;color:#44403c;line-height:1.6;">
          Read our in-depth research breakdown: <a href="/article/direct-vs-regular-mutual-funds-charges-commissions-compounding" style="color:#047857;text-decoration:underline;font-weight:600;">Direct vs Regular Mutual Funds: The Compounding Drag of Distributor Commissions</a>.
        </p>
      </section>`;
  } else if (calc.slug === "step-up-sip") {
    mainBody = `
      <section style="margin-bottom:2.5rem;">
        <span style="font-size:0.75rem;font-family:monospace;color:#047857;font-weight:700;text-transform:uppercase;">Compounding Acceleration Modeling</span>
        <h1 style="font-size:2.2rem;font-weight:700;color:#1a1a1a;margin-top:0.35rem;margin-bottom:1rem;">Step-Up SIP Compounding Calculator</h1>
        <p style="font-size:1.05rem;color:#44403c;line-height:1.6;margin-bottom:1.5rem;">
          A Step-Up SIP (top-up SIP) automatically increases your monthly mutual fund investment by a predetermined percentage (e.g., 5%, 10%, or 15%) each year in sync with your career salary increments.
        </p>
        <div style="background:#ffffff;border:1px solid #e5e3dc;border-radius:0.75rem;padding:1.5rem;margin-bottom:2rem;">
          <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:0.75rem;">Why Annual Step-Ups Double Your Retirement Corpus</h2>
          <p style="font-size:0.9rem;color:#57534e;line-height:1.6;margin-bottom:1rem;">
            A fixed ₹10,000 SIP over 20 years at 12% returns yields ~₹99.9 Lakhs. But stepping up by just 10% annually boosts your corpus to over ₹2.05 Crore — more than double the wealth for a manageable incremental outlay.
          </p>
        </div>
        <p style="font-size:0.95rem;color:#44403c;line-height:1.6;">
          Explore our strategic guides: <a href="/category/sip-strategies" style="color:#047857;text-decoration:underline;font-weight:600;">SIP Strategies &amp; Compounding Tactics</a>.
        </p>
      </section>`;
  } else if (calc.slug === "cost-of-delay") {
    mainBody = `
      <section style="margin-bottom:2.5rem;">
        <span style="font-size:0.75rem;font-family:monospace;color:#047857;font-weight:700;text-transform:uppercase;">The Procrastination Tax</span>
        <h1 style="font-size:2.2rem;font-weight:700;color:#1a1a1a;margin-top:0.35rem;margin-bottom:1rem;">Cost of Delay SIP Calculator</h1>
        <p style="font-size:1.05rem;color:#44403c;line-height:1.6;margin-bottom:1.5rem;">
          In compounding mathematics, the money generated in the final years dwarfs the early contributions. Postponing your monthly SIP by even 1 or 2 years cuts off the highest-compounding years from your portfolio horizon.
        </p>
        <div style="background:#ffffff;border:1px solid #e5e3dc;border-radius:0.75rem;padding:1.5rem;margin-bottom:2rem;">
          <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:0.75rem;">The Penalty of Waiting 1 Year</h2>
          <p style="font-size:0.9rem;color:#57534e;line-height:1.6;">
            Waiting 12 months before starting a ₹10,000 monthly SIP costs you only ₹1,20,000 in missed contributions, but costs over ₹12,00,000 to ₹18,00,000 in lost terminal wealth over a 20-year horizon.
          </p>
        </div>
      </section>`;
  } else if (calc.slug === "sip-vs-lumpsum") {
    mainBody = `
      <section style="margin-bottom:2.5rem;">
        <span style="font-size:0.75rem;font-family:monospace;color:#047857;font-weight:700;text-transform:uppercase;">Strategy Comparison</span>
        <h1 style="font-size:2.2rem;font-weight:700;color:#1a1a1a;margin-top:0.35rem;margin-bottom:1rem;">SIP vs Lumpsum Calculator</h1>
        <p style="font-size:1.05rem;color:#44403c;line-height:1.6;margin-bottom:1.5rem;">
          Compare systematic monthly investments (SIP) that average out volatility through rupee-cost averaging against a one-time lump-sum allocation deployed immediately into Indian equities.
        </p>
        <div style="background:#ffffff;border:1px solid #e5e3dc;border-radius:0.75rem;padding:1.5rem;margin-bottom:2rem;">
          <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:0.75rem;">When to Choose SIP vs Lumpsum</h2>
          <p style="font-size:0.9rem;color:#57534e;line-height:1.6;">
            Lump-sum deployment mathematically delivers superior returns when markets trend upwards over long horizons, while SIP shields capital against severe short-term corrections.
          </p>
        </div>
      </section>`;
  } else {
    mainBody = `
      <section style="margin-bottom:2.5rem;">
        <span style="font-size:0.75rem;font-family:monospace;color:#047857;font-weight:700;text-transform:uppercase;">Quantitative Simulation Suite</span>
        <h1 style="font-size:2.4rem;font-weight:700;color:#1a1a1a;margin-top:0.35rem;margin-bottom:1rem;">Mutual Fund Quantitative Calculator Suite</h1>
        <p style="font-size:1.1rem;color:#44403c;line-height:1.6;margin-bottom:2rem;">
          Free, mathematically rigorous calculators for Indian mutual fund investors. Model expense ratio drag, annual step-up compounding, the financial cost of delaying investments, and SIP vs lumpsum allocations.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:1.5rem;margin-bottom:2.5rem;">
          <div style="padding:1.5rem;background:#ffffff;border:1px solid #eae8e0;border-radius:0.75rem;">
            <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;"><a href="/calculator/direct-vs-regular" style="color:#047857;text-decoration:underline;">Direct vs Regular Calculator</a></h2>
            <p style="font-size:0.85rem;color:#57534e;line-height:1.5;">Evaluate the terminal wealth drag caused by distributor trail commissions (0.50% - 1.50% TER differences) over 10 to 30 years.</p>
          </div>
          <div style="padding:1.5rem;background:#ffffff;border:1px solid #eae8e0;border-radius:0.75rem;">
            <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;"><a href="/calculator/step-up-sip" style="color:#047857;text-decoration:underline;">Step-Up SIP Calculator</a></h2>
            <p style="font-size:0.85rem;color:#57534e;line-height:1.5;">Simulate compounding acceleration when you increase monthly contributions by 5% to 25% each year with your salary hikes.</p>
          </div>
          <div style="padding:1.5rem;background:#ffffff;border:1px solid #eae8e0;border-radius:0.75rem;">
            <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;"><a href="/calculator/cost-of-delay" style="color:#047857;text-decoration:underline;">Cost of Delay Calculator</a></h2>
            <p style="font-size:0.85rem;color:#57534e;line-height:1.5;">Calculate the compound interest penalty of waiting 6 months, 1 year, or 2 years before initiating your investment program.</p>
          </div>
          <div style="padding:1.5rem;background:#ffffff;border:1px solid #eae8e0;border-radius:0.75rem;">
            <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;"><a href="/calculator/sip-vs-lumpsum" style="color:#047857;text-decoration:underline;">SIP vs Lumpsum Comparator</a></h2>
            <p style="font-size:0.85rem;color:#57534e;line-height:1.5;">Analyze risk and return trade-offs between a single lump-sum deployment and rupee-cost averaged monthly installments.</p>
          </div>
        </div>
      </section>`;
  }

  const ssrBody = `<div class="max-w-5xl mx-auto px-4 py-8 font-serif-editorial">
    <nav aria-label="Breadcrumb" style="font-size:0.75rem;font-family:monospace;margin-bottom:1.5rem;color:#78716c;">
      <a href="/" style="color:#44403c;text-decoration:underline;">Home</a> / <a href="/calculators" style="color:#44403c;text-decoration:underline;">Calculators</a> / <span style="color:#1c1917;">${escapeHtml(calc.title)}</span>
    </nav>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:2rem;font-size:0.8rem;font-family:monospace;">
      <a href="/calculators" style="padding:0.4rem 0.8rem;background:${calc.slug === 'calculators' ? '#1a1a1a;color:#ffffff;' : '#eae8e0;color:#1a1a1a;'}border-radius:0.35rem;text-decoration:none;">Suite Hub</a>
      <a href="/calculator/direct-vs-regular" style="padding:0.4rem 0.8rem;background:${calc.slug === 'direct-vs-regular' ? '#1a1a1a;color:#ffffff;' : '#eae8e0;color:#1a1a1a;'}border-radius:0.35rem;text-decoration:none;">Direct vs Regular</a>
      <a href="/calculator/step-up-sip" style="padding:0.4rem 0.8rem;background:${calc.slug === 'step-up-sip' ? '#1a1a1a;color:#ffffff;' : '#eae8e0;color:#1a1a1a;'}border-radius:0.35rem;text-decoration:none;">Step-Up SIP</a>
      <a href="/calculator/cost-of-delay" style="padding:0.4rem 0.8rem;background:${calc.slug === 'cost-of-delay' ? '#1a1a1a;color:#ffffff;' : '#eae8e0;color:#1a1a1a;'}border-radius:0.35rem;text-decoration:none;">Cost of Delay</a>
      <a href="/calculator/sip-vs-lumpsum" style="padding:0.4rem 0.8rem;background:${calc.slug === 'sip-vs-lumpsum' ? '#1a1a1a;color:#ffffff;' : '#eae8e0;color:#1a1a1a;'}border-radius:0.35rem;text-decoration:none;">SIP vs Lumpsum</a>
    </div>
    ${mainBody}
    ${buildSharedFooterHtml()}
  </div>`;

  return modified.replace('<div id="root"></div>', `<div id="root">${ssrBody}</div>`);
}

async function runPrerender() {
  console.log("🚀 [Prerender] Starting static HTML generation for Vercel/production deployment...");

  const baseIndexPath = path.join(distDir, "index.html");
  if (!fs.existsSync(baseIndexPath)) {
    console.error("❌ [Prerender] dist/index.html not found! Run vite build first.");
    process.exit(1);
  }

  let baseHtml = fs.readFileSync(baseIndexPath, "utf-8");

  // Keep standard stylesheet link for fast CDN caching and optimal text-to-HTML ratio
  console.log("  ✓ Using external stylesheet link to ensure lean HTML and optimal text-to-HTML ratio");

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

  // 3b. Prerender Calculators Suite Hub & Individual Dedicated Calculator Pages
  const CALCULATOR_PAGES = [
    {
      slug: "calculators",
      path: "calculators",
      title: "Mutual Fund Calculators Suite | YieldNest",
      description: "Free Indian mutual fund calculators. Calculate Direct vs Regular TER drag, step-up SIP compounding, procrastination delay costs, and SIP vs lumpsum returns.",
      canonical: "https://www.yieldnest.online/calculators",
    },
    {
      slug: "direct-vs-regular",
      path: "calculator/direct-vs-regular",
      title: "Direct vs Regular Fund Calculator | YieldNest",
      description: "Calculate how much wealth you lose to distributor commissions and Total Expense Ratio (TER) drag over your SIP tenure in Indian mutual funds.",
      canonical: "https://www.yieldnest.online/calculator/direct-vs-regular",
    },
    {
      slug: "step-up-sip",
      path: "calculator/step-up-sip",
      title: "Step-Up SIP Compounding Calculator | YieldNest",
      description: "Simulate how increasing your monthly SIP by 5% to 25% each year accelerates your mutual fund corpus. Calculate extra wealth generated by annual step-ups.",
      canonical: "https://www.yieldnest.online/calculator/step-up-sip",
    },
    {
      slug: "cost-of-delay",
      path: "calculator/cost-of-delay",
      title: "Cost of Delay SIP Calculator | YieldNest",
      description: "Find out how much money you lose by delaying your mutual fund SIP by 6 months, 1 year, or 2 years. Calculate the compound interest penalty of waiting.",
      canonical: "https://www.yieldnest.online/calculator/cost-of-delay",
    },
    {
      slug: "sip-vs-lumpsum",
      path: "calculator/sip-vs-lumpsum",
      title: "SIP vs Lumpsum Calculator | YieldNest",
      description: "Compare mutual fund returns between a one-time lumpsum investment and a staggered monthly SIP over the same time horizon with delta analysis.",
      canonical: "https://www.yieldnest.online/calculator/sip-vs-lumpsum",
    },
  ];

  for (const calc of CALCULATOR_PAGES) {
    const pageHtml = injectCalculatorPage(baseHtml, calc);

    // Write primary path (e.g. /calculator/direct-vs-regular)
    const targetDir = path.join(distDir, calc.path);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, `${calc.path}.html`), pageHtml, "utf-8");
    fs.writeFileSync(path.join(targetDir, "index.html"), pageHtml, "utf-8");

    // Also write plural alias (e.g. /calculators/direct-vs-regular) if it begins with calculator/
    if (calc.path.startsWith("calculator/")) {
      const pluralPath = calc.path.replace("calculator/", "calculators/");
      const pluralDir = path.join(distDir, pluralPath);
      fs.mkdirSync(pluralDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, `${pluralPath}.html`), pageHtml, "utf-8");
      fs.writeFileSync(path.join(pluralDir, "index.html"), pageHtml, "utf-8");
    }

    console.log(`  ✓ Prerendered /${calc.path} (Canonical: ${calc.canonical})`);
  }

  // 3c. Generate static HTML fallbacks for legacy/typo slugs so direct file access never 404s
  const LEGACY_ALIASES = [
    {
      sourceSlug: "direct-vs-regular-mutual-funds-charges-commissions-compissions",
      targetSlug: "direct-vs-regular-mutual-funds-charges-commissions-compounding",
    },
    {
      sourceSlug: "mid-cap-vs-small-cap-analyzing-risk-adjusted-returns-amidst-current-market-volatility",
      targetSlug: "mid-cap-vs-small-cap-analyzing-risk-adjusted-returns-amidst-current-market",
    },
    {
      sourceSlug: "total-expense-ratio-ter-breakdown-impact-sip-returns",
      targetSlug: "why-total-expense-ratio-ter-is-important-for-investors",
    },
  ];

  for (const alias of LEGACY_ALIASES) {
    const targetArt = articles.find((a) => a.slug === alias.targetSlug);
    if (targetArt) {
      const targetHtml = injectArticle(baseHtml, targetArt);
      const aliasDir = path.join(distDir, "article", alias.sourceSlug);
      fs.mkdirSync(aliasDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, "article", `${alias.sourceSlug}.html`), targetHtml, "utf-8");
      fs.writeFileSync(path.join(aliasDir, "index.html"), targetHtml, "utf-8");
      console.log(`  ✓ Created static fallback alias for /article/${alias.sourceSlug} -> /article/${alias.targetSlug}`);
    }
  }

  // 4. Generate and sync sitemap.xml to dist and public
  const sitemapXml = buildSitemapXmlString(articles);
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml, "utf-8");
  fs.writeFileSync(path.join(rootDir, "public", "sitemap.xml"), sitemapXml, "utf-8");
  console.log("  ✓ Synced sitemap.xml to dist/ and public/ with all www.yieldnest.online URLs");

  // 5. Sync robots.txt and IndexNow keys
  const robotsSrc = path.join(rootDir, "public", "robots.txt");
  if (fs.existsSync(robotsSrc)) {
    fs.copyFileSync(robotsSrc, path.join(distDir, "robots.txt"));
    console.log("  ✓ Copied robots.txt to dist/");
  }

  // 5b. Sync IndexNow verification files
  for (const indexNowFile of ["caef2d2b54404d86b8fecc69ca144cfc.txt", "indexnow.txt"]) {
    const src = path.join(rootDir, "public", indexNowFile);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(distDir, indexNowFile));
      console.log(`  ✓ Copied IndexNow key file ${indexNowFile} to dist/`);
    }
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

  // 8. Generate static api/posts.json for instant edge response on Vercel without cold start
  const apiDir = path.join(distDir, "api");
  const publicApiDir = path.join(rootDir, "public", "api");
  fs.mkdirSync(apiDir, { recursive: true });
  fs.mkdirSync(publicApiDir, { recursive: true });
  const postsJson = JSON.stringify(articles);
  fs.writeFileSync(path.join(apiDir, "posts.json"), postsJson, "utf-8");
  fs.writeFileSync(path.join(publicApiDir, "posts.json"), postsJson, "utf-8");
  // Also create dist/api/posts file for servers that serve exact path
  fs.writeFileSync(path.join(apiDir, "posts"), postsJson, "utf-8");
  console.log("  ✓ Generated static edge API endpoint at /api/posts.json and /api/posts");

  console.log("✨ [Prerender] All static SEO pages successfully pre-rendered with zero redirects!");
}

runPrerender().catch((err) => {
  console.error("❌ [Prerender] Error during static prerendering:", err);
  process.exit(1);
});
