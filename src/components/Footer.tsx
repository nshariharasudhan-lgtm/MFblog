import React from "react";
import { ShieldAlert } from "lucide-react";
import { ArticleCategory, SiteSettings } from "../types";
import { YieldNestLogo } from "./YieldNestLogo";

interface FooterProps {
  settings: SiteSettings;
  onSelectCategory: (cat: ArticleCategory | "all") => void;
  onNavigateCalculators?: () => void;
  onNavigateCalculator?: (target: string) => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: (target?: "index" | "how-to-choose" | "redemption") => void;
  onNavigateHubs?: () => void;
}

export function Footer({
  settings,
  onSelectCategory,
  onNavigateCalculators,
  onNavigateCalculator,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onNavigateHubs,
}: FooterProps) {
  const categories: ArticleCategory[] = [
    "Fund Comparison",
    "Performance Analysis",
    "Market Trends",
    "Category Deep-Dive",
    "SIP Strategies",
  ];

  const categoryMap: Record<ArticleCategory, string> = {
    "Fund Comparison": "fund-comparison",
    "Performance Analysis": "performance-analysis",
    "Market Trends": "market-trends",
    "Category Deep-Dive": "category-deep-dive",
    "SIP Strategies": "sip-strategies",
  };

  const siteName = settings.siteName || "YieldNest.online";

  return (
    <footer className="bg-[#F4F2EB] border-t border-[#EAE8E0] text-stone-700 text-xs">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Publication Identity with Logo */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="inline-block">
              <YieldNestLogo size="sm" showTagline={false} />
            </div>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              {settings.description || "Data-driven research on Indian Mutual Funds. Unbiased fund comparisons, rolling return evaluations, portfolio overlap checks, and market analytics."}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-200/70 text-stone-800 text-[11px] font-mono-data">
              <span>Status: Independent Investor Education • yieldnest.online</span>
            </div>
          </div>

          {/* Research Categories */}
          <div className="md:col-span-4 space-y-3">
            <div className="font-semibold text-stone-900 font-mono-data uppercase tracking-wider text-[11px]">
              Research Categories
            </div>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat}>
                  <a
                    href={`/category/${categoryMap[cat]}`}
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                        e.preventDefault();
                        onSelectCategory(cat);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="text-stone-700 hover:text-black transition-colors no-underline py-2.5 px-1.5 min-h-[44px] flex items-center text-xs font-medium"
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Educational Resources & Tools */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-semibold text-stone-900 font-mono-data uppercase tracking-wider text-[11px]">
              Investor Resources
            </div>
            <ul className="space-y-1.5 text-stone-600 text-xs">
              <li>
                <a
                  href="/hubs"
                  onClick={(e) => {
                    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      if (onNavigateHubs) onNavigateHubs();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="text-stone-700 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <span>🎯 Topic Hubs</span>
                </a>
              </li>
              <li>
                <a
                  href="/calculators"
                  onClick={(e) => {
                    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      if (onNavigateCalculators) onNavigateCalculators();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="text-stone-700 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <span>🧮 Calculators Suite</span>
                </a>
              </li>
              <li className="pl-4 text-[11px] text-stone-500 space-y-1">
                <div>
                  <a
                    href="/calculators/sip"
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && onNavigateCalculator) {
                        e.preventDefault();
                        onNavigateCalculator("sip");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    • SIP Calculator
                  </a>
                </div>
                <div>
                  <a
                    href="/calculators/step-up-sip"
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && onNavigateCalculator) {
                        e.preventDefault();
                        onNavigateCalculator("step-up-sip");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    • Step-Up SIP Calculator
                  </a>
                </div>
                <div>
                  <a
                    href="/calculators/lumpsum"
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && onNavigateCalculator) {
                        e.preventDefault();
                        onNavigateCalculator("lumpsum");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    • Lumpsum Calculator
                  </a>
                </div>
                <div>
                  <a
                    href="/calculators/swp"
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && onNavigateCalculator) {
                        e.preventDefault();
                        onNavigateCalculator("swp");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    • SWP Calculator
                  </a>
                </div>
                <div>
                  <a
                    href="/calculators/goal-planner"
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && onNavigateCalculator) {
                        e.preventDefault();
                        onNavigateCalculator("goal-planner");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    • Goal Planner Calculator
                  </a>
                </div>
                <div>
                  <a
                    href="/calculators/tax-estimator"
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && onNavigateCalculator) {
                        e.preventDefault();
                        onNavigateCalculator("tax-estimator");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    • Mutual Fund Tax Estimator
                  </a>
                </div>
                <div>
                  <a
                    href="/calculators/direct-vs-regular"
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && onNavigateCalculator) {
                        e.preventDefault();
                        onNavigateCalculator("direct-vs-regular");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    • Direct vs Regular TER Drag
                  </a>
                </div>
              </li>
              <li>
                <a
                  href="/faq"
                  onClick={(e) => {
                    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      if (onNavigateFAQ) onNavigateFAQ();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="text-stone-700 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <span>❓ Mutual Fund FAQ</span>
                </a>
              </li>
              <li>
                <a
                  href="/glossary"
                  onClick={(e) => {
                    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      if (onNavigateGlossary) onNavigateGlossary();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="text-stone-700 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <span>📖 Term Glossary</span>
                </a>
              </li>
              <li>
                <a
                  href="/guides"
                  onClick={(e) => {
                    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      if (onNavigateGuides) onNavigateGuides("index");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="text-stone-700 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <span>📚 Investor Guides Hub</span>
                </a>
              </li>
              <li className="pl-4 text-[11px] text-stone-500 space-y-1">
                <div>
                  <a
                    href="/guides/how-to-choose-a-mutual-fund"
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                        e.preventDefault();
                        if (onNavigateGuides) onNavigateGuides("how-to-choose");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    • How to Choose a Fund
                  </a>
                </div>
                <div>
                  <a
                    href="/guides/redemption-checklist"
                    onClick={(e) => {
                      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                        e.preventDefault();
                        if (onNavigateGuides) onNavigateGuides("redemption");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    • Redemption Checklist
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Global Regulatory Disclaimer */}
        <div className="p-3.5 sm:py-3 sm:px-4 rounded-xl bg-white border border-[#EAE8E0] text-[11px] sm:text-xs text-stone-600 leading-relaxed flex items-start gap-2.5 shadow-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="m-0 font-sans">
            Mutual fund investments are subject to market risks. Read all scheme-related documents carefully. This site is for education only and is not investment advice. Past performance does not guarantee future returns.
          </p>
        </div>

        <div className="pt-4 border-t border-[#EAE8E0] flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px] font-mono-data">
          <div>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </div>
          <div>
            Independent Investor Education Platform • yieldnest.online
          </div>
        </div>
      </div>
    </footer>
  );
}
