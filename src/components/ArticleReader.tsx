import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  Copy,
  Check,
  BarChart2,
  Eye,
  FileText,
  ArrowRight,
  BookOpen,
  ShieldAlert,
  Sparkles,
  Tag,
} from "lucide-react";
import { ArticlePost, SiteSettings } from "../types";
import { CommentSection } from "./CommentSection";
import { FormattedInlineText } from "./FormattedInlineText";

interface ArticleReaderProps {
  post: ArticlePost;
  onBack: () => void;
  settings: SiteSettings;
  onOpenCategory: (cat: any) => void;
  allPosts?: ArticlePost[];
  onNavigateArticle?: (post: ArticlePost) => void;
}

export function ArticleReader({
  post,
  onBack,
  settings,
  onOpenCategory,
  allPosts = [],
  onNavigateArticle,
}: ArticleReaderProps) {
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Calculate reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const articleUrl = typeof window !== "undefined"
    ? `${window.location.origin}/article/${post.slug}`
    : `https://www.yieldnest.online/article/${post.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${post.title}" via ${settings.siteName}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(articleUrl)}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`*${post.title}*\n${post.excerpt}\n\nRead article: ${articleUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // Helper to resolve internal slug navigation
  const handleInternalSlugNavigation = (targetSlug: string) => {
    const matched = allPosts.find(
      (p) => p.slug.toLowerCase() === targetSlug.toLowerCase() || p.id === targetSlug
    );
    if (matched && onNavigateArticle) {
      onNavigateArticle(matched);
    } else {
      // Fallback navigation via history API
      window.history.pushState({}, "", `/article/${targetSlug}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Related articles suggestion algorithm based on category and shared tags
  const relatedArticles = React.useMemo(() => {
    const currentTags = (post.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
    const currentCategory = post.category;

    const candidates = allPosts
      .filter((p) => p.id !== post.id && p.status === "published")
      .map((p) => {
        let score = 0;
        const candidateTags = (p.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
        const sharedTags: string[] = [];

        // 1. Shared tags match (3 points per exact match, 1.5 for partial word match)
        for (const ct of currentTags) {
          for (const candTag of candidateTags) {
            if (ct === candTag) {
              score += 3;
              if (!sharedTags.includes(candTag)) sharedTags.push(candTag);
            } else if (ct.includes(candTag) || candTag.includes(ct)) {
              score += 1.5;
              if (!sharedTags.includes(candTag)) sharedTags.push(candTag);
            }
          }
        }

        // 2. Same category match (2.5 points)
        if (p.category === currentCategory) {
          score += 2.5;
        }

        // 3. Keyword / title overlap (0.5 points)
        const currentTitleWords = post.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const pTitleLower = p.title.toLowerCase();
        for (const word of currentTitleWords) {
          if (pTitleLower.includes(word)) {
            score += 0.5;
          }
        }

        return {
          post: p,
          score,
          sharedTags,
          date: new Date(p.publishedAt || p.createdAt).getTime(),
        };
      });

    // Sort by relevance score descending, then recency
    candidates.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.date - a.date;
    });

    return candidates.slice(0, 3).map((c) => ({
      ...c.post,
      matchReason: c.sharedTags.length > 0
        ? `Topic: ${c.sharedTags[0]}`
        : c.post.category === currentCategory
        ? `Category: ${currentCategory}`
        : "Quantitative Analysis",
    }));
  }, [post, allPosts]);

  // Convert basic markdown to clean HTML with clickable internal links
  const renderMarkdown = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];

    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const flushTable = (key: string) => {
      if (inTable && tableHeaders.length > 0) {
        elements.push(
          <div key={key} className="my-6 overflow-x-auto rounded-xl border border-[#E3DFC2] bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#F5F3EC] border-b border-[#E3DFC2] text-[#1A1A1A]">
                  {tableHeaders.map((th, i) => (
                    <th key={i} className="py-3 px-4 font-semibold font-mono-data">
                      <FormattedInlineText
                        text={th.trim()}
                        onNavigateSlug={handleInternalSlugNavigation}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8E0]">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-[#FAF9F5]"}>
                    {row.map((td, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-4 font-mono-data text-[#2E2C29]">
                        <FormattedInlineText
                          text={td.trim()}
                          onNavigateSlug={handleInternalSlugNavigation}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Clean prohibited mentions inside markdown content
      const cleanLine = trimmed
        .replace(/\(EEAT Compliance\)/gi, "")
        .replace(/\*By Dr\. Arindam Sen, CFA[^*]*\*/gi, "")
        .replace(/Dr\. Arindam Sen, CFA/gi, "Research Desk")
        .replace(/SEBI Reg\.?\s*INA[0-9]+/gi, "")
        .replace(/SEBI Registered/gi, "Independent")
        .replace(/AMFI Verified/gi, "AMFI Data");

      // Table line
      if (cleanLine.startsWith("|") && cleanLine.endsWith("|")) {
        const parts = cleanLine.split("|").slice(1, -1);
        if (!inTable) {
          inTable = true;
          tableHeaders = parts;
        } else if (cleanLine.includes("---")) {
          // delimiter line
        } else {
          tableRows.push(parts);
        }
        return;
      } else if (inTable) {
        flushTable(`table-${idx}`);
      }

      if (!cleanLine) {
        return;
      }

      // Headings
      if (cleanLine.startsWith("# ")) {
        elements.push(
          <h1 key={idx} className="font-serif-editorial text-3xl sm:text-4xl text-[#1A1A1A] font-semibold mt-8 mb-4">
            <FormattedInlineText
              text={cleanLine.replace("# ", "")}
              onNavigateSlug={handleInternalSlugNavigation}
            />
          </h1>
        );
      } else if (cleanLine.startsWith("## ")) {
        elements.push(
          <h2
            key={idx}
            className="font-serif-editorial text-2xl sm:text-3xl text-[#1A1A1A] font-semibold mt-10 mb-3 pb-2 border-b border-[#EAE8E0]"
          >
            <FormattedInlineText
              text={cleanLine.replace("## ", "")}
              onNavigateSlug={handleInternalSlugNavigation}
            />
          </h2>
        );
      } else if (cleanLine.startsWith("### ")) {
        elements.push(
          <h3 key={idx} className="font-serif-editorial text-xl sm:text-2xl text-[#2B2925] font-medium mt-6 mb-2">
            <FormattedInlineText
              text={cleanLine.replace("### ", "")}
              onNavigateSlug={handleInternalSlugNavigation}
            />
          </h3>
        );
      } else if (cleanLine.startsWith("> ")) {
        elements.push(
          <blockquote
            key={idx}
            className="my-5 pl-4 py-2 border-l-3 border-[#1A1A1A] bg-[#F2F0E7] rounded-r-lg italic text-[#383631] text-sm sm:text-base"
          >
            <FormattedInlineText
              text={cleanLine.replace("> ", "")}
              onNavigateSlug={handleInternalSlugNavigation}
            />
          </blockquote>
        );
      } else if (cleanLine.startsWith("- ") || cleanLine.startsWith("* ")) {
        elements.push(
          <li key={idx} className="ml-5 list-disc text-[#38352F] my-1 text-sm sm:text-base leading-relaxed">
            <FormattedInlineText
              text={cleanLine.replace(/^[-*]\s+/, "")}
              onNavigateSlug={handleInternalSlugNavigation}
            />
          </li>
        );
      } else if (cleanLine.match(/^\d+\.\s/)) {
        elements.push(
          <li key={idx} className="ml-5 list-decimal text-[#38352F] my-1 text-sm sm:text-base leading-relaxed">
            <FormattedInlineText
              text={cleanLine.replace(/^\d+\.\s+/, "")}
              onNavigateSlug={handleInternalSlugNavigation}
            />
          </li>
        );
      } else if (cleanLine === "---") {
        elements.push(<hr key={idx} className="my-8 border-t border-[#EAE8E0]" />);
      } else {
        elements.push(
          <p key={idx} className="my-3.5 text-[#38352F] text-base sm:text-lg leading-relaxed">
            <FormattedInlineText
              text={cleanLine}
              onNavigateSlug={handleInternalSlugNavigation}
            />
          </p>
        );
      }
    });

    if (inTable) {
      flushTable(`table-end`);
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24">
      {/* Reading Progress Line */}
      <div
        className="fixed top-0 left-0 h-1 bg-[#1A1A1A] z-50 transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Top Utility Header */}
      <div className="bg-[#FAF9F5] border-b border-[#EAE8E0] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#59554C] hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-md hover:bg-[#EAE8E0] text-[#59554C] transition-colors relative"
              title="Copy article link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleShareTwitter}
              className="p-1.5 rounded-md hover:bg-[#EAE8E0] text-[#59554C] transition-colors text-xs font-semibold"
              title="Share on X"
            >
              𝕏
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 rounded-md hover:bg-[#EAE8E0] text-[#59554C] transition-colors text-xs font-semibold text-emerald-600"
              title="Share on WhatsApp"
            >
              WA
            </button>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Category & Status */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <button
            onClick={() => onOpenCategory(post.category)}
            className="bg-[#1A1A1A] text-white px-2.5 py-1 rounded text-xs font-medium tracking-wide uppercase font-mono-data hover:bg-black transition-colors"
          >
            {post.category}
          </button>
          <span className="text-[#8C887B]">•</span>
          <span className="text-[#736F65] font-mono-data text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTimeMinutes} min read
          </span>
        </div>

        {/* Article Title */}
        <h1 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] font-semibold leading-[1.18] tracking-tight mb-4">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-base sm:text-xl text-[#524E45] leading-relaxed mb-6 font-normal">
          {post.excerpt}
        </p>

        {/* Research Desk Byline */}
        <div className="p-4 rounded-xl bg-[#F4F2EB] border border-[#E3DFC2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-serif text-sm">
              <FileText className="w-5 h-5 text-stone-200" />
            </div>
            <div>
              <div className="font-semibold text-stone-900 text-sm">Research Desk</div>
              <div className="text-stone-600 text-[11px]">{settings.siteName} Analysis</div>
              <div className="text-stone-500 font-mono-data text-[10px]">
                Published on {formattedDate}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-stone-600 text-[11px] font-mono-data self-start sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E3DFC2]">
            <span className="px-2 py-0.5 rounded bg-stone-200/80 text-stone-700 text-[10px] font-mono-data">
              Non-SEBI / Non-AMFI Registered
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.viewsCount.toLocaleString()} reads
            </span>
          </div>
        </div>

        {/* Scheme Snapshot Card if available */}
        {post.amfiDataSnapshot && post.amfiDataSnapshot.length > 0 && (
          <div className="mb-10 bg-white rounded-2xl border border-[#E0DDD3] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0EEE6] gap-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-stone-700" />
                <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-stone-900 font-mono-data">
                  Scheme Data & Historical Performance Snapshot
                </h3>
              </div>
              <span className="text-[10px] font-mono-data bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200/80 self-start sm:self-auto">
                Lagged Educational Snapshot (Archived Data)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {post.amfiDataSnapshot.map((fund, idx) => {
                const asOnDate = fund.date || "28-Sep-2026";
                return (
                  <div key={idx} className="bg-[#FAF9F5] p-4 rounded-xl border border-[#EAE8E0] space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-xs text-stone-900 leading-snug">{fund.schemeName}</div>
                      <span className="text-[10px] font-mono-data bg-stone-200/70 text-stone-700 px-1.5 py-0.5 rounded shrink-0">
                        {fund.fundHouse || "AMFI"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono-data text-stone-500">
                      <span>Scheme Code: {fund.schemeCode}</span>
                      <span>Category: {fund.category}</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-stone-200/60 text-xs">
                      {/* Historical NAV with explicit As on date */}
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-stone-700 font-medium">Historical NAV</div>
                          <div className="text-[10px] text-stone-500 font-mono-data">As on {asOnDate}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono-data font-bold text-stone-900 text-sm">₹{fund.nav.toFixed(2)}</span>
                          <span className="block text-[10px] text-stone-500 font-mono-data">As on {asOnDate}</span>
                        </div>
                      </div>

                      {/* 3Y Rolling CAGR with explicit As on date */}
                      {fund.cagr3Y !== undefined && (
                        <div className="flex items-baseline justify-between pt-1.5 border-t border-stone-100">
                          <div>
                            <div className="text-stone-700 font-medium">3Y Rolling CAGR</div>
                            <div className="text-[10px] text-stone-500 font-mono-data">As on {asOnDate}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono-data font-bold text-emerald-800">+{fund.cagr3Y}%</span>
                            <span className="block text-[10px] text-stone-500 font-mono-data">As on {asOnDate}</span>
                          </div>
                        </div>
                      )}

                      {/* TER with explicit As on date */}
                      {fund.expenseRatio !== undefined && (
                        <div className="flex items-baseline justify-between pt-1.5 border-t border-stone-100">
                          <div>
                            <div className="text-stone-700 font-medium">Expense Ratio (TER)</div>
                            <div className="text-[10px] text-stone-500 font-mono-data">As on {asOnDate}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono-data font-medium text-stone-800">{fund.expenseRatio}%</span>
                            <span className="block text-[10px] text-stone-500 font-mono-data">As on {asOnDate}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prominent Secondary Line Directly Under Each Figure */}
                    <div className="pt-2.5 border-t border-stone-200/80 text-[10.5px] text-stone-600 italic leading-snug">
                      Historical data shown for educational illustration only; not a recommendation or performance claim.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rendered Body Typography with clickable inline links */}
        <div className="prose max-w-none font-serif-editorial">
          {renderMarkdown(post.content)}
        </div>

        {/* Concise Statutory Disclosure (1-2 lines) */}
        <div className="my-8 p-3 sm:py-2.5 sm:px-4 rounded-xl bg-[#FAF9F5] border border-[#EAE8E0] text-[11px] text-stone-600 leading-snug flex items-start sm:items-center gap-2 shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="m-0">
            <strong className="text-stone-800">Statutory Notice:</strong> Not SEBI or AMFI registered. Published insights are strictly for quantitative investor education &amp; research, not investment advice. Mutual fund investments are subject to market risks; read all scheme related documents carefully.
          </p>
        </div>

        {/* Related Posts Section */}
        {relatedArticles.length > 0 && (
          <div className="mt-14 pt-8 border-t border-[#EAE8E0]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono-data uppercase tracking-wider text-emerald-700 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Curated For You</span>
                </div>
                <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  Related Posts &amp; Research Notes
                </h3>
                <p className="text-xs text-stone-500 font-sans mt-0.5">
                  Suggested quantitative analyses matched by category (<em>{post.category}</em>) and relevant investment themes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((rel: any) => (
                <div
                  key={rel.id}
                  onClick={() => handleInternalSlugNavigation(rel.slug)}
                  className="group cursor-pointer p-5 rounded-2xl bg-white border border-[#EAE8E0] hover:border-emerald-600/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Category & Topic Match Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-mono-data tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
                        {rel.category}
                      </span>
                      {rel.matchReason && (
                        <span className="text-[10px] font-mono-data px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[120px]">{rel.matchReason}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif-editorial text-base font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>

                    <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed font-sans">
                      {rel.excerpt}
                    </p>

                    {/* Display top tags if available */}
                    {rel.tags && rel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {rel.tags.slice(0, 2).map((t: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF9F5] text-stone-500 font-mono-data border border-stone-200/60"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-mono-data text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {rel.readTimeMinutes} min read
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold group-hover:translate-x-1 transition-transform">
                      Read Analysis <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-14 pt-8 border-t border-[#EAE8E0]">
          <CommentSection postId={post.id} postTitle={post.title} />
        </div>
      </main>
    </div>
  );
}
