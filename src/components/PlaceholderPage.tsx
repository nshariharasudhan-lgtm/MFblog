import React from "react";
import { Clock, ArrowRight, BookOpen, HelpCircle, BookMarked, Calculator } from "lucide-react";
import { ToolLayout } from "./ToolLayout";
import { ArticleCategory, SiteSettings } from "../types";

export type PlaceholderType = "faq" | "glossary" | "guides" | "calculators";

interface PlaceholderPageProps {
  type: PlaceholderType;
  settings: SiteSettings;
  onNavigateHome: () => void;
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onNavigateCalculators?: () => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: () => void;
  onSearchChange?: (q: string) => void;
  searchQuery?: string;
}

const PAGE_CONFIG: Record<
  PlaceholderType,
  {
    title: string;
    intro: string;
    breadcrumbLabel: string;
    icon: React.ElementType;
    previewHeading: string;
    previewItems: string[];
    upcomingFeatures: string[];
    activeMenu: "calculators" | "faq" | "glossary" | "guides";
  }
> = {
  faq: {
    title: "Frequently Asked Questions (FAQ)",
    intro: "Clear, evidence-backed answers to the most common retail questions regarding Indian mutual funds, capital gains taxation, SIP execution, and safety.",
    breadcrumbLabel: "FAQ Hub",
    icon: HelpCircle,
    activeMenu: "faq",
    previewHeading: "Upcoming High-Priority FAQ Topics",
    previewItems: [
      "Are mutual funds safe compared to bank fixed deposits?",
      "How is equity mutual fund LTCG and STCG taxed in 2026?",
      "What happens if an AMC or fund house shuts down?",
      "Can a mutual fund portfolio go to zero?",
      "What is the cut-off time for same-day NAV allotment?",
      "How do settlement cycles (T+1 / T+2) work during redemption?",
    ],
    upcomingFeatures: [
      "Instant client-side keyword search across 1,300+ retail queries",
      "Cluster filtering: Safety, Taxation, SIP, Redemptions, Fees",
      "Structured FAQPage JSON-LD schema for search snippets",
      "Direct references to SEBI and AMFI circulars",
    ],
  },
  glossary: {
    title: "Mutual Fund Glossary: Key Terms & Definitions",
    intro: "An authoritative, jargon-free reference dictionary explaining essential technical metrics, regulatory abbreviations, and valuation concepts for Indian mutual fund investors.",
    breadcrumbLabel: "Glossary",
    icon: BookMarked,
    activeMenu: "glossary",
    previewHeading: "Featured Core Glossary Terms",
    previewItems: [
      "NAV (Net Asset Value) — Daily per-unit market value",
      "TER (Total Expense Ratio) — Annualized operational management fee",
      "ISIN — International Securities Identification Number",
      "CAN (Common Account Number) — Centralized MF utility identifier",
      "IDCW — Income Distribution cum Capital Withdrawal",
      "Exit Load — Contingent fee charged on premature redemptions",
    ],
    upcomingFeatures: [
      "40+ exhaustive DefinedTerm JSON-LD entries",
      "Direct cross-linking from article mentions to definitions",
      "Alphabetical index and cluster tagging (NAV, Regulation, Basics)",
      "Zero-jargon plain-language explanations with numerical examples",
    ],
  },
  guides: {
    title: "Mutual Fund Investor Guides & Educational Pillars",
    intro: "Step-by-step educational pillar frameworks mapping financial horizons to SEBI fund categories without naming or promoting individual schemes.",
    breadcrumbLabel: "Guides",
    icon: BookOpen,
    activeMenu: "guides",
    previewHeading: "Upcoming Comprehensive Guides",
    previewItems: [
      "The First-Time Investor Blueprint: KYC, Folio, and Direct Plans",
      "Matching Investment Horizons: 1-Year, 3-Year, 5-Year, and 10-Year Allocation",
      "The True Cost of Distributor Commissions: Direct vs Regular Impact",
      "Understanding the SEBI Riskometer and Capital Loss Tolerance",
      "How to Read a Scheme Information Document (SID) & Factsheet",
      "Systematic Withdrawal Strategy for Retirees & Secondary Incomes",
    ],
    upcomingFeatures: [
      "Interactive asset allocation checklists",
      "Step-by-step illustrated workflows",
      "SEBI category boundaries and risk spectrum comparisons",
      "Downloadable PDF reference checklists for personal evaluation",
    ],
  },
  calculators: {
    title: "Quantitative Mutual Fund Calculators Suite",
    intro: "Interactive financial modeling tools to evaluate compounding velocity, expense ratio friction, and delaying costs in Indian mutual funds.",
    breadcrumbLabel: "Calculators",
    icon: Calculator,
    activeMenu: "calculators",
    previewHeading: "Active Calculator Modules",
    previewItems: [
      "Direct vs Regular Plan TER Compounding Drag Calculator",
      "Step-Up (Top-Up) SIP Wealth Accelerator Calculator",
      "Cost of Delay / Procrastination Penalty Calculator",
      "SIP vs Lumpsum Entry Strategy Comparator",
    ],
    upcomingFeatures: [
      "Single-file standalone HTML embeddability (Blogger & external iframes)",
      "Year-by-year compounding amortisation tables",
      "Shareable calculation permalinks with URL parameters",
      "Editable tax slabs and assumptions with visible 'as on' dates",
    ],
  },
};

