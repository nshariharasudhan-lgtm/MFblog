import React from "react";
import {
  Compass,
  Calculator,
  BookMarked,
  FileText,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { ArticlePost } from "../types";
import { getRelatedItemsForArticle } from "../data/topicHubsData";

interface ArticleRelatedBlockProps {
  post: ArticlePost;
  allPosts: ArticlePost[];
  onNavigateArticle?: (targetPost: ArticlePost) => void;
  onNavigateHub?: (hubSlug: string) => void;
  onNavigateCalculator?: (url: string) => void;
  onNavigateGlossaryTerm?: (termId: string) => void;
}

export function ArticleRelatedBlock({
  post,
  allPosts,
  onNavigateArticle,
  onNavigateHub,
  onNavigateCalculator,
  onNavigateGlossaryTerm,
}: ArticleRelatedBlockProps) {
  const { hub, calculator, glossaryTerm, siblingArticles } = React.useMemo(() => {
    return getRelatedItemsForArticle(post, allPosts);
  }, [post, allPosts]);

  const handleHubClick = () => {
    if (onNavigateHub) {
      onNavigateHub(hub.slug);
    } else {
      window.history.pushState({}, "", `/hub/${hub.slug}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCalculatorClick = () => {
    if (onNavigateCalculator) {
      onNavigateCalculator(calculator.url);
    } else {
      window.history.pushState({}, "", calculator.url);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGlossaryClick = () => {
    if (onNavigateGlossaryTerm) {
      onNavigateGlossaryTerm(glossaryTerm.id);
    } else {
      window.history.pushState({}, "", `/glossary#${glossaryTerm.id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      const el = document.getElementById(glossaryTerm.id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleArticleClick = (targetPost: ArticlePost) => {
    if (onNavigateArticle) {
      onNavigateArticle(targetPost);
    } else {
      window.history.pushState({}, "", `/article/${targetPost.slug}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section
      aria-label="Related Research, Tools & Knowledge Base"
      className="my-10 pt-8 pb-4 border-t-2 border-stone-200"
    >
      {/* 1. TOPIC HUB BANNER: Links to the parent topic cluster */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-linear-to-br from-emerald-950 via-stone-900 to-stone-950 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono-data uppercase tracking-wider font-semibold">
              <Compass className="w-3 h-3" />
              <span>Parent Research Cluster</span>
            </div>
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
              {hub.title}
            </h3>
            <p className="text-stone-300 text-xs sm:text-[13px] leading-relaxed font-sans">
              This research paper belongs to our comprehensive educational hub on{" "}
              <strong>{hub.title}</strong>. Explore linked analytical papers, interactive calculators, official glossary definitions, and SEBI/AMFI regulatory FAQs.
            </p>
          </div>

          <button
            onClick={handleHubClick}
            type="button"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-mono-data text-xs font-semibold shadow-sm hover:shadow transition-all group cursor-pointer"
          >
            <span>Explore Topic Hub</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Grid: 1 Calculator & 1 Glossary Term */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* 2. RELEVANT CALCULATOR CARD */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE8E0] shadow-xs hover:border-emerald-600/40 hover:shadow-sm transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[10.5px] font-mono-data font-semibold">
                <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                <span>Recommended Calculator</span>
              </div>
              <span className="text-[10px] font-mono-data text-stone-600 px-2 py-0.5 rounded bg-stone-100 font-medium">
                {calculator.badge}
              </span>
            </div>

            <div>
              <h4 className="font-serif-editorial text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                {calculator.name}
              </h4>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed font-sans">
                {calculator.description}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F0EEE6] flex items-center justify-between">
            <span className="text-[11px] font-mono-data text-stone-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Dynamic ₹ Lakh / Cr inputs
            </span>
            <button
              onClick={handleCalculatorClick}
              type="button"
              className="inline-flex items-center gap-1 text-xs font-mono-data font-bold text-emerald-700 hover:text-emerald-800 group-hover:translate-x-0.5 transition-transform cursor-pointer"
            >
              <span>Launch Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. RELEVANT GLOSSARY TERM CARD */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE8E0] shadow-xs hover:border-emerald-600/40 hover:shadow-sm transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200 text-[10.5px] font-mono-data font-semibold">
                <BookMarked className="w-3.5 h-3.5 text-stone-700" />
                <span>Related Glossary Term</span>
              </div>
              <span className="text-[10px] font-mono-data text-stone-600 px-2 py-0.5 rounded bg-[#FAF9F5] border border-stone-200/80 font-medium">
                {glossaryTerm.cluster}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <h4 className="font-serif-editorial text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {glossaryTerm.term}
                </h4>
                {glossaryTerm.abbreviation && (
                  <span className="text-xs font-mono-data font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                    {glossaryTerm.abbreviation}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed font-sans line-clamp-3">
                {glossaryTerm.definition}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F0EEE6] flex items-center justify-between">
            <span className="text-[11px] font-mono-data text-stone-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-stone-400" />
              SEBI / AMFI Standard
            </span>
            <button
              onClick={handleGlossaryClick}
              type="button"
              className="inline-flex items-center gap-1 text-xs font-mono-data font-bold text-emerald-700 hover:text-emerald-800 group-hover:translate-x-0.5 transition-transform cursor-pointer"
            >
              <span>Read in Glossary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. TWO SIBLING ARTICLES */}
      {siblingArticles.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <h4 className="font-serif-editorial text-lg font-bold text-stone-900 tracking-tight">
                Recommended Sibling Research Papers
              </h4>
            </div>
            <span className="text-[10px] font-mono-data text-stone-600">
              Matched from {hub.title}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {siblingArticles.map((sibling) => (
              <div
                key={sibling.id}
                onClick={() => handleArticleClick(sibling)}
                className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EAE8E0] hover:border-emerald-600/40 hover:bg-white hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[9.5px] uppercase font-mono-data tracking-wider px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-700 font-semibold">
                      {sibling.category}
                    </span>
                    <span className="text-[10px] font-mono-data text-stone-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {sibling.readTimeMinutes} min read
                    </span>
                  </div>

                  <h5 className="font-serif-editorial text-sm sm:text-[15px] font-bold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {sibling.title}
                  </h5>

                  <p className="mt-1 text-[11.5px] text-stone-600 line-clamp-2 leading-relaxed font-sans">
                    {sibling.excerpt}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-200/60 flex items-center justify-end text-[11px] font-mono-data text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Read Analysis →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
