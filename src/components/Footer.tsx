import React from "react";
import { ShieldAlert } from "lucide-react";
import { ArticleCategory, SiteSettings } from "../types";
import { YieldNestLogo } from "./YieldNestLogo";

interface FooterProps {
  settings: SiteSettings;
  onSelectCategory: (cat: ArticleCategory | "all") => void;
  onNavigateCalculators?: () => void;
}

export function Footer({ settings, onSelectCategory, onNavigateCalculators }: FooterProps) {
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

          {/* About Publication & Crawl Endpoints */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-semibold text-stone-900 font-mono-data uppercase tracking-wider text-[11px]">
              Financial Calculators
            </div>
            <ul className="space-y-1.5 text-stone-600 text-xs">
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
                  className="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>🧮 Calculator Suite Hub</span>
                </a>
              </li>
              <li>
                <a
                  href="/calculator/direct-vs-regular"
                  className="text-stone-700 hover:text-black transition-colors"
                >
                  Direct vs Regular (TER Drag)
                </a>
              </li>
              <li>
                <a
                  href="/calculator/step-up-sip"
                  className="text-stone-700 hover:text-black transition-colors"
                >
                  Step-Up SIP Calculator
                </a>
              </li>
              <li>
                <a
                  href="/calculator/cost-of-delay"
                  className="text-stone-700 hover:text-black transition-colors"
                >
                  Cost of Delay (Procrastination Tax)
                </a>
              </li>
              <li>
                <a
                  href="/calculator/sip-vs-lumpsum"
                  className="text-stone-700 hover:text-black transition-colors"
                >
                  SIP vs Lumpsum Comparator
                </a>
              </li>
              <li className="pt-2 border-t border-stone-300/60 flex items-center gap-2 font-mono-data text-[11px]">
                <a href="/sitemap.xml" className="text-stone-700 hover:text-black underline py-2 min-h-[44px] inline-flex items-center" target="_blank" rel="noopener noreferrer">Sitemap.xml</a>
                <span>•</span>
                <a href="/robots.txt" className="text-stone-700 hover:text-black underline py-2 min-h-[44px] inline-flex items-center" target="_blank" rel="noopener noreferrer">Robots.txt</a>
                <span>•</span>
                <a href="/llms.txt" className="text-stone-700 hover:text-black underline py-2 min-h-[44px] inline-flex items-center" target="_blank" rel="noopener noreferrer">LLMs.txt</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Concise Statutory Disclosure (1-2 lines) */}
        <div className="p-3 sm:py-2.5 sm:px-4 rounded-xl bg-white border border-[#EAE8E0] text-[11px] text-stone-600 leading-snug flex items-start sm:items-center gap-2 shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="m-0">
            <strong className="text-stone-800">Statutory Notice:</strong> Not SEBI or AMFI registered. Content on {siteName} is strictly for quantitative investor education &amp; research, not financial advice. Mutual fund investments are subject to market risks; read all scheme related documents carefully.
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
