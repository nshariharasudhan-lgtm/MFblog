import React, { useState, useEffect, useMemo } from "react";
import {
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
  Percent,
  Coins,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ToolLayout } from "../ToolLayout";
import { SiteSettings, ArticleCategory } from "../../types";
import {
  formatINR,
  formatIndianWords,
  formatCompactINR,
  calculateSipSchedule,
  estimateLtcgTax,
} from "./calculatorUtils";

interface SipCalculatorPageProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onNavigateCalculators: () => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: () => void;
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function SipCalculatorPage({
  settings,
  onNavigateHome,
  onNavigateCalculators,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onSelectCategory,
  onSearchChange,
  searchQuery,
}: SipCalculatorPageProps) {
  // Read initial query parameters from URL
  const [monthlySip, setMonthlySip] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("amount") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 10000;
  });

  const [annualReturn, setAnnualReturn] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("rate") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 12.0;
  });

  const [years, setYears] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseInt(params.get("years") || "", 10);
      if (!isNaN(val) && val > 0) return val;
    }
    return 15;
  });

  // Editable Tax Rates & Thresholds with "as on" date
  const [ltcgRate, setLtcgRate] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("ltcgRate") || "");
      if (!isNaN(val) && val >= 0) return val;
    }
    return 12.5; // Budget 2024 revised rate
  });

  const [exemptionThreshold, setExemptionThreshold] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("exemption") || "");
      if (!isNaN(val) && val >= 0) return val;
    }
    return 125000; // ₹1.25 Lakh exemption limit
  });

  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [showTaxDrawer, setShowTaxDrawer] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Sync state to URL search parameters for instant shareability
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("amount", monthlySip.toString());
    params.set("rate", annualReturn.toString());
    params.set("years", years.toString());
    if (ltcgRate !== 12.5) params.set("ltcgRate", ltcgRate.toString());
    if (exemptionThreshold !== 125000) params.set("exemption", exemptionThreshold.toString());

    const newRelativePathQuery = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newRelativePathQuery);
  }, [monthlySip, annualReturn, years, ltcgRate, exemptionThreshold]);

  // Compute SIP schedule & totals
  const { schedule, totalInvested, futureValue, totalGains } = useMemo(() => {
    return calculateSipSchedule(monthlySip, annualReturn, years);
  }, [monthlySip, annualReturn, years]);

  // Compute Tax Estimate
  const taxData = useMemo(() => {
    return estimateLtcgTax(futureValue, totalInvested, ltcgRate, exemptionThreshold);
  }, [futureValue, totalInvested, ltcgRate, exemptionThreshold]);

  // Handle Share link copy
  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2200);
  };

  // Embed snippet code
  const embedSnippet = `<iframe src="https://www.yieldnest.online/sip-calculator.html" width="100%" height="700" frameborder="0" style="border-radius:12px;border:1px solid #e5e3dc;"></iframe>`;

  // Inject WebApplication JSON-LD into DOM
  useEffect(() => {
    const scriptId = "sip-calculator-jsonld";
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
          "@id": "https://www.yieldnest.online/calculators/sip#app",
          "name": "Mutual Fund Systematic Investment Plan (SIP) Compounding Calculator",
          "url": "https://www.yieldnest.online/calculators/sip",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript",
          "description": "Calculate future maturity corpus, total wealth gain, and post-tax returns for monthly mutual fund SIP investments in India with yearly amortization table.",
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
          "@id": "https://www.yieldnest.online/calculators/sip#breadcrumb",
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
              "name": "SIP Calculator",
              "item": "https://www.yieldnest.online/calculators/sip",
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

  const maxVal = Math.max(futureValue, 1000);
  const chartPoints = schedule.map((row, idx) => {
    const x = paddingX + (idx / Math.max(1, schedule.length - 1)) * innerWidth;
    const yValue = chartHeight - paddingY - (row.closingBalance / maxVal) * innerHeight;
    const yInvested = chartHeight - paddingY - (row.totalInvested / maxVal) * innerHeight;
    return { ...row, x, yValue, yInvested };
  });

  const valuePath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yValue}`, "");
  const investedPath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yInvested}`, "");

  const valueArea = `${valuePath} L ${chartPoints[chartPoints.length - 1]?.x || 0},${chartHeight - paddingY} L ${chartPoints[0]?.x || 0},${chartHeight - paddingY} Z`;
  const investedArea = `${investedPath} L ${chartPoints[chartPoints.length - 1]?.x || 0},${chartHeight - paddingY} L ${chartPoints[0]?.x || 0},${chartHeight - paddingY} Z`;

  const displayedSchedule = showAllYears ? schedule : schedule.slice(0, 10);

  return (
    <ToolLayout
      title="SIP Calculator: Mutual Fund Wealth Compounding"
      intro="Estimate the future maturity value of your monthly Systematic Investment Plan (SIP) in Indian mutual funds. Visualise wealth creation through compounding, tax liabilities under Section 112A, and year-by-year cash flows."
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
        { label: "SIP Calculator" },
      ]}
    >
      <div className="space-y-10">
        {/* Top Control Bar: Share & Embed */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200 text-xs font-mono-data">
          <div className="flex items-center gap-2 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Interactive Simulator</span>
            <span className="text-stone-300">|</span>
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
              <span className="font-mono-data font-semibold text-stone-300">Embed this SIP Calculator in Blogger / HTML Site</span>
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

        {/* Main Grid: Inputs Column & Summary/Chart Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Inputs (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <h2 className="text-sm font-mono-data uppercase tracking-wider font-semibold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Investment Parameters</span>
              <span className="text-[11px] font-normal text-stone-500">₹ Indian Format</span>
            </h2>

            {/* Input 1: Monthly SIP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="sip-monthly-amount" className="text-xs font-semibold text-stone-800">Monthly Investment (₹)</label>
                <span className="text-xs font-mono-data font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {formatIndianWords(monthlySip)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono-data text-sm">₹</span>
                <input
                  id="sip-monthly-amount"
                  type="number"
                  min="500"
                  max="1000000"
                  step="500"
                  value={monthlySip}
                  onChange={(e) => setMonthlySip(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <input
                aria-label="Monthly investment slider"
                type="range"
                min="500"
                max="200000"
                step="500"
                value={Math.min(monthlySip, 200000)}
                onChange={(e) => setMonthlySip(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] font-mono-data text-stone-400">
                <span>₹500</span>
                <span>₹50,000</span>
                <span>₹1 Lakh</span>
                <span>₹2 Lakh+</span>
              </div>
            </div>

            {/* Input 2: Expected Return */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="sip-expected-return" className="text-xs font-semibold text-stone-800">Expected Annual Return (% p.a.)</label>
                <span className="text-xs font-mono-data font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                  {annualReturn}% p.a.
                </span>
              </div>
              <div className="relative">
                <input
                  id="sip-expected-return"
                  type="number"
                  min="1"
                  max="30"
                  step="0.1"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-mono-data text-sm">%</span>
              </div>
              <input
                aria-label="Expected annual return percentage slider"
                type="range"
                min="6"
                max="20"
                step="0.5"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] font-mono-data text-stone-400">
                <span>6% (Conservative)</span>
                <span>12% (Balanced)</span>
                <span>15%+ (Aggressive)</span>
              </div>
            </div>

            {/* Input 3: Investment Horizon */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="sip-tenure-years" className="text-xs font-semibold text-stone-800">Investment Horizon (Years)</label>
                <span className="text-xs font-mono-data font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                  {years} Years ({years * 12} Installments)
                </span>
              </div>
              <div className="relative">
                <input
                  id="sip-tenure-years"
                  type="number"
                  min="1"
                  max="40"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Math.min(40, parseInt(e.target.value, 10) || 1)))}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-mono-data text-sm">Yrs</span>
              </div>
              <input
                aria-label="Investment tenure slider in years"
                type="range"
                min="1"
                max="35"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] font-mono-data text-stone-400">
                <span>1 Yr</span>
                <span>10 Yrs</span>
                <span>20 Yrs</span>
                <span>35 Yrs</span>
              </div>
            </div>

            {/* Editable Tax Rates Section */}
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => setShowTaxDrawer(!showTaxDrawer)}
                className="w-full flex items-center justify-between text-xs font-mono-data font-semibold text-stone-800 py-2 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tax Assumptions (Editable Inputs)</span>
                </span>
                {showTaxDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTaxDrawer && (
                <div className="mt-3 p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-4 text-xs font-sans">
                  <div className="flex items-center justify-between text-[11px] font-mono-data text-amber-900 font-semibold border-b border-amber-200/60 pb-2">
                    <span>Tax Slabs & Limits</span>
                    <span className="bg-amber-100 px-2 py-0.5 rounded text-amber-800">As on October 2026</span>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="sip-ltcg-rate" className="font-semibold text-stone-800">LTCG Tax Rate (%):</label>
                    <input
                      id="sip-ltcg-rate"
                      type="number"
                      step="0.5"
                      value={ltcgRate}
                      onChange={(e) => setLtcgRate(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono-data text-xs"
                    />
                    <p className="text-[10px] text-stone-500">Finance Act 2024 revised equity LTCG from 10% to 12.5%.</p>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="sip-ltcg-exemption" className="font-semibold text-stone-800">Annual Exemption Threshold (₹):</label>
                    <input
                      id="sip-ltcg-exemption"
                      type="number"
                      step="5000"
                      value={exemptionThreshold}
                      onChange={(e) => setExemptionThreshold(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono-data text-xs"
                    />
                    <p className="text-[10px] text-stone-500">Exemption increased from ₹1 Lakh to ₹1.25 Lakh per financial year.</p>
                  </div>

                  {/* Mandatory Statutory Note */}
                  <div className="p-2.5 rounded bg-white border border-amber-200 text-[10px] text-stone-600 leading-normal">
                    <strong className="text-stone-800">Statutory Notice:</strong> Defaults may change. Verify on the Income Tax Department or SEBI/AMFI websites. Tax calculation assumes full redemption in a single financial year and is an approximation.
                  </div>
                </div>
              )}
            </div>

            {/* Illustrative Disclaimer Note */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Return assumptions are illustrative, not guaranteed. Mutual fund returns fluctuate with underlying market valuations.
              </span>
            </div>
          </div>

          {/* Right Column: Key Results, Chart, and Breakdown (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 4 Summary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-stone-500">Invested Capital</span>
                <div className="font-mono-data text-base sm:text-lg font-bold text-stone-900">{formatINR(totalInvested)}</div>
                <div className="text-[11px] text-stone-500 font-sans">{formatIndianWords(totalInvested)}</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-emerald-800">Wealth Gain (Est.)</span>
                <div className="font-mono-data text-base sm:text-lg font-bold text-emerald-900">+{formatINR(totalGains)}</div>
                <div className="text-[11px] text-emerald-700 font-sans">{formatIndianWords(totalGains)}</div>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 text-white shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-stone-400">Pre-Tax Corpus</span>
                <div className="font-mono-data text-base sm:text-lg font-bold text-emerald-400">{formatINR(futureValue)}</div>
                <div className="text-[11px] text-stone-300 font-sans">{formatIndianWords(futureValue)}</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-stone-500">Post-Tax (Est.)</span>
                <div className="font-mono-data text-base sm:text-lg font-bold text-stone-800">{formatINR(taxData.postTaxCorpus)}</div>
                <div className="text-[11px] text-stone-500 font-sans">Tax: {formatINR(taxData.estimatedTax)}</div>
              </div>
            </div>

            {/* Growth Chart */}
            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-mono-data uppercase tracking-wider font-semibold text-stone-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Compounding Growth Trajectory</span>
                  </h3>
                  <p className="text-xs text-stone-500">Comparing total principal invested vs compounded mutual fund value over {years} years.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono-data">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-stone-700">Total Value</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span>
                    <span className="text-stone-700">Invested Capital</span>
                  </span>
                </div>
              </div>

              {/* Inline SVG Chart */}
              <div className="w-full overflow-hidden">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none overflow-visible">
                  <defs>
                    <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#78716c" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#78716c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const y = chartHeight - paddingY - pct * innerHeight;
                    const val = maxVal * pct;
                    return (
                      <g key={idx}>
                        <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#f0eee6" strokeDasharray="3 3" />
                        <text x={paddingX - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#a8a29e" fontFamily="monospace">
                          {formatCompactINR(val)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Areas */}
                  <path d={valueArea} fill="url(#valueGrad)" />
                  <path d={investedArea} fill="url(#investedGrad)" />

                  {/* Line strokes */}
                  <path d={investedPath} fill="none" stroke="#78716c" strokeWidth="2" strokeDasharray="4 4" />
                  <path d={valuePath} fill="none" stroke="#059669" strokeWidth="2.5" />

                  {/* Hover or milestone dots */}
                  {chartPoints.map((pt) => (
                    <g key={pt.year}>
                      <circle
                        cx={pt.x}
                        cy={pt.yValue}
                        r={hoveredYear === pt.year ? 5 : 3}
                        fill="#059669"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredYear(pt.year)}
                        onMouseLeave={() => setHoveredYear(null)}
                      />
                      {/* X axis labels for first, middle, last */}
                      {(pt.year === 1 || pt.year === Math.round(years / 2) || pt.year === years) && (
                        <text x={pt.x} y={chartHeight - 6} textAnchor="middle" fontSize="10" fill="#78716c" fontFamily="monospace">
                          Yr {pt.year}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>

              {/* Hover tooltip card */}
              {hoveredYear !== null && (
                <div className="p-3 bg-stone-900 text-stone-100 rounded-xl text-xs font-mono-data flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-emerald-400 font-semibold">Year {hoveredYear}:</span> Closing Corpus:{" "}
                    <strong className="text-white">{formatINR(schedule[hoveredYear - 1]?.closingBalance || 0)}</strong>
                  </div>
                  <div>
                    Invested so far: <span className="text-stone-300">{formatINR(schedule[hoveredYear - 1]?.totalInvested || 0)}</span>
                  </div>
                  <div>
                    Wealth Gains:{" "}
                    <span className="text-emerald-300">
                      {formatINR((schedule[hoveredYear - 1]?.closingBalance || 0) - (schedule[hoveredYear - 1]?.totalInvested || 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Ratio Breakdown bar */}
            <div className="p-4 bg-white rounded-xl border border-stone-200 text-xs space-y-2">
              <div className="flex justify-between font-mono-data text-stone-600">
                <span>Principal Invested ({futureValue > 0 ? ((totalInvested / futureValue) * 100).toFixed(1) : 0}%)</span>
                <span>Compounded Returns ({futureValue > 0 ? ((totalGains / futureValue) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${futureValue > 0 ? (totalInvested / futureValue) * 100 : 50}%` }}
                  className="bg-stone-400 h-full transition-all duration-300"
                />
                <div
                  style={{ width: `${futureValue > 0 ? (totalGains / futureValue) * 100 : 50}%` }}
                  className="bg-emerald-600 h-full transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Year-by-Year Amortization Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/60">
            <div>
              <h3 className="text-sm font-mono-data uppercase tracking-wider font-semibold text-stone-900">
                Year-by-Year Compounding Schedule
              </h3>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Detailed progression of annual contributions, yearly interest earned, and closing balances in ₹ INR.
              </p>
            </div>
            {schedule.length > 10 && (
              <button
                onClick={() => setShowAllYears(!showAllYears)}
                className="text-xs font-mono-data text-emerald-800 hover:text-emerald-950 font-medium underline cursor-pointer"
              >
                {showAllYears ? "Show First 10 Years Only" : `View All ${schedule.length} Years`}
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-data border-collapse">
              <thead>
                <tr className="bg-stone-100/80 text-stone-700 border-b border-stone-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Year</th>
                  <th className="py-3 px-4 font-semibold">Opening Balance</th>
                  <th className="py-3 px-4 font-semibold">Annual Deposit</th>
                  <th className="py-3 px-4 font-semibold">Total Invested</th>
                  <th className="py-3 px-4 font-semibold">Returns Earned (Yr)</th>
                  <th className="py-3 px-4 font-semibold text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {displayedSchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-900">Year {row.year}</td>
                    <td className="py-3 px-4 text-stone-600">{formatINR(row.openingBalance)}</td>
                    <td className="py-3 px-4 text-stone-600">{formatINR(row.annualInvested)}</td>
                    <td className="py-3 px-4 text-stone-800 font-medium">{formatINR(row.totalInvested)}</td>
                    <td className="py-3 px-4 text-emerald-700 font-medium">+{formatINR(row.returnsEarned)}</td>
                    <td className="py-3 px-4 text-right font-bold text-stone-950">{formatINR(row.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {schedule.length > 10 && !showAllYears && (
            <div className="p-3 text-center bg-stone-50 border-t border-stone-200 text-xs font-mono-data">
              <button
                onClick={() => setShowAllYears(true)}
                className="text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer underline"
              >
                + View remaining {schedule.length - 10} years
              </button>
            </div>
          )}
        </div>

        {/* Educational Explainer: How this is calculated */}
        <div className="p-6 sm:p-8 bg-[#fdfcf9] rounded-2xl border border-stone-200 space-y-4">
          <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-stone-950">
            How This SIP Calculation Works
          </h3>
          <div className="text-stone-700 text-xs sm:text-sm leading-relaxed space-y-3 font-sans">
            <p>
              A Systematic Investment Plan (SIP) works on the principle of regular periodic investments and rupee-cost averaging. Because contributions are made monthly, the compound interest formula accounts for every individual installment compounding over its respective remaining tenure:
            </p>

            <div className="p-4 bg-white rounded-xl border border-stone-200 font-mono-data text-xs sm:text-sm text-stone-900 overflow-x-auto">
              <strong>M = P × [((1 + i)^n - 1) / i] × (1 + i)</strong>
            </div>

            <ul className="list-disc pl-5 space-y-1.5 text-stone-600 text-xs">
              <li><strong>M:</strong> Final maturity amount accumulated at the end of the investment horizon.</li>
              <li><strong>P:</strong> Fixed monthly installment deposit (e.g. {formatINR(monthlySip)}).</li>
              <li><strong>i:</strong> Periodic interest rate per month, calculated as <code>annual_rate / 12 / 100</code> (e.g., {annualReturn}% ÷ 12 = {(annualReturn / 12).toFixed(3)}% per month).</li>
              <li><strong>n:</strong> Total number of monthly installments over the tenure (e.g., {years} years × 12 = {years * 12} months).</li>
            </ul>

            <p>
              <strong>Taxation Rules Under Section 112A:</strong> For equity-oriented mutual funds held for more than 12 months, Long-Term Capital Gains (LTCG) above ₹1.25 Lakh in a financial year are taxed at 12.5% (as revised in Finance Act 2024). STCG (held ≤12 months) is taxed at 20%. Note: Surcharge and Health & Education Cess (4%) may apply depending on individual tax brackets.
            </p>
          </div>
        </div>

        {/* Related Educational Calculators Navigation */}
        <div className="pt-4 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <span className="font-mono-data uppercase tracking-wider text-xs font-semibold text-stone-700">
              Other Quantitative Tools in This Suite
            </span>
            <button
              onClick={onNavigateCalculators}
              className="text-xs font-mono-data text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer flex items-center gap-1"
            >
              <span>View All 7 Calculators</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/calculators/step-up-sip"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", "/calculators/step-up-sip");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className="p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition-all group block"
            >
              <div className="text-[10px] font-mono-data text-emerald-700 uppercase font-semibold">Compounding Boost</div>
              <div className="font-semibold text-stone-900 text-sm group-hover:text-emerald-800">Step-Up SIP Calculator</div>
              <p className="text-stone-500 text-xs mt-1">See how increasing your SIP by 10% each year expands your wealth.</p>
            </a>

            <a
              href="/calculators/lumpsum"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", "/calculators/lumpsum");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className="p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition-all group block"
            >
              <div className="text-[10px] font-mono-data text-emerald-700 uppercase font-semibold">One-Time Growth</div>
              <div className="font-semibold text-stone-900 text-sm group-hover:text-emerald-800">Lumpsum Calculator</div>
              <p className="text-stone-500 text-xs mt-1">Simulate multi-year exponential growth of a single one-time deposit.</p>
            </a>

            <a
              href="/calculators/direct-vs-regular"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", "/calculators/direct-vs-regular");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className="p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition-all group block"
            >
              <div className="text-[10px] font-mono-data text-emerald-700 uppercase font-semibold">Expense Ratio Drag</div>
              <div className="font-semibold text-stone-900 text-sm group-hover:text-emerald-800">Direct vs Regular Calculator</div>
              <p className="text-stone-500 text-xs mt-1">Quantify the wealth lost to distributor commission fees over time.</p>
            </a>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
