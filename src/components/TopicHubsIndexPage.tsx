import React from "react";
import {
  Compass,
  ArrowRight,
  BookOpen,
  FileText,
  Calculator,
  BookMarked,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { ToolLayout } from "./ToolLayout";
import { SiteSettings, ArticleCategory, ArticlePost } from "../types";
import { TOPIC_HUBS, TopicHubData } from "../data/topicHubsData";

interface TopicHubsIndexPageProps {
  settings: SiteSettings;
  allPosts: ArticlePost[];
  onNavigateHome: () => void;
  onNavigateHub: (slug: string) => void;
  onNavigateCalculators?: () => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: () => void;
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function TopicHubsIndexPage({
  settings,
  allPosts,
  onNavigateHome,
  onNavigateHub,
  onNavigateCalculators,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onSelectCategory,
  onSearchChange,
  searchQuery = "",
}: TopicHubsIndexPageProps) {
  return (
    <ToolLayout
      title="Mutual Fund Topic Hubs: Systematic Knowledge Clusters"
      intro="Explore our comprehensive editorial knowledge hubs organized by core investment clusters. Each topic hub aggregates in-depth analytical research papers, interactive mathematical calculators, official glossary definitions, and SEBI/AMFI regulatory FAQs."
      badge="Comprehensive Knowledge Architecture"
      settings={settings}
      onNavigateHome={onNavigateHome}
      onNavigateCalculators={onNavigateCalculators}
      onNavigateFAQ={onNavigateFAQ}
      onNavigateGlossary={onNavigateGlossary}
      onNavigateGuides={onNavigateGuides}
      onSelectCategory={onSelectCategory}
      onSearchChange={onSearchChange}
      searchQuery={searchQuery}
      breadcrumbs={[{ label: "Topic Hubs" }]}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOPIC_HUBS.map((hub) => {
            const articleCount = allPosts.filter(
              (p) =>
                p.status === "published" &&
                hub.matchedArticleSlugs.includes(p.slug)
            ).length;

            return (
              <div
                key={hub.id}
                onClick={() => onNavigateHub(hub.slug)}
                className="p-6 rounded-2xl bg-white border border-[#EAE8E0] hover:border-emerald-600/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] uppercase font-mono-data tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold">
                      {hub.badge}
                    </span>
                    <span className="text-xs font-mono-data text-stone-500">
                      {articleCount || hub.matchedArticleSlugs.length} Papers
                    </span>
                  </div>

                  <h3 className="font-serif-editorial text-xl font-bold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {hub.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed font-sans line-clamp-3">
                    {hub.intro}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono-data text-stone-500">
                    <span className="flex items-center gap-1 bg-[#FAF9F5] px-2 py-0.5 rounded border border-stone-200/60">
                      <Calculator className="w-3 h-3 text-emerald-600" />
                      {hub.primaryCalculator.name}
                    </span>
                    <span className="flex items-center gap-1 bg-[#FAF9F5] px-2 py-0.5 rounded border border-stone-200/60">
                      <BookMarked className="w-3 h-3 text-stone-500" />
                      {hub.relatedGlossaryTermIds.length + 1} Glossary Terms
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-[#F0EEE6] flex items-center justify-between text-xs font-mono-data">
                  <span className="text-stone-500">SEBI/AMFI Compliant</span>
                  <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Explore Hub <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informational Footer Note */}
        <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE8E0] text-xs text-stone-600 space-y-2">
          <div className="flex items-center gap-2 text-stone-800 font-bold font-mono-data uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Structured Academic &amp; Regulatory Framework</span>
          </div>
          <p className="leading-relaxed">
            YieldNest's Topic Hubs map directly to the research and query taxonomy of the Association of Mutual Funds in India (AMFI) and SEBI Investor Education initiatives. Every hub maintains strict separation between marketing claims and objective mathematical calculations.
          </p>
        </div>

        {/* Statutory Regulatory Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE8E0] text-xs text-stone-600 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-stone-900 font-bold font-mono-data uppercase tracking-wider text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Statutory Regulatory Notice</span>
          </div>
          <p className="leading-relaxed font-sans text-stone-600">
            Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing. YieldNest is an independent investor education platform and is not registered with SEBI or AMFI. Past performance does not guarantee future returns. Content across all Topic Hubs is strictly for investor education and should not be construed as investment, tax, or legal advice.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
