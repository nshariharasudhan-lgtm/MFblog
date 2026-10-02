import React, { useState, useEffect, useMemo } from "react";
import {
  Scale,
  Calendar,
  Share2,
  Check,
  Code2,
  ShieldAlert,
  AlertTriangle,
  Coins,
  Percent,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Info,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Receipt,
  PiggyBank,
} from "lucide-react";
import { ToolLayout } from "../ToolLayout";
import { SiteSettings, ArticleCategory } from "../../types";
import {
  formatINR,
  formatIndianWords,
  formatCompactINR,
  calculateMutualFundTax,
  MutualFundTaxCategory,
  TaxAssumptions,
} from "./calculatorUtils";

interface TaxEstimatorCalculatorPageProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onNavigateCalculators: () => void;
  onNavigateCalculator?: (target: string) => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: () => void;
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

const DEFAULT_ASSUMPTIONS: TaxAssumptions = {
  equityStcgRate: 20,
  equityLtcgRate: 12.5,
  equityLtcgExemption: 125000,
  cessRate: 4,
  otherHoldingThresholdMonths: 24,
  otherLtcgRate: 12.5,
};

export function TaxEstimatorCalculatorPage({
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
}: TaxEstimatorCalculatorPageProps) {
  // Fund type state
  const [fundCategory, setFundCategory] = useState<MutualFundTaxCategory>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("fundType");
      if (cat === "equity" || cat === "debt-post-2023" || cat === "other-holding-period") {
        return cat;
      }
    }
    return "equity";
  });

  // Financial inputs
  const [purchaseAmount, setPurchaseAmount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("purchase") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 300000; // Default ₹3 Lakh
  });

  const [saleAmount, setSaleAmount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("sale") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 550000; // Default ₹5.5 Lakh
  });

  // Date inputs: default 2 years holding
  const [purchaseDate, setPurchaseDate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("pDate");
      if (p && /^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
    }
    return "2024-04-15";
  });

  const [saleDate, setSaleDate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("sDate");
      if (s && /^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    }
    return "2026-10-01";
  });

  const [otherLtcgBooked, setOtherLtcgBooked] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("otherLtcg") || "");
      if (!isNaN(val) && val >= 0) return val;
    }
    return 25000; // Default ₹25,000 already utilized exemption
  });

  const [slabRate, setSlabRate] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("slab") || "");
      if (!isNaN(val) && val >= 0) return val;
    }
    return 30; // Default 30% slab
  });

  // Editable Assumptions State
  const [assumptions, setAssumptions] = useState<TaxAssumptions>(() => ({ ...DEFAULT_ASSUMPTIONS }));
  const [showAssumptionsBox, setShowAssumptionsBox] = useState<boolean>(true);

  // UI state
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  // Sync state to URL search parameters for instant shareability
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("fundType", fundCategory);
    params.set("purchase", purchaseAmount.toString());
    params.set("sale", saleAmount.toString());
    params.set("pDate", purchaseDate);
    params.set("sDate", saleDate);
    if (otherLtcgBooked > 0) params.set("otherLtcg", otherLtcgBooked.toString());
    params.set("slab", slabRate.toString());

    const newRelativePathQuery = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newRelativePathQuery);
  }, [fundCategory, purchaseAmount, saleAmount, purchaseDate, saleDate, otherLtcgBooked, slabRate]);

  // Compute Tax Results
  const taxResult = useMemo(() => {
    return calculateMutualFundTax(
      fundCategory,
      purchaseAmount,
      saleAmount,
      purchaseDate,
      saleDate,
      otherLtcgBooked,
      slabRate,
      assumptions
    );
  }, [fundCategory, purchaseAmount, saleAmount, purchaseDate, saleDate, otherLtcgBooked, slabRate, assumptions]);

  const {
    holdingDays,
    holdingMonths,
    holdingClassification,
    isLtcg,
    isLoss,
    gain,
    availableExemptionBefore,
    exemptAmountUsed,
    taxableGain,
    applicableRatePercent,
    baseTax,
    cessAmount,
    totalTax,
    effectiveTaxRate,
    netProceeds,
  } = taxResult;

  // Handle Share link copy
  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2200);
  };

  // Reset assumptions to statutory defaults
  const handleResetAssumptions = () => {
    setAssumptions({ ...DEFAULT_ASSUMPTIONS });
  };

  // Embed snippet code
  const embedSnippet = `<iframe src="https://www.yieldnest.online/calculators/tax-estimator" width="100%" height="780" frameborder="0" style="border-radius:12px;border:1px solid #e5e3dc;"></iframe>`;

  // Inject WebApplication JSON-LD into DOM
  useEffect(() => {
    const scriptId = "tax-estimator-calculator-jsonld";
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
          "@id": "https://www.yieldnest.online/calculators/tax-estimator#app",
          "name": "Indian Mutual Fund Capital Gains Tax Estimator",
          "url": "https://www.yieldnest.online/calculators/tax-estimator",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript",
          "description": "Calculate capital gains tax, holding period classification, Section 112A exemption, and net realization proceeds on mutual fund redemptions in India under Finance Act 2024.",
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
          "@id": "https://www.yieldnest.online/calculators/tax-estimator#breadcrumb",
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
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Mutual Fund Tax Estimator",
              "item": "https://www.yieldnest.online/calculators/tax-estimator",
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

  // Quick preset dates handler
  const handleQuickDuration = (months: number) => {
    const s = new Date(saleDate);
    const p = new Date(s);
    p.setMonth(p.getMonth() - months);
    const yyyy = p.getFullYear();
    const mm = String(p.getMonth() + 1).padStart(2, "0");
    const dd = String(p.getDate()).padStart(2, "0");
    setPurchaseDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleGoToSip = () => {
    if (onNavigateCalculator) {
      onNavigateCalculator("sip");
    } else {
      window.history.pushState({}, "", "/calculators/sip");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  const handleGoToSwp = () => {
    if (onNavigateCalculator) {
      onNavigateCalculator("swp");
    } else {
      window.history.pushState({}, "", "/calculators/swp");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <ToolLayout
      title="Mutual Fund Tax Estimator: Capital Gains & Net Proceeds"
      intro="Simulate capital gains tax liabilities on mutual fund redemptions in India under the latest Finance Act provisions. Accurately model equity LTCG & STCG, debt fund slab taxation, holding period classifications, and statutory health & education cess."
      badge="Tax Simulation Engine"
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
      breadcrumbs={[
        { label: "Calculators", onClick: onNavigateCalculators },
        { label: "Mutual Fund Tax Estimator" },
      ]}
    >
      <div className="space-y-10">
        {/* Top Control Bar: Share, Embed & As On Date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 text-xs font-mono-data">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium">
              <Scale className="w-3.5 h-3.5 text-emerald-700" />
              <span>Model: Finance Act 2024 Provisions</span>
            </span>
            <span className="text-stone-500">As on October 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-xs cursor-pointer font-medium"
            >
              {copiedShareUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Share Tax Estimate</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowEmbedCode(!showEmbedCode)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-xs cursor-pointer font-medium"
            >
              <Code2 className="w-3.5 h-3.5 text-stone-500" />
              <span>Embed</span>
            </button>
          </div>
        </div>

        {/* Embed Snippet Drawer */}
        {showEmbedCode && (
          <div className="p-4 rounded-xl bg-stone-900 text-stone-100 border border-stone-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono-data font-semibold text-stone-300">Embed Tax Estimator Calculator</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(embedSnippet);
                  alert("Embed code copied to clipboard!");
                }}
                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded text-stone-300 cursor-pointer"
              >
                Copy HTML
              </button>
            </div>
            <pre className="p-3 bg-black/60 rounded font-mono-data text-[11px] overflow-x-auto text-emerald-400">
              {embedSnippet}
            </pre>
          </div>
        )}

        {/* Statutory Rule Change Caution Banner */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 text-amber-950 font-sans">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Notice: </strong>
              <span>Tax rules change. Verify on the Income Tax Department website or with a CA.</span>
            </div>
          </div>
          <span className="font-mono-data text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
            As on October 2026
          </span>
        </div>

        {/* Step 1: Fund Type Selector */}
        <div className="space-y-3 bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-sm font-mono-data uppercase tracking-wider font-semibold text-stone-900">
                1. Select Mutual Fund Asset Classification
              </h2>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Taxation treatment in India depends strictly on equity portfolio allocation and purchase timeline
              </p>
            </div>
            <span className="text-[11px] font-mono-data text-stone-400">Step 1 of 2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Option A: Equity-oriented */}
            <button
              onClick={() => setFundCategory("equity")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                fundCategory === "equity"
                  ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
                  : "bg-stone-50/60 border-stone-200 hover:border-stone-400 hover:bg-white"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data text-xs font-bold text-stone-900">
                    Equity-Oriented Funds
                  </span>
                  {fundCategory === "equity" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                  Holds <strong>65%+ in domestic equities</strong> (e.g. Flexi Cap, Large Cap, Mid Cap, ELSS, Aggressive Hybrid).
                </p>
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-stone-200/80 font-mono-data text-[10.5px] text-stone-700 space-y-0.5">
                <div>• &gt;12 mos: 12.5% LTCG (above ₹1.25L)</div>
                <div>• ≤12 mos: 20% STCG</div>
              </div>
            </button>

            {/* Option B: Debt Funds bought post 1 Apr 2023 */}
            <button
              onClick={() => setFundCategory("debt-post-2023")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                fundCategory === "debt-post-2023"
                  ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
                  : "bg-stone-50/60 border-stone-200 hover:border-stone-400 hover:bg-white"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data text-xs font-bold text-stone-900">
                    Debt / Specified Funds (Post-1 Apr 2023)
                  </span>
                  {fundCategory === "debt-post-2023" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                  Funds bought <strong>on or after 1 Apr 2023</strong> with ≤35% equity (Pure Debt, Liquid, Conservative Hybrid).
                </p>
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-stone-200/80 font-mono-data text-[10.5px] text-stone-700 space-y-0.5">
                <div>• Taxed at applicable income slab</div>
                <div>• No LTCG exemption or indexation</div>
              </div>
            </button>

            {/* Option C: Other funds with holding-period rule */}
            <button
              onClick={() => setFundCategory("other-holding-period")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                fundCategory === "other-holding-period"
                  ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
                  : "bg-stone-50/60 border-stone-200 hover:border-stone-400 hover:bg-white"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data text-xs font-bold text-stone-900">
                    Other Funds (Holding-Period Rule)
                  </span>
                  {fundCategory === "other-holding-period" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                  Gold/Silver ETFs, Fund of Funds, international funds, or hybrid funds (35%–65% equity).
                </p>
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-stone-200/80 font-mono-data text-[10.5px] text-stone-700 space-y-0.5">
                <div>• &gt;24 mos: 12.5% LTCG (no indexation)</div>
                <div>• ≤24 mos: Taxed at income slab</div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Grid: Inputs Column & Summary/Output Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Inputs (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-mono-data uppercase tracking-wider font-semibold text-stone-900">
                Transaction Inputs
              </h2>
              <span className="text-[11px] font-mono-data text-stone-500">₹ Indian Format</span>
            </div>

            {/* Input 1: Purchase / Invested Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="tax-purchase-amount" className="text-xs font-semibold text-stone-800">
                  Total Purchase Amount (₹)
                </label>
                <span className="text-xs font-mono-data font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  {formatIndianWords(purchaseAmount)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono-data text-sm">₹</span>
                <input
                  id="tax-purchase-amount"
                  type="number"
                  min="1000"
                  max="100000000"
                  step="10000"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <input
                aria-label="Purchase amount slider"
                type="range"
                min="10000"
                max="5000000"
                step="25000"
                value={Math.min(purchaseAmount, 5000000)}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-data">
                <span>₹50k</span>
                <span>₹3 Lakh</span>
                <span>₹10 Lakh</span>
                <span>₹25 Lakh</span>
              </div>
            </div>

            {/* Input 2: Sale / Redemption Proceeds */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="tax-sale-amount" className="text-xs font-semibold text-stone-800">
                  Redemption / Sale Amount (₹)
                </label>
                <span className="text-xs font-mono-data font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {formatIndianWords(saleAmount)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono-data text-sm">₹</span>
                <input
                  id="tax-sale-amount"
                  type="number"
                  min="0"
                  max="200000000"
                  step="10000"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <input
                aria-label="Sale amount slider"
                type="range"
                min="10000"
                max="10000000"
                step="25000"
                value={Math.min(saleAmount, 10000000)}
                onChange={(e) => setSaleAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-data">
                <span>₹1 Lakh</span>
                <span>₹5.5 Lakh</span>
                <span>₹20 Lakh</span>
                <span>₹50 Lakh</span>
              </div>
            </div>

            {/* Date Inputs: Purchase Date & Sale Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label htmlFor="tax-purchase-date" className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>Purchase Date</span>
                </label>
                <input
                  id="tax-purchase-date"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tax-sale-date" className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>Sale / Redemption Date</span>
                </label>
                <input
                  id="tax-sale-date"
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Quick Holding Period Shortcut Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono-data text-stone-500">Quick Holding Presets:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "6 Months (STCG)", months: 6 },
                  { label: "11 Months (STCG)", months: 11 },
                  { label: "18 Months (LTCG Equity)", months: 18 },
                  { label: "2.5 Years (LTCG)", months: 30 },
                  { label: "5 Years", months: 60 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleQuickDuration(item.months)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 font-mono-data text-[10.5px] transition-colors cursor-pointer border border-stone-200"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 3: Other LTCG Booked this FY (for Equity ₹1.25L exemption offset) */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label htmlFor="tax-other-ltcg" className="text-xs font-semibold text-stone-800">
                  Other Equity LTCG Booked in Current FY (₹)
                </label>
                <span className="text-xs font-mono-data font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  {formatINR(otherLtcgBooked)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono-data text-sm">₹</span>
                <input
                  id="tax-other-ltcg"
                  type="number"
                  min="0"
                  max="10000000"
                  step="5000"
                  value={otherLtcgBooked}
                  onChange={(e) => setOtherLtcgBooked(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-stone-500 font-sans leading-tight">
                Used to compute your remaining ₹{formatINR(Math.max(0, assumptions.equityLtcgExemption - otherLtcgBooked))} annual exemption under Section 112A (old Act numbering; the Income-tax Act 2025 renumbered sections).
              </p>
            </div>

            {/* Input 4: Annual Income Slab Rate */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label htmlFor="tax-slab-rate" className="text-xs font-semibold text-stone-800">
                  Your Applicable Income Slab Rate (%)
                </label>
                <span className="text-xs font-mono-data font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                  {slabRate}% + 4% cess
                </span>
              </div>
              <div className="relative">
                <input
                  id="tax-slab-rate"
                  type="number"
                  min="0"
                  max="42.74"
                  step="1"
                  value={slabRate}
                  onChange={(e) => setSlabRate(Math.max(0, Math.min(42.74, Number(e.target.value))))}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-mono-data text-xs">%</span>
              </div>
              <div className="flex gap-2">
                {[0, 5, 10, 15, 20, 30].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlabRate(s)}
                    className={`flex-1 py-1 rounded text-[11px] font-mono-data border transition-colors cursor-pointer ${
                      slabRate === s
                        ? "bg-stone-900 text-white border-stone-900 font-bold"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-500 font-sans leading-tight">
                Applies when gains are taxed as ordinary income (e.g. debt funds bought on or after 1 Apr 2023, or short-term hybrid funds).
              </p>
            </div>
          </div>

          {/* Right Column: Key Results & Tax Breakdown (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Hero Card: Estimated Tax & In-Hand Realization */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-emerald-950 text-white border border-stone-800 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono-data text-xs text-stone-300 uppercase tracking-wider">
                    Tax Liability Simulation
                  </span>
                </div>
                <span className="text-xs font-mono-data text-emerald-400 font-semibold">
                  {holdingClassification}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-baseline">
                {/* Estimated Tax Liability */}
                <div className="space-y-1">
                  <span className="text-xs font-mono-data uppercase text-stone-400">
                    Estimated Tax Liability (incl. Cess)
                  </span>
                  <div className={`text-3xl sm:text-4xl font-extrabold font-mono-data ${totalTax > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {formatINR(totalTax)}
                  </div>
                  <div className="text-xs text-stone-300 font-sans">
                    {totalTax > 0
                      ? `${formatIndianWords(totalTax)} (Effective Rate: ${effectiveTaxRate.toFixed(2)}%)`
                      : "Zero Tax (Exempt or Loss)"}
                  </div>
                </div>

                {/* Net Proceeds In-Hand */}
                <div className="space-y-1 sm:border-l sm:border-stone-800 sm:pl-6">
                  <span className="text-xs font-mono-data uppercase text-stone-400">
                    Net Proceeds (Post-Tax In-Hand)
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono-data text-white">
                    {formatINR(netProceeds)}
                  </div>
                  <div className="text-xs text-stone-300 font-sans">
                    {formatIndianWords(netProceeds)} realized into bank account
                  </div>
                </div>
              </div>

              {/* Realization Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono-data text-stone-300">
                  <span>Proceeds Realization Composition</span>
                  <span>{((netProceeds / Math.max(1, saleAmount)) * 100).toFixed(1)}% Retained In-Hand</span>
                </div>
                <div className="h-3 w-full bg-stone-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, (purchaseAmount / Math.max(1, saleAmount)) * 100)}%` }}
                    className="bg-stone-500 h-full"
                    title={`Original Capital: ${formatINR(purchaseAmount)}`}
                  />
                  <div
                    style={{ width: `${Math.max(0, Math.min(100, ((gain - totalTax) / Math.max(1, saleAmount)) * 100))}%` }}
                    className="bg-emerald-600 h-full"
                    title={`Net Realized Gain: ${formatINR(Math.max(0, gain - totalTax))}`}
                  />
                  {totalTax > 0 && (
                    <div
                      style={{ width: `${Math.min(100, (totalTax / Math.max(1, saleAmount)) * 100)}%` }}
                      className="bg-rose-500 h-full"
                      title={`Estimated Tax: ${formatINR(totalTax)}`}
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono-data text-stone-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-stone-500"></span>
                    <span>Principal: {formatINR(purchaseAmount)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                    <span>Net Gain: {formatINR(Math.max(0, gain - totalTax))}</span>
                  </div>
                  {totalTax > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                      <span>Tax + Cess: {formatINR(totalTax)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Core Output Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Capital Gain / Loss */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10.5px] font-mono-data uppercase font-semibold text-stone-500 tracking-wider">
                  Total Capital {isLoss ? "Loss" : "Gain"}
                </span>
                <div className={`text-xl font-bold font-mono-data ${isLoss ? "text-rose-700" : "text-emerald-800"}`}>
                  {isLoss ? `-${formatINR(Math.abs(gain))}` : `+${formatINR(gain)}`}
                </div>
                <div className="text-[11px] text-stone-500 font-sans">
                  {formatIndianWords(gain)}
                </div>
              </div>

              {/* Exempt Amount Used */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10.5px] font-mono-data uppercase font-semibold text-stone-500 tracking-wider">
                  Exempt Amount Used
                </span>
                <div className="text-xl font-bold font-mono-data text-stone-900">
                  {formatINR(exemptAmountUsed)}
                </div>
                <div className="text-[11px] text-stone-500 font-sans">
                  {fundCategory === "equity" && isLtcg
                    ? `out of ₹${formatCompactINR(availableExemptionBefore)} available`
                    : "Not applicable"}
                </div>
              </div>

              {/* Taxable Capital Gain */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10.5px] font-mono-data uppercase font-semibold text-stone-500 tracking-wider">
                  Taxable Gain Amount
                </span>
                <div className="text-xl font-bold font-mono-data text-amber-900">
                  {formatINR(taxableGain)}
                </div>
                <div className="text-[11px] text-stone-500 font-sans">
                  taxed at {applicableRatePercent}%
                </div>
              </div>
            </div>

            {/* Detailed Calculation Audit Table */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-serif-editorial text-stone-900">
                    Step-by-Step Capital Gains Computation
                  </h3>
                  <p className="text-xs text-stone-500 font-mono-data">
                    Holding Period: {holdingMonths} months ({holdingDays} calendar days)
                  </p>
                </div>
                <span className="text-[11px] font-mono-data px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                  {isLtcg ? "Long-Term" : "Short-Term"}
                </span>
              </div>

              <div className="divide-y divide-stone-100 text-xs font-mono-data">
                <div className="py-2.5 flex justify-between items-center text-stone-700">
                  <span>Gross Redemption Value (Sale Proceeds)</span>
                  <span className="font-semibold text-stone-900">{formatINR(saleAmount)}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center text-stone-700">
                  <span>Less: Cost of Acquisition (Purchase Amount)</span>
                  <span className="font-semibold text-stone-900">-{formatINR(purchaseAmount)}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center text-stone-900 font-bold bg-stone-50/50 px-2 rounded">
                  <span>Gross Capital Gain / (Loss)</span>
                  <span className={gain >= 0 ? "text-emerald-800" : "text-rose-700"}>
                    {gain >= 0 ? `+${formatINR(gain)}` : `-${formatINR(Math.abs(gain))}`}
                  </span>
                </div>
                {fundCategory === "equity" && isLtcg && (
                  <div className="py-2.5 flex justify-between items-center text-stone-700">
                    <span>
                      Less: Section 112A (old Act numbering; the Income-tax Act 2025 renumbered sections) Annual Exemption
                    </span>
                    <span className="text-emerald-800 font-semibold">-{formatINR(exemptAmountUsed)}</span>
                  </div>
                )}
                <div className="py-2.5 flex justify-between items-center text-stone-900 font-bold">
                  <span>Net Taxable Capital Gain</span>
                  <span>{formatINR(taxableGain)}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center text-stone-700">
                  <span>Base Tax Calculation ({applicableRatePercent}% on {formatINR(taxableGain)})</span>
                  <span>{formatINR(baseTax)}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center text-stone-700">
                  <span>Add: Health &amp; Education Cess ({assumptions.cessRate}% on Base Tax)</span>
                  <span>+{formatINR(cessAmount)}</span>
                </div>
                <div className="py-3 flex justify-between items-center text-stone-950 font-bold text-sm bg-amber-50/60 px-2 rounded border-t border-amber-200">
                  <span>Total Tax Payable</span>
                  <span className="text-amber-900">{formatINR(totalTax)}</span>
                </div>
                <div className="py-3 flex justify-between items-center text-emerald-950 font-bold text-sm bg-emerald-50/60 px-2 rounded border-t border-emerald-200">
                  <span>Final Net Proceeds In-Hand</span>
                  <span className="text-emerald-900">{formatINR(netProceeds)}</span>
                </div>
              </div>
            </div>

            {/* Special Statutory Tax Rules Callout */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-stone-700 font-sans leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs font-mono-data uppercase">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>Critical Statutory Rules (Finance Act &amp; Capital Gains)</span>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                <li>
                  <strong>Section 87A Rebate Ineligibility:</strong> The Section 87A rebate does not apply to equity LTCG taxable at special rates under Section 112A (old Act numbering; the Income-tax Act 2025 renumbered sections). You cannot claim the ₹25,000 rebate to cancel out tax on equity LTCG even if your total taxable income is below ₹7 Lakh (New Tax Regime) or ₹5 Lakh (Old Tax Regime).
                </li>
                <li>
                  <strong>Loss Set-Off &amp; Carry Forward:</strong> Short-term capital losses (STCL) can be set off against both short-term capital gains and long-term capital gains. Long-term capital losses (LTCL) can only be set off against long-term capital gains. Unabsorbed capital losses can be carried forward for up to 8 assessment years if the return of income is filed within the due date under Section 139(1).
                </li>
                <li>
                  <strong>Direct Plan vs Regular Plan Advantage:</strong> Capital gains taxation applies identically to Direct and Regular plans, but Direct plans eliminate distributor commissions (typically 0.50%–1.20%/year), boosting your net pre-tax corpus.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Visible "Assumptions" Box (All Defaults Editable) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-3">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-base font-bold font-serif-editorial text-stone-900">
                  Regulatory Assumptions &amp; Tax Slabs (Fully Editable)
                </h3>
                <p className="text-xs text-stone-500 font-mono-data">
                  All default rates reflect Finance Act 2024 provisions. You can customize them to test future Union Budget updates.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono-data text-[11px] bg-stone-100 text-stone-700 px-2.5 py-1 rounded">
                As on October 2026
              </span>
              <button
                onClick={handleResetAssumptions}
                className="inline-flex items-center gap-1 text-xs font-mono-data text-stone-600 hover:text-stone-900 cursor-pointer"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Assumption 1: Equity STCG Rate */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="assump-equity-stcg" className="text-xs font-bold text-stone-800">
                  Equity STCG Rate (%)
                </label>
                <span className="text-xs font-mono-data font-semibold text-stone-900">≤ 12 Months</span>
              </div>
              <div className="relative">
                <input
                  id="assump-equity-stcg"
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={assumptions.equityStcgRate}
                  onChange={(e) =>
                    setAssumptions({ ...assumptions, equityStcgRate: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono-data text-xs font-bold"
                />
                <span className="absolute right-3 top-2 text-stone-400 font-mono-data text-xs">%</span>
              </div>
              <p className="text-[10.5px] text-stone-500 font-sans">
                Statutory Default: 20% (hiked from 15% under Finance Act 2024).
              </p>
            </div>

            {/* Assumption 2: Equity LTCG Rate */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="assump-equity-ltcg" className="text-xs font-bold text-stone-800">
                  Equity LTCG Rate (%)
                </label>
                <span className="text-xs font-mono-data font-semibold text-stone-900">&gt; 12 Months</span>
              </div>
              <div className="relative">
                <input
                  id="assump-equity-ltcg"
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={assumptions.equityLtcgRate}
                  onChange={(e) =>
                    setAssumptions({ ...assumptions, equityLtcgRate: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono-data text-xs font-bold"
                />
                <span className="absolute right-3 top-2 text-stone-400 font-mono-data text-xs">%</span>
              </div>
              <p className="text-[10.5px] text-stone-500 font-sans">
                Statutory Default: 12.5% (hiked from 10% under Finance Act 2024).
              </p>
            </div>

            {/* Assumption 3: Equity Annual LTCG Exemption */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="assump-equity-exemption" className="text-xs font-bold text-stone-800">
                  Equity LTCG Exemption (₹/FY)
                </label>
                <span className="text-xs font-mono-data font-semibold text-emerald-800">Section 112A</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-400 font-mono-data text-xs">₹</span>
                <input
                  id="assump-equity-exemption"
                  type="number"
                  min="0"
                  max="1000000"
                  step="5000"
                  value={assumptions.equityLtcgExemption}
                  onChange={(e) =>
                    setAssumptions({ ...assumptions, equityLtcgExemption: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono-data text-xs font-bold"
                />
              </div>
              <p className="text-[10.5px] text-stone-500 font-sans">
                Statutory Default: ₹1,25,000 per financial year (increased from ₹1,00,000).
              </p>
            </div>

            {/* Assumption 4: Health & Education Cess */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="assump-cess-rate" className="text-xs font-bold text-stone-800">
                  Health &amp; Education Cess (%)
                </label>
                <span className="text-xs font-mono-data font-semibold text-stone-900">On Base Tax</span>
              </div>
              <div className="relative">
                <input
                  id="assump-cess-rate"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={assumptions.cessRate}
                  onChange={(e) =>
                    setAssumptions({ ...assumptions, cessRate: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono-data text-xs font-bold"
                />
                <span className="absolute right-3 top-2 text-stone-400 font-mono-data text-xs">%</span>
              </div>
              <p className="text-[10.5px] text-stone-500 font-sans">
                Statutory Default: 4% applied across all personal income taxes.
              </p>
            </div>

            {/* Assumption 5: Other Funds Holding Period Threshold */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="assump-other-threshold" className="text-xs font-bold text-stone-800">
                  Other Funds Holding Rule
                </label>
                <span className="text-xs font-mono-data font-semibold text-stone-900">Months</span>
              </div>
              <div className="relative">
                <input
                  id="assump-other-threshold"
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  value={assumptions.otherHoldingThresholdMonths}
                  onChange={(e) =>
                    setAssumptions({
                      ...assumptions,
                      otherHoldingThresholdMonths: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono-data text-xs font-bold"
                />
                <span className="absolute right-3 top-2 text-stone-400 font-mono-data text-xs">Mos</span>
              </div>
              <p className="text-[10.5px] text-stone-500 font-sans">
                Default: 24 Months under Finance Act 2024 (unlisted / specified assets).
              </p>
            </div>

            {/* Assumption 6: Other Funds LTCG Rate */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="assump-other-ltcg-rate" className="text-xs font-bold text-stone-800">
                  Other Funds LTCG Rate (%)
                </label>
                <span className="text-xs font-mono-data font-semibold text-stone-900">No Indexation</span>
              </div>
              <div className="relative">
                <input
                  id="assump-other-ltcg-rate"
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={assumptions.otherLtcgRate}
                  onChange={(e) =>
                    setAssumptions({
                      ...assumptions,
                      otherLtcgRate: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono-data text-xs font-bold"
                />
                <span className="absolute right-3 top-2 text-stone-400 font-mono-data text-xs">%</span>
              </div>
              <p className="text-[10.5px] text-stone-500 font-sans">
                Statutory Default: 12.5% without indexation under Finance Act 2024.
              </p>
            </div>
          </div>
        </div>

        {/* Wealth Acceleration & Execution Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Link to SWP Calculator */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-data text-emerald-800 font-semibold uppercase">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>Tax-Efficient Monthly Income</span>
              </div>
              <h3 className="text-base font-bold font-serif-editorial text-stone-900">
                Systematic Withdrawal Plan (SWP) Simulator
              </h3>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                Discover why mutual fund SWP redemptions are far more tax-efficient than bank FD interest by redeeming fractional capital alongside gains.
              </p>
            </div>
            <a
              href="/calculators/swp"
              onClick={(e) => {
                if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  handleGoToSwp();
                }
              }}
              className="inline-flex items-center gap-2 text-xs font-mono-data font-bold text-stone-900 hover:text-emerald-800 transition-colors cursor-pointer self-start no-underline"
            >
              <span>Launch SWP Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2: Link to SIP Calculator */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-data text-emerald-800 font-semibold uppercase">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>Wealth Compounding Engine</span>
              </div>
              <h3 className="text-base font-bold font-serif-editorial text-stone-900">
                Systematic Investment Plan (SIP) Calculator
              </h3>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                Simulate disciplined monthly compounding, annual salary increments, and multi-year wealth accumulation trajectories.
              </p>
            </div>
            <a
              href="/calculators/sip"
              onClick={(e) => {
                if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  handleGoToSip();
                }
              }}
              className="inline-flex items-center gap-2 text-xs font-mono-data font-bold text-stone-900 hover:text-emerald-800 transition-colors cursor-pointer self-start no-underline"
            >
              <span>Launch SIP Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Regulatory Integrity & Statutory Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE8E0] text-xs text-stone-600 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-stone-900 font-bold font-mono-data uppercase tracking-wider text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Statutory Regulatory Notice</span>
          </div>
          <p className="leading-relaxed font-sans text-stone-600">
            Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing. YieldNest is an independent investor education platform and is not registered with SEBI or AMFI. Tax laws and regulatory interpretations are subject to amendment by Parliament. Calculator simulations are purely educational and do not constitute tax or investment advice. Tax rules change. Verify on the Income Tax Department website or with a CA.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
