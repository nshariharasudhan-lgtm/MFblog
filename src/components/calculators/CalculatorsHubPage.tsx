import React, { useEffect } from "react";
import {
  TrendingUp,
  Percent,
  Sparkles,
  ArrowRight,
  Calculator,
  ShieldAlert,
  Coins,
  Compass,
  ArrowDownRight,
  Layers,
  Scale,
} from "lucide-react";
import { ToolLayout } from "../ToolLayout";
import { SiteSettings, ArticleCategory } from "../../types";

interface CalculatorsHubPageProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onNavigateCalculators: () => void;
  onNavigateCalculator: (slug: string) => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: () => void;
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

interface CalculatorCardItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  status: "live" | "next-phase";
  description: string;
  route: string;
  formula: string;
  features: string[];
  icon: React.ElementType;
}

export function CalculatorsHubPage({
  settings,
  onNavigateHome,
  onNavigateCalculators,
  onNavigateCalculator,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onSelectCategory,
  onSearchChange,
  searchQuery,
}: CalculatorsHubPageProps) {
  // Inject WebApplication JSON-LD into DOM
  useEffect(() => {
    const scriptId = "calculators-hub-jsonld";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": "https://www.yieldnest.online/calculators#app",
          "name": "Quantitative Mutual Fund Calculators Suite",
          "url": "https://www.yieldnest.online/calculators",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript",
          "description": "Comprehensive suite of 7 Indian mutual fund calculators including SIP, Step-Up SIP, Lumpsum, SWP, Goal Planner, Direct vs Regular TER drag, and Tax Estimator.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR",
          },
          "publisher": {
            "@type": "Organization",
            "name": "YieldNest.online",
            "url": "https://www.yieldnest.online",
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": "https://www.yieldnest.online/calculators#breadcrumb",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.yieldnest.online/",
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Calculators",
              "item": "https://www.yieldnest.online/calculators",
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
  }, []);

  const calculatorList: CalculatorCardItem[] = [
    {
      id: "sip",
      title: "SIP Calculator",
      badge: "Active",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      status: "live",
      description: "Model standard monthly SIP wealth accumulation with rupee-cost averaging, Section 112A capital gains tax estimations, and year-by-year cash flows.",
      route: "/calculators/sip",
      formula: "M = P × [((1+i)^n - 1) / i] × (1+i)",
      features: ["Dynamic Indian format (₹, Lakh, Crore)", "Yearly amortization table", "Pre & post-tax estimation"],
      icon: TrendingUp,
    },
    {
      id: "step-up-sip",
      title: "Step-Up SIP Calculator",
      badge: "Active",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      status: "live",
      description: "Simulate annual step-up top-ups (5% to 25%) linked to salary appraisals. Quantify the massive divergence in wealth compared to a fixed static SIP.",
      route: "/calculators/step-up-sip",
      formula: "P_k = P_1 × (1+s)^(k-1)",
      features: ["Side-by-side normal vs step-up comparison", "Multi-curve growth chart", "Stepped-up monthly breakdown"],
      icon: Sparkles,
    },
    {
      id: "lumpsum",
      title: "Lumpsum Calculator",
      badge: "Active",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      status: "live",
      description: "Calculate compounded returns on a one-time lump-sum mutual fund deposit across multiple decades. View wealth multipliers and post-tax corpus.",
      route: "/calculators/lumpsum",
      formula: "A = P × (1 + r/n)^(nt)",
      features: ["Exponential growth visualization", "Multiplier analysis (e.g. 3.1x)", "Year-by-year growth table"],
      icon: Coins,
    },
    {
      id: "direct-vs-regular",
      title: "Direct vs Regular TER Drag",
      badge: "Active",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      status: "live",
      description: "Calculate the long-term wealth erosion caused by distributor commission fees (0.5% to 1.5% TER difference) between Direct and Regular mutual fund plans.",
      route: "/calculators/direct-vs-regular",
      formula: "Loss = FV_direct - FV_regular",
      features: ["Distributor fee loss quantification", "TER drag simulation", "Zero-commission educational guidance"],
      icon: Percent,
    },
    {
      id: "swp",
      title: "Systematic Withdrawal Plan (SWP)",
      badge: "Next Phase",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      status: "next-phase",
      description: "Plan tax-efficient monthly cash flows in retirement or financial independence without prematurely exhausting your invested mutual fund corpus.",
      route: "/calculators/swp",
      formula: "B_{t} = (B_{t-1} - W) × (1+r)",
      features: ["Monthly pension-style withdrawal", "Corpus longevity forecast", "Principal preservation tracker"],
      icon: ArrowDownRight,
    },
    {
      id: "goal-planner",
      title: "Goal Planner Calculator",
      badge: "Next Phase",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      status: "next-phase",
      description: "Back-calculate the exact monthly SIP required to achieve a future target (e.g. child education, house down payment) after factoring in inflation.",
      route: "/calculators/goal-planner",
      formula: "Target_adj = Target × (1+inf)^t",
      features: ["Inflation adjustment engine", "Target corpus back-calculation", "Horizon risk calibration"],
      icon: Compass,
    },
    {
      id: "tax-estimator",
      title: "Mutual Fund Tax Estimator",
      badge: "Next Phase",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      status: "next-phase",
      description: "Comprehensive capital gains tax simulator under Finance Act 2024. Computes 12.5% LTCG, 20% STCG, ₹1.25L exemption, and indexation changes.",
      route: "/calculators/tax-estimator",
      formula: "Tax = (Gain - ₹1.25L) × 12.5%",
      features: ["Holding period classifier", "Section 112A equity vs debt rules", "Fully editable tax slabs"],
      icon: Scale,
    },
  ];

  return (
    <ToolLayout
      title="Quantitative Mutual Fund Calculators Suite"
      intro="Evidence-based, zero-commission financial simulators for Indian mutual fund investors. Model systematic compounding, step-up salary increments, lump-sum trajectories, expense ratio drag, and tax liabilities with editable regulatory thresholds."
      badge="Comprehensive Educational Suite"
      settings={settings}
      onNavigateHome={onNavigateHome}
      onNavigateCalculators={onNavigateCalculators}
      onNavigateFAQ={onNavigateFAQ}
      onNavigateGlossary={onNavigateGlossary}
      onNavigateGuides={onNavigateGuides}
      onSelectCategory={onSelectCategory}
      onSearchChange={onSearchChange}
      searchQuery={searchQuery}
      activeMenu="calculators"
      breadcrumbs={[{ label: "Calculators" }]}
    >
      <div className="space-y-10">
        {/* Regulatory & Compliance Header Bar */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-sans">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Regulatory Integrity:</strong> All calculators strictly evaluate asset mathematics and expense ratios. Never recommends or mentions specific fund schemes.
            </span>
          </div>
          <span className="font-mono-data text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
            As on October 2026
          </span>
        </div>

        {/* 7 Calculator Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculatorList.map((calc) => {
            const Icon = calc.icon;
            const isLive = calc.status === "live";

            return (
              <div
                key={calc.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-500/80 hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-mono-data uppercase font-semibold px-2 py-0.5 rounded-full border ${calc.badgeColor}`}
                    >
                      {calc.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {calc.title}
                    </h2>
                    <p className="text-xs text-stone-600 font-sans mt-1 leading-relaxed">
                      {calc.description}
                    </p>
                  </div>

                  {/* Formula preview */}
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-100 font-mono-data text-[11px] text-stone-700">
                    <span className="text-stone-400 font-normal">Formula: </span>
                    <span className="font-medium text-emerald-900">{calc.formula}</span>
                  </div>

                  {/* Feature bullet list */}
                  <ul className="space-y-1 text-[11px] text-stone-500 font-sans pt-1">
                    {calc.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Link */}
                <div className="pt-3 border-t border-stone-100">
                  {isLive ? (
                    <button
                      onClick={() => onNavigateCalculator(calc.id)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 text-white font-mono-data text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer group-hover:bg-emerald-700"
                    >
                      <span>Launch Calculator</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <div className="w-full text-center py-2 px-3 rounded-xl bg-stone-100 text-stone-500 font-mono-data text-xs">
                      Phase 2 Integration In Progress
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Education note at bottom */}
        <div className="p-6 bg-[#fdfcf9] rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed space-y-2">
          <h3 className="font-serif-editorial text-lg font-bold text-stone-900">
            About Our Quantitative Methodology
          </h3>
          <p>
            YieldNest calculators use standard monthly periodic compounding formulas compliant with Indian regulatory conventions. All tax rates, exemption limits, and holding periods (such as Section 112A equity LTCG of 12.5% above ₹1.25 Lakh) are editable user parameters with visible &quot;as on&quot; dates so you can stress-test changes across Union Budgets. Return assumptions are purely illustrative and do not reflect guaranteed returns.
          </p>
        </div>

        {/* Statutory Regulatory Disclaimer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE8E0] text-xs text-stone-600 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-stone-900 font-bold font-mono-data uppercase tracking-wider text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Statutory Regulatory Notice</span>
          </div>
          <p className="leading-relaxed font-sans text-stone-600">
            Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing. YieldNest is an independent investor education platform and is not registered with SEBI or AMFI. Past performance does not guarantee future returns. Calculator projections are mathematical simulations for educational purposes only and do not constitute investment advice or return guarantees.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