export function PlaceholderPage({
  type,
  settings,
  onNavigateHome,
  onSelectCategory,
  onNavigateCalculators,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onSearchChange,
  searchQuery,
}: PlaceholderPageProps) {
  const config = PAGE_CONFIG[type];
  const IconComponent = config.icon;

  return (
    <ToolLayout
      title={config.title}
      intro={config.intro}
      badge="Under Construction"
      breadcrumbs={[{ label: config.breadcrumbLabel }]}
      settings={settings}
      onNavigateHome={onNavigateHome}
      onSelectCategory={onSelectCategory}
      onNavigateCalculators={onNavigateCalculators}
      onNavigateFAQ={onNavigateFAQ}
      onNavigateGlossary={onNavigateGlossary}
      onNavigateGuides={onNavigateGuides}
      onSearchChange={onSearchChange}
      searchQuery={searchQuery}
      activeMenu={config.activeMenu}
    >
      <div className="space-y-8">
        {/* Prominent Coming Soon Banner Card */}
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-stone-50 to-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
                <IconComponent className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-data uppercase tracking-wider text-amber-800 font-semibold px-2 py-0.5 rounded bg-amber-100/70">
                  <Clock className="w-3 h-3" />
                  <span>Module Status: Coming Soon</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif-editorial text-stone-900 mt-1">
                  Coming soon: {config.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onNavigateHome}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-mono-data font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Explore Research Papers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Preview of Upcoming Topics */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold font-mono-data uppercase tracking-wider text-stone-700">
                {config.previewHeading}
              </h3>
              <ul className="space-y-2">
                {config.previewItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-white border border-[#EAE8E0] text-xs text-stone-700 flex items-start gap-2 shadow-2xs font-sans"
                  >
                    <span className="text-amber-600 font-mono font-bold text-[11px] mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to Expect */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold font-mono-data uppercase tracking-wider text-stone-700">
                Architecture &amp; Features in Development
              </h3>
              <ul className="space-y-2">
                {config.upcomingFeatures.map((feat, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-stone-100/60 border border-stone-200 text-xs text-stone-600 flex items-start gap-2 font-sans"
                  >
                    <span className="text-emerald-700 font-bold text-[11px] mt-0.5">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 p-4 rounded-xl bg-white border border-[#EAE8E0] text-xs text-stone-600 space-y-1">
                <span className="font-semibold text-stone-800 font-mono-data text-[11px] block">
                  Notice on Release Schedule:
                </span>
                <p className="text-[11px] leading-relaxed text-stone-500 m-0">
                  This educational module is scheduled in our rolling content release pipeline. All data points, definitions, and mathematical models undergo strict compliance reviews against prevailing SEBI regulations and Income Tax Department rules prior to public publishing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Quick Navigation Links */}
        <div className="p-6 rounded-2xl bg-white border border-[#EAE8E0] space-y-4">
          <h3 className="text-xs font-mono-data font-semibold uppercase tracking-wider text-stone-700">
            Available Resources You Can Access Right Now
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={onNavigateCalculators}
              className="p-3.5 rounded-xl bg-[#FAF9F5] border border-stone-200 hover:border-emerald-600/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-stone-900 group-hover:text-emerald-700 mb-1">
                <span>Quantitative Calculators</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-stone-500 m-0 leading-relaxed">
                Test 4 interactive simulators: Direct vs Regular, Step-Up SIP, Delay Cost &amp; Lumpsum.
              </p>
            </button>

            <button
              onClick={() => onSelectCategory && onSelectCategory("Fund Comparison")}
              className="p-3.5 rounded-xl bg-[#FAF9F5] border border-stone-200 hover:border-emerald-600/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-stone-900 group-hover:text-emerald-700 mb-1">
                <span>Fund Comparisons</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-stone-500 m-0 leading-relaxed">
                Peer reviews on market caps, rolling return consistency, and portfolio overlap.
              </p>
            </button>

            <button
              onClick={() => onSelectCategory && onSelectCategory("SIP Strategies")}
              className="p-3.5 rounded-xl bg-[#FAF9F5] border border-stone-200 hover:border-emerald-600/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-stone-900 group-hover:text-emerald-700 mb-1">
                <span>SIP Tactics</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-stone-500 m-0 leading-relaxed">
                Mathematical deep dives into rupee-cost averaging and compounding mechanics.
              </p>
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
