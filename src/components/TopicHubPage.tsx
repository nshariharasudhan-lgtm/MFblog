import React, { useState, useEffect } from "react";
import {
  Compass,
  FileText,
  Calculator,
  BookMarked,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  CheckCircle2,
  ExternalLink,
  Search,
} from "lucide-react";
import { ToolLayout } from "./ToolLayout";
import { ArticlePost, ArticleCategory, SiteSettings } from "../types";
import { TopicHubData, TOPIC_HUBS, HubFAQ } from "../data/topicHubsData";
import { GLOSSARY_TERMS, GlossaryTerm } from "../data/glossaryData";

interface TopicHubPageProps {
  hub: TopicHubData;
  settings: SiteSettings;
  allPosts: ArticlePost[];
  onNavigateHome: () => void;
  onNavigateCalculators?: () => void;
  onNavigateCalculator?: (urlOrSlug: string) => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGlossaryTerm?: (termId: string) => void;
  onNavigateGuides?: () => void;
  onNavigateHub?: (hubSlug: string) => void;
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onNavigateArticle?: (post: ArticlePost) => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function TopicHubPage({
  hub,
  settings,
  allPosts,
  onNavigateHome,
  onNavigateCalculators,
  onNavigateCalculator,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGlossaryTerm,
  onNavigateGuides,
  onNavigateHub,
  onSelectCategory,
  onNavigateArticle,
  onSearchChange,
  searchQuery = "",
}: TopicHubPageProps) {
  // State for FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Filter articles associated with this hub
  const relatedArticles = React.useMemo(() => {
    // 1. Matched by explicit slugs
    const bySlug = allPosts.filter(
      (p) => p.status === "published" && hub.matchedArticleSlugs.includes(p.slug)
    );

    // 2. Keyword fallback if fewer than 2
    if (bySlug.length < 2) {
      const remaining = allPosts.filter(
        (p) => p.status === "published" && !bySlug.some((m) => m.id === p.id)
      );
      return [...bySlug, ...remaining.slice(0, 3 - bySlug.length)];
    }

    return bySlug;
  }, [allPosts, hub]);

  // Resolve glossary terms
  const glossaryTermsList: GlossaryTerm[] = React.useMemo(() => {
    return hub.relatedGlossaryTermIds
      .map((id) => GLOSSARY_TERMS.find((t) => t.id === id))
      .filter((t): t is GlossaryTerm => Boolean(t));
  }, [hub]);

  // Combine primary calculator + related calculators
  const allCalculators = React.useMemo(() => {
    const list = [hub.primaryCalculator, ...hub.relatedCalculators];
    // Deduplicate by url
    const seen = new Set<string>();
    return list.filter((calc) => {
      if (seen.has(calc.url)) return false;
      seen.add(calc.url);
      return true;
    });
  }, [hub]);

  // Toggle FAQ accordion
  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  // Internal Navigation Handlers
  const handleArticleClick = (targetPost: ArticlePost) => {
    if (onNavigateArticle) {
      onNavigateArticle(targetPost);
    } else {
      window.history.pushState({}, "", `/article/${targetPost.slug}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCalculatorClick = (url: string) => {
    if (onNavigateCalculator) {
      onNavigateCalculator(url);
    } else {
      window.history.pushState({}, "", url);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGlossaryClick = (termId: string) => {
    if (onNavigateGlossaryTerm) {
      onNavigateGlossaryTerm(termId);
    } else {
      window.history.pushState({}, "", `/glossary#${termId}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      const el = document.getElementById(termId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleHubSwitch = (targetSlug: string) => {
    if (onNavigateHub) {
      onNavigateHub(targetSlug);
    } else {
      window.history.pushState({}, "", `/hub/${targetSlug}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Schema.org Structured Data Injection
  useEffect(() => {
    const scriptId = `topichub-${hub.id}-jsonld`;
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const canonicalUrl = `https://www.yieldnest.online/hub/${hub.slug}`;

    // ItemList for related articles
    const articleItemList = relatedArticles.map((art, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: art.title,
      url: `https://www.yieldnest.online/article/${art.slug}`,
      description: art.excerpt,
    }));

    // FAQPage schema
    const faqEntities = hub.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    }));

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: hub.metaTitle,
          description: hub.metaDescription,
          publisher: {
            "@type": "Organization",
            name: settings.siteName,
            url: "https://www.yieldnest.online",
          },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: relatedArticles.length,
            itemListElement: articleItemList,
          },
        },
        {
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faq`,
          mainEntity: faqEntities,
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.yieldnest.online/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Topic Hubs",
              item: "https://www.yieldnest.online/hubs",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: hub.title,
              item: canonicalUrl,
            },
          ],
        },
      ],
    };

    script.textContent = JSON.stringify(jsonLd);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [hub, relatedArticles, settings]);

  return (
    <ToolLayout
      title={hub.title}
      intro={hub.intro}
      badge={hub.badge}
      settings={settings}
      onNavigateHome={onNavigateHome}
      onNavigateCalculators={onNavigateCalculators}
      onNavigateFAQ={onNavigateFAQ}
      onNavigateGlossary={onNavigateGlossary}
      onNavigateGuides={onNavigateGuides}
      onSelectCategory={onSelectCategory}
      onSearchChange={onSearchChange}
      searchQuery={searchQuery}
      breadcrumbs={[
        { label: "Topic Hubs", onClick: () => handleHubSwitch("") },
        { label: hub.title },
      ]}
    >
      <div className="space-y-12">
        {/* 1. DETAILED EDITORIAL OVERVIEW */}
        <section className="bg-white rounded-2xl border border-[#EAE8E0] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-emerald-700" />
            <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Topic Architecture &amp; Regulatory Perspective
            </h2>
          </div>

          <div className="prose max-w-none text-stone-700 font-serif-editorial leading-relaxed space-y-3.5 text-sm sm:text-base">
            {hub.detailedIntro.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Core Principles Grid */}
          <div className="mt-8 pt-6 border-t border-[#F0EEE6]">
            <h3 className="font-mono-data text-xs uppercase tracking-wider text-stone-700 font-bold mb-4">
              Core Regulatory &amp; Mathematical Principles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hub.principles.map((pr, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#FAF9F5] border border-stone-200/80 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-stone-900 text-xs sm:text-sm">
                      {pr.title}
                    </h4>
                    <p className="text-stone-600 text-xs leading-relaxed font-sans">
                      {pr.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. RELATED RESEARCH PAPERS & ARTICLES */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Quantitative Research Papers in this Cluster
              </h2>
            </div>
            <span className="text-xs font-mono-data px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold">
              {relatedArticles.length} Research Notes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => handleArticleClick(art)}
                className="p-5 rounded-2xl bg-white border border-[#EAE8E0] hover:border-emerald-600/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-mono-data tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                      {art.category}
                    </span>
                    <span className="text-[10.5px] font-mono-data text-stone-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {art.readTimeMinutes} min
                    </span>
                  </div>

                  <h3 className="font-serif-editorial text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-sans">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#F0EEE6] flex items-center justify-between text-xs font-mono-data">
                  <span className="text-stone-600 truncate max-w-[150px]">
                    {art.authorName}
                  </span>
                  <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read Paper <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. RELATED INTERACTIVE CALCULATORS */}
        <section className="bg-linear-to-b from-stone-900 to-stone-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10.5px] font-mono-data uppercase font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>Financial Modeling</span>
              </div>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold tracking-tight text-white">
                Related Quantitative Calculators
              </h2>
            </div>
            <button
              onClick={() => handleCalculatorClick("/calculators")}
              className="text-xs font-mono-data text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All 7 Calculators</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allCalculators.map((calc) => (
              <div
                key={calc.id}
                onClick={() => handleCalculatorClick(calc.url)}
                className="p-5 rounded-xl bg-stone-800/80 border border-stone-700/80 hover:border-emerald-500/60 hover:bg-stone-800 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-stone-700 text-stone-300 font-medium">
                      {calc.badge}
                    </span>
                  </div>

                  <h3 className="font-serif-editorial text-base sm:text-lg font-bold text-stone-100 group-hover:text-emerald-400 transition-colors leading-snug">
                    {calc.name}
                  </h3>

                  <p className="text-xs text-stone-300 leading-relaxed font-sans line-clamp-3">
                    {calc.description}
                  </p>
                </div>

                <div className="pt-3.5 mt-3.5 border-t border-stone-700/60 flex items-center justify-between text-xs font-mono-data">
                  <span className="text-stone-400">Free client tool</span>
                  <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Launch Model <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. RELATED GLOSSARY TERMS */}
        <section className="bg-white rounded-2xl border border-[#EAE8E0] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-emerald-700" />
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Essential Glossary &amp; Technical Definitions
              </h2>
            </div>
            <button
              onClick={() => {
                if (onNavigateGlossary) onNavigateGlossary();
                else {
                  window.history.pushState({}, "", "/glossary");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="text-xs font-mono-data text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View All 50+ Terms in Glossary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {glossaryTermsList.map((term) => (
              <div
                key={term.id}
                onClick={() => handleGlossaryClick(term.id)}
                className="p-4 rounded-xl bg-[#FAF9F5] border border-stone-200/80 hover:border-emerald-600/40 hover:bg-white transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-serif-editorial text-base font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                        {term.term}
                      </h4>
                      {term.abbreviation && (
                        <span className="text-[11px] font-mono-data font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                          {term.abbreviation}
                        </span>
                      )}
                    </div>
                    <span className="text-[9.5px] font-mono-data text-stone-600 px-1.5 py-0.5 rounded bg-stone-100">
                      {term.cluster}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-sans line-clamp-3">
                    {term.definition}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-200/60 flex items-center justify-end text-[11px] font-mono-data text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Look up in Glossary →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. SHORT FAQ BLOCK (Accordion) */}
        {hub.faqs && hub.faqs.length > 0 && (
          <section className="bg-white rounded-2xl border border-[#EAE8E0] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-700" />
                <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  Frequently Asked Questions on {hub.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  if (onNavigateFAQ) onNavigateFAQ();
                  else {
                    window.history.pushState({}, "", "/faq");
                    window.dispatchEvent(new PopStateEvent("popstate"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="text-xs font-mono-data text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Browse Full FAQ Database</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#F0EEE6]">
              {hub.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between text-left gap-4 font-serif-editorial text-base sm:text-lg font-bold text-stone-900 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <div className="shrink-0 w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="mt-3 text-stone-700 text-xs sm:text-sm font-sans leading-relaxed space-y-2">
                        <p>{faq.answer}</p>
                        {faq.complianceNote && (
                          <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-stone-200 text-[11px] text-stone-600 font-mono-data flex items-center gap-1.5">
                            <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>
                              <strong>Regulatory Context:</strong> {faq.complianceNote}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. CROSS-HUB TOPIC EXPLORER */}
        <section className="bg-[#FAF9F5] rounded-2xl border border-[#EAE8E0] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <h2 className="font-serif-editorial text-xl font-bold text-stone-900 tracking-tight">
              Explore All 7 Mutual Fund Topic Hubs
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 font-sans mb-5 leading-relaxed">
            Navigate through our systematic knowledge clusters covering every facet of Indian retail mutual funds:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TOPIC_HUBS.map((h) => {
              const isActive = h.id === hub.id;
              return (
                <button
                  key={h.id}
                  onClick={() => handleHubSwitch(h.slug)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? "bg-emerald-900 text-white border-emerald-800 shadow-sm"
                      : "bg-white text-stone-800 border-stone-200 hover:border-emerald-600/50 hover:shadow-xs"
                  }`}
                >
                  <span
                    className={`text-[9.5px] font-mono-data uppercase font-semibold mb-1 ${
                      isActive ? "text-emerald-300" : "text-stone-500"
                    }`}
                  >
                    {h.badge}
                  </span>
                  <span className="font-serif-editorial text-xs sm:text-[13px] font-bold leading-snug line-clamp-2">
                    {h.title}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 7. STATUTORY REGULATORY DISCLAIMER */}
        <div className="p-4 rounded-xl bg-white border border-[#EAE8E0] text-[11px] text-stone-600 leading-relaxed shadow-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="m-0">
            <strong>Statutory Disclaimer:</strong> Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing. YieldNest is an independent quantitative research portal and is not a registered SEBI Investment Adviser (RIA) or AMFI Mutual Fund Distributor (MFD). Content published across topic hubs is strictly for financial literacy and investor education, not tailored investment advice.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
