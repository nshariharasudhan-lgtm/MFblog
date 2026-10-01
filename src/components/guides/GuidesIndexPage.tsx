import React from "react";
import {
  BookOpen,
  CheckSquare,
  Printer,
  ArrowRight,
  ShieldCheck,
  Compass,
  Calculator,
  BookMarked,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";
import { ToolLayout } from "../ToolLayout";
import { SiteSettings, ArticleCategory } from "../../types";

interface GuidesIndexPageProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onNavigateCalculators?: () => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: () => void;
  onNavigateHowToChooseGuide?: () => void;
  onNavigateRedemptionChecklist?: () => void;
  onNavigateHub?: (slug?: string) => void;
  onSearchChange?: (q: string) => void;
  searchQuery?: string;
}

export function GuidesIndexPage({
  settings,
  onNavigateHome,
  onSelectCategory,
  onNavigateCalculators,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onNavigateHowToChooseGuide,
  onNavigateRedemptionChecklist,
  onNavigateHub,
  onSearchChange,
  searchQuery,
}: GuidesIndexPageProps) {
  const featuredGuides = [
    {
      id: "how-to-choose",
      title: "How to Choose a Mutual Fund: 10-Point Pre-Investment Checklist",
      tag: "Interactive Due Diligence & Quiz",
      badge: "High Impact",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      description:
        "Run through 10 quantitative checks before committing capital: verify rolling returns, downside capture ratio, Direct vs Regular expense drag, and AUM liquidity stress. Includes a 5-step Goal & Risk-Profile Quiz that outputs official SEBI fund categories without naming commercial schemes.",
      icon: CheckSquare,
      onClick: onNavigateHowToChooseGuide,
      href: "/guides/how-to-choose-a-mutual-fund",
      bullets: [
        "10-Point due diligence checklist with instant scoring",
        "Goal & Risk-Profile category recommendation quiz",
        "Strictly outputs SEBI categories (liquid, debt, index, hybrid, flexi-cap) with structural reasons & risks",
      ],
    },
    {
      id: "redemption-checklist",
      title: "Printable Mutual Fund Redemption Checklist",
      tag: "Operational & Tax Audit",
      badge: "Print Ready",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      description:
        "A formal 12-step pre-redemption verification sheet. Avoid costly exit load traps, comply with ELSS 36-month lock-in rules per installment, optimize LTCG ₹1.25L annual exemptions under Section 112A, and verify payout bank account details prior to submission.",
      icon: Printer,
      onClick: onNavigateRedemptionChecklist,
      href: "/guides/redemption-checklist",
      bullets: [
        "12 verification checkpoints across 4 operational phases",
        "SEBI cut-off times: 1:30 PM (Liquid) & 3:00 PM (Equity)",
        "One-click browser printing with ink-efficient high-contrast layout",
      ],
    },
  ];

  const pillarFrameworks = [
    {
      title: "Direct vs Regular Fee Drag Framework",
      desc: "Mathematical proof of how a 1% distributor commission difference erodes ₹25-35 Lakhs over a 20-year SIP horizon.",
      hubSlug: "fees",
    },
    {
      title: "Understanding SEBI Riskometer Dynamics",
      desc: "How AMCs calculate the 6-tier Riskometer monthly using portfolio standard deviation, duration, and credit ratings.",
      hubSlug: "safety-and-risk",
    },
    {
      title: "Rolling Returns vs Trailing Returns Guide",
      desc: "Why trailing returns deceive investors during market peaks and how 3-year rolling returns expose quartile consistency.",
      hubSlug: "basics",
    },
    {
      title: "Mutual Fund Capital Gains Tax Rules (Budget 2024-2026)",
      desc: "Complete guide to Section 111A (20% STCG), Section 112A (12.5% LTCG over ₹1.25L), and debt fund slab taxation.",
      hubSlug: "tax-and-elss",
    },
  ];

  return (
    <ToolLayout
      title="Mutual Fund Investor Guides & Educational Pillars"
      intro="Objective, evidence-backed educational guides and interactive frameworks designed to help Indian retail investors make disciplined decisions. Strictly category-focused, mathematically grounded, and aligned with SEBI regulations."
      badge="Investor Guides Hub"
      activeMenu="guides"
      breadcrumbs={[{ label: "Guides Hub" }]}
      settings={settings}
      onNavigateHome={onNavigateHome}
      onSelectCategory={onSelectCategory}
      onNavigateCalculators={onNavigateCalculators}
      onNavigateFAQ={onNavigateFAQ}
      onNavigateGlossary={onNavigateGlossary}
      onNavigateGuides={onNavigateGuides}
      onNavigateHubs={onNavigateHub ? () => onNavigateHub() : undefined}
      onSearchChange={onSearchChange}
      searchQuery={searchQuery}
    >
      <div className="space-y-10 font-serif-editorial">
        {/* Regulatory Banner */}
        <div className="bg-[#FAF9F5] border border-[#EAE8E0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs font-sans leading-relaxed text-stone-700">
            <strong className="text-stone-900 font-semibold">Educational Governance Commitment:</strong>{" "}
            All YieldNest guides are formulated to teach investment principles, asset allocation, and regulatory compliance. We do not provide personalized financial advice, nor do we promote, rate, or distribute individual commercial mutual fund schemes.
          </div>
        </div>

        {/* Featured Interactive Guides Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
              Interactive Tools &amp; Checklists
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredGuides.map((guide) => {
              const Icon = guide.icon;

              return (
                <div
                  key={guide.id}
                  className="bg-white border border-[#EAE8E0] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-stone-400 hover:shadow-sm transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
                        {guide.tag}
                      </span>
                      <span className={`text-[10px] font-mono-data font-semibold px-2 py-0.5 rounded-full border ${guide.badgeColor}`}>
                        {guide.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-serif-editorial text-stone-900 group-hover:text-emerald-900 transition-colors">
                      {guide.title}
                    </h3>

                    <p className="text-xs font-sans text-stone-600 leading-relaxed">
                      {guide.description}
                    </p>

                    <ul className="space-y-1 pt-2 border-t border-stone-100 text-xs font-sans text-stone-700">
                      {guide.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 border-t border-stone-100 mt-4">
                    <a
                      href={guide.href}
                      onClick={(e) => {
                        if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                          e.preventDefault();
                          if (guide.onClick) guide.onClick();
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold bg-stone-900 text-white hover:bg-black group-hover:bg-emerald-800 transition-all cursor-pointer shadow-xs w-full justify-center"
                    >
                      <Icon className="w-4 h-4" />
                      <span>Launch Interactive Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Foundational Educational Frameworks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
              Core Educational Pillar Frameworks
            </div>
            {onNavigateHub && (
              <button
                onClick={() => onNavigateHub()}
                className="text-xs font-sans text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Browse All 7 Topic Hubs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillarFrameworks.map((framework, i) => (
              <div
                key={i}
                onClick={() => onNavigateHub && onNavigateHub(framework.hubSlug)}
                className="bg-white border border-[#EAE8E0] rounded-xl p-5 shadow-xs hover:border-stone-400 hover:shadow-2xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-data text-emerald-800 uppercase tracking-wider font-semibold">
                    Editorial Pillar
                  </span>
                  <span className="text-xs font-mono-data text-stone-400 group-hover:text-emerald-800 transition-colors">
                    Explore Hub →
                  </span>
                </div>
                <h4 className="text-base font-bold font-serif-editorial text-stone-900 group-hover:text-emerald-900 transition-colors mt-1">
                  {framework.title}
                </h4>
                <p className="text-xs font-sans text-stone-600 mt-1 leading-relaxed">
                  {framework.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Educational Ecosystem Links */}
        <div className="border-t border-[#EAE8E0] pt-8 space-y-3">
          <div className="text-[11px] font-mono-data uppercase tracking-wider text-stone-500 font-semibold">
            YieldNest Investor Education Suite
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => onNavigateCalculators && onNavigateCalculators()}
              className="p-4 rounded-xl border border-[#EAE8E0] bg-white hover:border-stone-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs font-bold font-serif-editorial text-stone-900 group-hover:text-emerald-800">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>Quantitative Calculators Suite</span>
              </div>
              <p className="text-[11px] font-sans text-stone-600 mt-1 leading-snug">
                Simulate Direct vs Regular TER drag, step-up SIP compounding, and cost of delay.
              </p>
            </div>

            <div
              onClick={() => onNavigateGlossary && onNavigateGlossary()}
              className="p-4 rounded-xl border border-[#EAE8E0] bg-white hover:border-stone-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs font-bold font-serif-editorial text-stone-900 group-hover:text-emerald-800">
                <BookMarked className="w-4 h-4 text-indigo-700" />
                <span>50+ Mutual Fund Glossary</span>
              </div>
              <p className="text-[11px] font-sans text-stone-600 mt-1 leading-snug">
                Authoritative definitions for NAV, AUM, Alpha, Beta, Tracking Error, and Exit Load rules.
              </p>
            </div>

            <div
              onClick={() => onNavigateFAQ && onNavigateFAQ()}
              className="p-4 rounded-xl border border-[#EAE8E0] bg-white hover:border-stone-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs font-bold font-serif-editorial text-stone-900 group-hover:text-emerald-800">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>Comprehensive Investor FAQ</span>
              </div>
              <p className="text-[11px] font-sans text-stone-600 mt-1 leading-snug">
                Compliant, research-backed answers to 40+ common retail mutual fund questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
