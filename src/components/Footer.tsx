import React from "react";
import { ShieldAlert } from "lucide-react";
import { ArticleCategory, SiteSettings } from "../types";
import { YieldNestLogo } from "./YieldNestLogo";

interface FooterProps {
  settings: SiteSettings;
  onSelectCategory: (cat: ArticleCategory | "all") => void;
}

export function Footer({ settings, onSelectCategory }: FooterProps) {
  const categories: ArticleCategory[] = [
    "Fund Comparison",
    "Performance Analysis",
    "Market Trends",
    "Category Deep-Dive",
    "SIP Strategies",
  ];

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
              {settings.description || "Data-driven research on Indian Mutual Funds. Unbiased fund comparisons, rolling return audits, portfolio overlap checks, and market analytics."}
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
            <ul className="space-y-1.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-stone-600 hover:text-black transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About Publication */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-semibold text-stone-900 font-mono-data uppercase tracking-wider text-[11px]">
              Editorial Scope
            </div>
            <ul className="space-y-1.5 text-stone-600 text-xs">
              <li>Educational Mutual Fund Research</li>
              <li>Factual Rolling Return Calculations</li>
              <li>Portfolio Expense &amp; TER Analysis</li>
              <li>Public AMFI Data Visualizations</li>
            </ul>
          </div>
        </div>

        {/* Prominent Statutory & Non-Registration Disclaimer */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DFC2] text-xs text-stone-700 leading-relaxed space-y-2 shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-stone-900 font-mono-data uppercase tracking-wider text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Statutory Disclosure &amp; Non-Registration Notice</span>
          </div>
          <p>
            <strong>Important Regulatory Notice:</strong> We are <strong>not AMFI or SEBI registered analysts, investment advisers, or mutual fund distributors</strong>. 
            The analyses, comparisons, metrics, and articles published on {siteName} (yieldnest.online) are strictly formulated for <strong>educational and informational awareness purposes only</strong>. None of the content on this platform should be construed as investment advice, a financial recommendation, or a solicitation to buy, sell, or switch any mutual fund units or financial securities.
          </p>
          <p className="text-[11px] text-stone-500">
            Mutual fund investments are subject to market risks; read all scheme related documents carefully before investing. Historical NAV performance and rolling compound annual growth rates (CAGR) are provided for factual illustration and educational study and do not guarantee future returns. Please consult an independent, qualified SEBI-registered Investment Adviser (RIA) or financial planner before making any investment decisions.
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
