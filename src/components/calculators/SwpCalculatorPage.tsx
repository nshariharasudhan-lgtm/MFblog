import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingDown,
  TrendingUp,
  Share2,
  Copy,
  Check,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Code2,
  ShieldAlert,
  AlertTriangle,
  Percent,
  Coins,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowDownRight,
  HelpCircle,
  Calculator,
} from "lucide-react";
import { ToolLayout } from "../ToolLayout";
import { SiteSettings, ArticleCategory } from "../../types";
import {
  formatINR,
  formatIndianWords,
  formatCompactINR,
  calculateSwpSchedule,
} from "./calculatorUtils";

interface SwpCalculatorPageProps {
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

export function SwpCalculatorPage({
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
}: SwpCalculatorPageProps) {
  // Read initial query parameters from URL
  const [initialCorpus, setInitialCorpus] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("corpus") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 5000000; // Default ₹50 Lakh
  });

  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("withdrawal") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 35000; // Default ₹35,000 / month
  });

  const [annualReturn, setAnnualReturn] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("rate") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 8.5; // Default 8.5% p.a.
  });

  const [years, setYears] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseInt(params.get("years") || "", 10);
      if (!isNaN(val) && val > 0) return val;
    }
    return 20; // Default 20 Years
  });

  const [annualStepUp, setAnnualStepUp] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("stepup") || "");
      if (!isNaN(val) && val >= 0) return val;
    }
    return 0; // Default 0% annual increase
  });

  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Sync state to URL search parameters for instant shareability
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("corpus", initialCorpus.toString());
    params.set("withdrawal", monthlyWithdrawal.toString());
    params.set("rate", annualReturn.toString());
    params.set("years", years.toString());
    if (annualStepUp > 0) params.set("stepup", annualStepUp.toString());

    const newRelativePathQuery = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newRelativePathQuery);
  }, [initialCorpus, monthlyWithdrawal, annualReturn, years, annualStepUp]);

  // Compute SWP schedule & outcomes
  const swpData = useMemo(() => {
    return calculateSwpSchedule(initialCorpus, monthlyWithdrawal, annualReturn, years, annualStepUp);
  }, [initialCorpus, monthlyWithdrawal, annualReturn, years, annualStepUp]);

  const {
    schedule,
    totalWithdrawn,
    finalBalance,
    totalGrowthEarned,
    annualWithdrawalRate,
    isDepleted,
    depletedMonth,
    depletedYear,
    depletedMonthInYear,
  } = swpData;

  // Warning condition: withdrawal rate exceeds return rate
  const isWithdrawalHigherThanReturn = annualWithdrawalRate > annualReturn;

  // Handle Share link copy
  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2200);
  };

  // Embed snippet code
  const embedSnippet = `<iframe src="https://www.yieldnest.online/swp-calculator.html" width="100%" height="720" frameborder="0" style="border-radius:12px;border:1px solid #e5e3dc;"></iframe>`;

  // Inject WebApplication JSON-LD into DOM
  useEffect(() => {
    const scriptId = "swp-calculator-jsonld";
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
          "@id": "https://www.yieldnest.online/calculators/swp#app",
          "name": "Mutual Fund Systematic Withdrawal Plan (SWP) Calculator",
          "url": "https://www.yieldnest.online/calculators/swp",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript",
          "description": "Calculate monthly cash flows, total withdrawals, final remaining corpus, and depletion horizon for mutual fund Systematic Withdrawal Plans in India.",
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
          "@id": "https://www.yieldnest.online/calculators/swp#breadcrumb",
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
              "name": "SWP Calculator",
              "item": "https://www.yieldnest.online/calculators/swp",
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

  // Growth chart coordinates
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 24;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Max value for chart scale includes initial corpus, peak balance, and total withdrawn
  const maxBalance = Math.max(initialCorpus, ...schedule.map((s) => s.closingBalance), 100000);
  const chartPoints = schedule.map((row, idx) => {
    const x = paddingX + (idx / Math.max(1, schedule.length - 1)) * innerWidth;
    const yBalance = chartHeight - paddingY - (row.closingBalance / maxBalance) * innerHeight;
    const yWithdrawn = chartHeight - paddingY - (Math.min(row.cumulativeWithdrawn, maxBalance) / maxBalance) * innerHeight;
    return { ...row, x, yBalance, yWithdrawn };
  });

  const balancePath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yBalance}`, "");
  const balanceArea = `${balancePath} L ${chartPoints[chartPoints.length - 1]?.x || 0},${chartHeight - paddingY} L ${chartPoints[0]?.x || 0},${chartHeight - paddingY} Z`;

  const withdrawnPath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yWithdrawn}`, "");

  const displayedSchedule = showAllYears ? schedule : schedule.slice(0, 10);

  // Navigate to SIP calculator
  const handleGoToSip = () => {
    if (onNavigateCalculator) {
      onNavigateCalculator("sip");
    } else {
      window.history.pushState({}, "", "/calculators/sip");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <ToolLayout
      title="SWP Calculator: Systematic Withdrawal Plan & Longevity"
      intro="Simulate monthly cash flows, total capital withdrawals, and remaining corpus balance from your mutual fund investments. Evaluate whether your withdrawal rate is sustainable or leads to capital depletion under monthly periodic compounding."
      badge="Quantitative Educational Tool"
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
        { label: "SWP Calculator" },
      ]}
    >
      <div className="space-y-10">
        {/* Top Control Bar: Share, Embed & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 text-xs font-mono-data">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium">
              <Coins className="w-3.5 h-3.5 text-emerald-700" />
              <span>Model: Monthly Compounding</span>
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
                  <span>Share Results</span>
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
              <span className="font-mono-data font-semibold text-stone-300">Embed SWP Calculator</span>
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

        {/* Dynamic Warning Alert: When Withdrawal Rate Exceeds Return Rate */}
        {isWithdrawalHigherThanReturn ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs sm:text-sm font-bold font-mono-data uppercase tracking-wider text-amber-900">
                  Capital Depletion Warning: Withdrawal Rate ({annualWithdrawalRate.toFixed(2)}%) &gt; Expected Return ({annualReturn.toFixed(2)}%)
                </h2>
                <p className="text-xs text-amber-800/90 font-sans mt-0.5 leading-relaxed">
                  Your annual withdrawal rate exceeds your expected investment return rate. You are systematically drawing down your invested principal to fund monthly payouts.
                  {isDepleted ? (
                    <strong className="block sm:inline font-semibold text-rose-800 mt-1 sm:mt-0 sm:ml-1">
                      Your corpus is projected to exhaust in Year {depletedYear}, Month {depletedMonthInYear} (Month {depletedMonth}).
                    </strong>
                  ) : (
                    <span> While your corpus lasts through the modeled {years}-year horizon, the closing balance will decrease over time.</span>
                  )}
                </p>
              </div>
            </div>
            <div className="shrink-0 self-end sm:self-center font-mono-data text-xs bg-amber-200/80 px-2.5 py-1 rounded text-amber-900 font-semibold">
              Erosion Rate: -{(annualWithdrawalRate - annualReturn).toFixed(2)}%/yr
            </div>
          </div>
        ) : (
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <p className="font-sans leading-relaxed text-emerald-900 m-0">
                <strong>Sustainable Cash Flow Rate:</strong> Your annual withdrawal rate (<strong>{annualWithdrawalRate.toFixed(2)}%</strong>) is within your expected return rate (<strong>{annualReturn.toFixed(2)}%</strong>). Your corpus continues generating surplus returns to preserve or grow principal.
              </p>
            </div>
            <span className="hidden sm:inline-block font-mono-data text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
              Principal Preserved
            </span>
          </div>
        )}

        {/* Main Grid: Inputs Column & Summary/Chart Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Inputs (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-mono-data uppercase tracking-wider font-semibold text-stone-900">
                SWP Parameters
              </h2>
              <span className="text-[11px] font-mono-data text-stone-500">₹ Indian Format</span>
            </div>

            {/* Input 1: Total Initial Investment Corpus */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="swp-initial-corpus" className="text-xs font-semibold text-stone-800">
                  Initial Investment Corpus (₹)
                </label>
                <span className="text-xs font-mono-data font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {formatIndianWords(initialCorpus)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono-data text-sm">₹</span>
                <input
                  id="swp-initial-corpus"
                  type="number"
                  min="50000"
                  max="500000000"
                  step="50000"
                  value={initialCorpus}
                  onChange={(e) => setInitialCorpus(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <input
                aria-label="Initial investment corpus slider"
                type="range"
                min="100000"
                max="20000000"
                step="100000"
                value={Math.min(initialCorpus, 20000000)}
                onChange={(e) => setInitialCorpus(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-data">
                <span>₹10 Lakh</span>
                <span>₹50 Lakh</span>
                <span>₹1 Crore</span>
                <span>₹2 Crore</span>
              </div>
            </div>

            {/* Input 2: Monthly Withdrawal Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="swp-monthly-withdrawal" className="text-xs font-semibold text-stone-800">
                  Monthly Withdrawal (₹)
                </label>
                <span className="text-xs font-mono-data font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  {formatINR(monthlyWithdrawal)} / mo
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono-data text-sm">₹</span>
                <input
                  id="swp-monthly-withdrawal"
                  type="number"
                  min="1000"
                  max="2000000"
                  step="1000"
                  value={monthlyWithdrawal}
                  onChange={(e) => setMonthlyWithdrawal(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <input
                aria-label="Monthly withdrawal slider"
                type="range"
                min="5000"
                max="200000"
                step="1000"
                value={Math.min(monthlyWithdrawal, 200000)}
                onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-data">
                <span>₹10k</span>
                <span>₹35k</span>
                <span>₹75k</span>
                <span>₹1.5 Lakh</span>
              </div>
            </div>

            {/* Input 3: Expected Annual Return Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="swp-expected-return" className="text-xs font-semibold text-stone-800">
                  Expected Return Rate (% p.a.)
                </label>
                <span className="text-xs font-mono-data font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                  {annualReturn.toFixed(1)}% p.a.
                </span>
              </div>
              <div className="relative">
                <input
                  id="swp-expected-return"
                  type="number"
                  min="1"
                  max="30"
                  step="0.1"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-mono-data text-xs">%</span>
              </div>
              <input
                aria-label="Expected return rate slider"
                type="range"
                min="4"
                max="18"
                step="0.5"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-data">
                <span>6% (Debt)</span>
                <span>8.5% (Conservative)</span>
                <span>12% (Equity)</span>
                <span>15%</span>
              </div>
            </div>

            {/* Input 4: Horizon / Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="swp-duration-years" className="text-xs font-semibold text-stone-800">
                  Withdrawal Time Period (Years)
                </label>
                <span className="text-xs font-mono-data font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                  {years} Years ({years * 12} Mos)
                </span>
              </div>
              <div className="relative">
                <input
                  id="swp-duration-years"
                  type="number"
                  min="1"
                  max="40"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Math.min(40, Number(e.target.value))))}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-mono-data text-xs">Yrs</span>
              </div>
              <input
                aria-label="Withdrawal time period slider"
                type="range"
                min="1"
                max="35"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-data">
                <span>5 Yrs</span>
                <span>15 Yrs</span>
                <span>25 Yrs</span>
                <span>35 Yrs</span>
              </div>
            </div>

            {/* Input 5: Optional Annual Withdrawal Increase (Step-Up SWP) */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="swp-annual-stepup" className="text-xs font-semibold text-stone-800">
                    Annual Withdrawal Increase (%)
                  </label>
                  <span className="text-[10px] font-mono-data px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                    Optional
                  </span>
                </div>
                <span className="text-xs font-mono-data font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {annualStepUp > 0 ? `+${annualStepUp}% / yr` : "None (Fixed Payout)"}
                </span>
              </div>
              <div className="relative">
                <input
                  id="swp-annual-stepup"
                  type="number"
                  min="0"
                  max="20"
                  step="1"
                  value={annualStepUp}
                  onChange={(e) => setAnnualStepUp(Math.max(0, Math.min(20, Number(e.target.value))))}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-mono-data text-xs">% / yr</span>
              </div>
              <input
                aria-label="Annual withdrawal step-up slider"
                type="range"
                min="0"
                max="15"
                step="1"
                value={annualStepUp}
                onChange={(e) => setAnnualStepUp(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <p className="text-[11px] text-stone-500 font-sans leading-tight">
                Simulates annual cost-of-living adjustments (inflation indexing) by bumping monthly withdrawals every 12 months.
              </p>
            </div>

            {/* Quick Summary Box */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono-data space-y-1.5 text-stone-600">
              <div className="flex justify-between">
                <span>Annual Withdrawal:</span>
                <span className="font-semibold text-stone-900">{formatINR(monthlyWithdrawal * 12)}</span>
              </div>
              <div className="flex justify-between">
                <span>Initial Withdrawal Rate:</span>
                <span className={`font-semibold ${isWithdrawalHigherThanReturn ? "text-amber-700" : "text-emerald-700"}`}>
                  {annualWithdrawalRate.toFixed(2)}% / year
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expected Annual Growth:</span>
                <span className="font-semibold text-stone-900">{annualReturn.toFixed(2)}% / year</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Outputs & Visual Chart (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Withdrawn */}
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10.5px] font-mono-data uppercase font-semibold text-stone-500 tracking-wider">
                  Total Withdrawn
                </span>
                <div className="text-xl sm:text-2xl font-bold font-mono-data text-emerald-800">
                  {formatINR(totalWithdrawn)}
                </div>
                <div className="text-[11px] text-stone-500 font-sans">
                  {formatIndianWords(totalWithdrawn)}
                </div>
              </div>

              {/* Final Balance */}
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10.5px] font-mono-data uppercase font-semibold text-stone-500 tracking-wider">
                  Final Remaining Balance
                </span>
                <div className={`text-xl sm:text-2xl font-bold font-mono-data ${finalBalance > 0 ? "text-stone-900" : "text-rose-700"}`}>
                  {formatINR(finalBalance)}
                </div>
                <div className="text-[11px] text-stone-500 font-sans">
                  {finalBalance > 0 ? formatIndianWords(finalBalance) : "Corpus Exhausted"}
                </div>
              </div>

              {/* Longevity / Depletion Horizon */}
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10.5px] font-mono-data uppercase font-semibold text-stone-500 tracking-wider">
                  Corpus Longevity
                </span>
                <div className={`text-lg sm:text-xl font-bold font-mono-data ${isDepleted ? "text-rose-700" : "text-emerald-800"}`}>
                  {isDepleted ? `Year ${depletedYear}, M${depletedMonthInYear}` : `${years} Full Years`}
                </div>
                <div className="text-[11px] text-stone-500 font-sans">
                  {isDepleted ? `Depleted at Month ${depletedMonth}` : "Sustains full period"}
                </div>
              </div>
            </div>

            {/* Growth & Withdrawal Summary Card */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-mono-data">
              <div>
                <span className="text-stone-400 block text-[10.5px] uppercase">Initial Capital Invested</span>
                <strong className="text-stone-900 text-sm font-semibold">{formatINR(initialCorpus)}</strong>
              </div>
              <div className="text-stone-300 hidden sm:block">+</div>
              <div>
                <span className="text-stone-400 block text-[10.5px] uppercase">Cumulative Returns Earned</span>
                <strong className="text-emerald-800 text-sm font-semibold">+{formatINR(totalGrowthEarned)}</strong>
              </div>
              <div className="text-stone-300 hidden sm:block">-</div>
              <div>
                <span className="text-stone-400 block text-[10.5px] uppercase">Total Cash Withdrawn</span>
                <strong className="text-amber-800 text-sm font-semibold">-{formatINR(totalWithdrawn)}</strong>
              </div>
              <div className="text-stone-300 hidden sm:block">=</div>
              <div>
                <span className="text-stone-400 block text-[10.5px] uppercase">Closing Value</span>
                <strong className={`text-sm font-semibold ${finalBalance > 0 ? "text-stone-900" : "text-rose-700"}`}>
                  {formatINR(finalBalance)}
                </strong>
              </div>
            </div>

            {/* Balance Over Time Interactive SVG Chart */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 font-serif-editorial">
                    Corpus Balance Over Time
                  </h2>
                  <p className="text-[11px] text-stone-500 font-mono-data">
                    Green area: Remaining corpus balance • Amber line: Cumulative withdrawals
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono-data">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="text-stone-600">Remaining Balance</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-stone-600">Total Withdrawn</span>
                  </div>
                </div>
              </div>

              {/* Chart SVG */}
              <div className="relative w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="swpBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = paddingY + innerHeight * (1 - ratio);
                    const val = maxBalance * ratio;
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="#F0EEE6"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={paddingX - 6}
                          y={y + 3}
                          textAnchor="end"
                          className="text-[9px] fill-stone-400 font-mono-data"
                        >
                          {formatCompactINR(val)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Balance Area Fill */}
                  <path d={balanceArea} fill="url(#swpBalanceGrad)" />

                  {/* Cumulative Withdrawn Line */}
                  <path
                    d={withdrawnPath}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />

                  {/* Balance Line */}
                  <path
                    d={balancePath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Data Points on Hover */}
                  {chartPoints.map((pt, idx) => {
                    const isHovered = hoveredYear === pt.year;
                    return (
                      <g
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredYear(pt.year)}
                        onMouseLeave={() => setHoveredYear(null)}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.yBalance}
                          r={isHovered ? 5 : 2.5}
                          fill="#059669"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-all"
                        />
                        {/* X-axis year labels */}
                        {(idx === 0 || idx === chartPoints.length - 1 || (schedule.length > 8 && idx % Math.ceil(schedule.length / 5) === 0)) && (
                          <text
                            x={pt.x}
                            y={chartHeight - 6}
                            textAnchor="middle"
                            className="text-[9.5px] fill-stone-500 font-mono-data"
                          >
                            Y{pt.year}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Depletion Marker if depleted */}
                  {isDepleted && (
                    <g>
                      <circle
                        cx={chartPoints[chartPoints.length - 1]?.x || 0}
                        cy={chartHeight - paddingY}
                        r="6"
                        fill="#DC2626"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    </g>
                  )}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredYear !== null && (
                  (() => {
                    const point = chartPoints.find((p) => p.year === hoveredYear);
                    if (!point) return null;
                    return (
                      <div className="mt-3 p-3 rounded-xl bg-stone-900 text-white text-xs font-mono-data flex flex-wrap items-center justify-between gap-3 shadow-md">
                        <span>
                          <strong>Year {point.year}:</strong>
                        </span>
                        <span>Balance: <strong className="text-emerald-400">{formatINR(point.closingBalance)}</strong></span>
                        <span>Annual Withdrawn: <strong>{formatINR(point.annualWithdrawn)}</strong></span>
                        <span>Total Cumulative: <strong>{formatINR(point.cumulativeWithdrawn)}</strong></span>
                        <span>Growth Earned: <strong className="text-emerald-400">+{formatINR(point.growthEarned)}</strong></span>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {/* Mandatory Regulatory Note */}
            <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200/80 text-xs text-stone-600 font-sans leading-relaxed">
              <span className="font-semibold text-stone-800">Mandatory Regulatory Note: </span>
              Returns are illustrative, not guaranteed. This does not include tax on withdrawals.
            </div>

            {/* Wealth Accumulation Link to SIP Calculator */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 text-white border border-emerald-900/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-data text-emerald-400 font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Phase 1: Wealth Accumulation</span>
                </div>
                <h2 className="text-base font-bold font-serif-editorial text-white">
                  Need to build your retirement corpus first?
                </h2>
                <p className="text-xs text-stone-300 font-sans max-w-md">
                  Simulate systematic monthly investments with compounding growth and annual step-ups using our SIP Calculator.
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
                className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-mono-data text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer no-underline"
              >
                <span>Launch SIP Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Year-by-Year Amortization Schedule Table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
            <div>
              <h2 className="text-base font-bold font-serif-editorial text-stone-900">
                Year-by-Year SWP Amortization Schedule
              </h2>
              <p className="text-xs text-stone-500 font-mono-data">
                Cash outflow and interest compounding breakdown across each financial year
              </p>
            </div>
            <button
              onClick={() => setShowAllYears(!showAllYears)}
              className="text-xs font-mono-data text-emerald-800 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>{showAllYears ? "Show First 10 Years" : `Show All ${schedule.length} Years`}</span>
              {showAllYears ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-data border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-700">
                  <th className="py-2.5 px-3 font-semibold">Year</th>
                  <th className="py-2.5 px-3 font-semibold">Opening Balance</th>
                  <th className="py-2.5 px-3 font-semibold">Monthly Payout</th>
                  <th className="py-2.5 px-3 font-semibold">Annual Withdrawn</th>
                  <th className="py-2.5 px-3 font-semibold">Cumulative Withdrawn</th>
                  <th className="py-2.5 px-3 font-semibold text-emerald-800">Growth / Returns Earned</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {displayedSchedule.map((row) => (
                  <tr
                    key={row.year}
                    className={`hover:bg-stone-50/80 transition-colors ${row.isDepleted ? "bg-rose-50/40 text-stone-500" : ""}`}
                  >
                    <td className="py-2.5 px-3 font-bold text-stone-900">
                      Year {row.year}
                      {row.isDepleted && (
                        <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-rose-100 text-rose-800 uppercase">
                          Depleted
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">{formatINR(row.openingBalance)}</td>
                    <td className="py-2.5 px-3 font-medium text-stone-900">{formatINR(row.monthlyWithdrawal)}</td>
                    <td className="py-2.5 px-3 text-amber-900 font-medium">{formatINR(row.annualWithdrawn)}</td>
                    <td className="py-2.5 px-3 text-stone-600">{formatINR(row.cumulativeWithdrawn)}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-medium">+{formatINR(row.growthEarned)}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${row.closingBalance > 0 ? "text-stone-950" : "text-rose-600"}`}>
                      {formatINR(row.closingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* "How This Is Calculated" Explanatory Section */}
        <div className="bg-[#FAF9F5] rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5">
          <div className="border-b border-stone-200 pb-3 flex items-center gap-2 text-stone-900">
            <HelpCircle className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold font-serif-editorial">
              How This Systematic Withdrawal Plan (SWP) Is Calculated
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 font-sans leading-relaxed">
            <div>
              <h3 className="font-bold text-stone-900 text-sm font-serif-editorial mb-1">
                1. Monthly Compounding &amp; Cash Outflow Formula
              </h3>
              <p>
                Each month, the designated monthly withdrawal amount is deducted from your mutual fund corpus at the start of the period. The remaining capital stays invested and compounds at the monthly equivalent return rate for that month:
              </p>
              <div className="my-2.5 p-3 rounded-xl bg-white border border-stone-200 font-mono-data text-xs sm:text-sm text-emerald-950 font-semibold inline-block">
                Balance<sub>month</sub> = (Balance<sub>month-1</sub> - Withdrawal) × (1 + r / 12)
              </div>
              <p>
                Where <strong>r</strong> represents the nominal annual return rate expressed as a decimal (e.g. 8.5% = 0.085).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 text-sm font-serif-editorial mb-1">
                2. Safe Withdrawal Rate vs. Capital Decumulation
              </h3>
              <p>
                Your withdrawal sustainability is determined by the relationship between your annual withdrawal rate and your investment returns:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-1.5">
                <li>
                  <strong>Capital Preservation / Growth Zone:</strong> If your annual withdrawal rate is lower than your portfolio return (e.g., withdrawing 6% from a fund compounding at 10%), your balance continues growing over time.
                </li>
                <li>
                  <strong>Capital Decumulation Zone:</strong> If your annual withdrawal rate exceeds your portfolio return (e.g., withdrawing 10% from a fund compounding at 7%), your returns cannot cover the full payout. Principal is systematically liquidated to fund withdrawals, resulting in corpus depletion after a finite number of months.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 text-sm font-serif-editorial mb-1">
                3. Annual Step-Up Inflation Adjustment (Optional)
              </h3>
              <p>
                If you specify an annual withdrawal increase (e.g., 5% or 7%), the monthly withdrawal amount stays constant for 12 months, and then scales up by the step-up percentage at the start of each subsequent year. This models inflation-indexed pension income to maintain real purchasing power.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 text-sm font-serif-editorial mb-1">
                4. Indian Mutual Fund Tax Efficiency Advantage
              </h3>
              <p>
                Unlike bank fixed deposit (FD) interest where 100% of the interest payout is taxed at your income tax slab every year, mutual fund SWP redemptions are treated as fractional unit sales. Each monthly redemption consists predominantly of original capital return with only a fractional capital gain component subject to Section 112A equity LTCG (12.5% above ₹1.25 Lakh) or debt fund rules, resulting in substantial tax deferral.
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory Integrity & Statutory Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE8E0] text-xs text-stone-600 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-stone-900 font-bold font-mono-data uppercase tracking-wider text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Statutory Regulatory Notice</span>
          </div>
          <p className="leading-relaxed font-sans text-stone-600">
            Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing. YieldNest is an independent investor education platform and is not registered with SEBI or AMFI. Past performance does not guarantee future returns. Calculator projections are mathematical simulations for educational purposes only and do not constitute investment advice or return guarantees. Returns are illustrative, not guaranteed. This does not include tax on withdrawals.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
