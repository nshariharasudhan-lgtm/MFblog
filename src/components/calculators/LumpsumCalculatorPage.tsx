import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Share2,
  Check,
  Info,
  ArrowRight,
  Code2,
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
  calculateLumpsumSchedule,
  estimateLtcgTax,
} from "./calculatorUtils";

interface LumpsumCalculatorPageProps {
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

export function LumpsumCalculatorPage({
  settings,
  onNavigateHome,
  onNavigateCalculators,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onSelectCategory,
  onSearchChange,
  searchQuery,
}: LumpsumCalculatorPageProps) {
  // Read initial query parameters from URL
  const [principal, setPrincipal] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("amount") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 100000; // ₹1 Lakh default
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
    return 10;
  });

  // Editable Tax Rates & Thresholds
  const [ltcgRate, setLtcgRate] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("ltcgRate") || "");
      if (!isNaN(val) && val >= 0) return val;
    }
    return 12.5;
  });

  const [exemptionThreshold, setExemptionThreshold] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("exemption") || "");
      if (!isNaN(val) && val >= 0) return val;
    }
    return 125000;
  });

  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [showTaxDrawer, setShowTaxDrawer] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("amount", principal.toString());
    params.set("rate", annualReturn.toString());
    params.set("years", years.toString());
    if (ltcgRate !== 12.5) params.set("ltcgRate", ltcgRate.toString());
    if (exemptionThreshold !== 125000) params.set("exemption", exemptionThreshold.toString());

    const newRelativePathQuery = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newRelativePathQuery);
  }, [principal, annualReturn, years, ltcgRate, exemptionThreshold]);

  // Compute Lumpsum schedule
  const { schedule, totalInvested, futureValue, totalGains } = useMemo(() => {
    return calculateLumpsumSchedule(principal, annualReturn, years);
  }, [principal, annualReturn, years]);

  // Compute Tax Estimate
  const taxData = useMemo(() => {
    return estimateLtcgTax(futureValue, totalInvested, ltcgRate, exemptionThreshold);
  }, [futureValue, totalInvested, ltcgRate, exemptionThreshold]);

  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2200);
  };

  const embedSnippet = `<iframe src="https://www.yieldnest.online/lumpsum-calculator.html" width="100%" height="700" frameborder="0" style="border-radius:12px;border:1px solid #e5e3dc;"></iframe>`;

  // Inject WebApplication JSON-LD into DOM
  useEffect(() => {
    const scriptId = "lumpsum-calculator-jsonld";
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
          "@id": "https://www.yieldnest.online/calculators/lumpsum#app",
          "name": "Mutual Fund Lumpsum (One-Time) Compounding Calculator",
          "url": "https://www.yieldnest.online/calculators/lumpsum",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript",
          "description": "Calculate multi-year compounded future value and capital gains tax on one-time lumpsum mutual fund investments in India.",
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
          "@id": "https://www.yieldnest.online/calculators/lumpsum#breadcrumb",
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
              "name": "Lumpsum Calculator",
              "item": "https://www.yieldnest.online/calculators/lumpsum",
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
    const yInvested = chartHeight - paddingY - (principal / maxVal) * innerHeight;
    return { ...row, x, yValue, yInvested };
  });

  const valuePath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yValue}`, "");
  const valueArea = `${valuePath} L ${chartPoints[chartPoints.length - 1]?.x || 0},${chartHeight - paddingY} L ${chartPoints[0]?.x || 0},${chartHeight - paddingY} Z`;

  const displayedSchedule = showAllYears ? schedule : schedule.slice(0, 10);
  const multiplier = principal > 0 ? (futureValue / principal).toFixed(2) : "1.00";

  return (
    <ToolLayout
      title="Lumpsum Calculator: One-Time Mutual Fund Compounding"
      intro="Simulate the exponential growth of a one-time lump-sum mutual fund investment over your planned holding period. Calculate maturity corpus, wealth multiplication, and post-tax net gains."
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
        { label: "Lumpsum Calculator" },
      ]}
    >
      <div className="space-y-10">
        {/* Top Control Bar: Share & Embed */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200 text-xs font-mono-data">
          <div className="flex items-center gap-2 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>One-Time Investment Simulator</span>
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
              <span className="font-mono-data font-semibold text-stone-300">Embed Lumpsum Calculator</span>
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

            {/* Input 1: Total One-time Investment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="lumpsum-deposit-amount" className="text-xs font-semibold text-stone-800">Total One-Time Deposit (₹)</label>
                <span className="text-xs font-mono-data font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {formatIndianWords(principal)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono-data text-sm">₹</span>
                <input
                  id="lumpsum-deposit-amount"
                  type="number"
                  min="5000"
                  max="10000000"
                  step="5000"
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <input
                aria-label="Total one-time deposit slider"
                type="range"
                min="5000"
                max="1000000"
                step="5000"
                value={Math.min(principal, 1000000)}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] font-mono-data text-stone-400">
                <span>₹5,000</span>
                <span>₹2.5 Lakh</span>
                <span>₹5 Lakh</span>
                <span>₹10 Lakh+</span>
              </div>
            </div>

            {/* Input 2: Expected Return */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="lumpsum-expected-return" className="text-xs font-semibold text-stone-800">Expected Annual Return (% p.a.)</label>
                <span className="text-xs font-mono-data font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                  {annualReturn}% p.a.
                </span>
              </div>
              <div className="relative">
                <input
                  id="lumpsum-expected-return"
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
            </div>

            {/* Input 3: Investment Horizon */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="lumpsum-tenure-years" className="text-xs font-semibold text-stone-800">Holding Period (Years)</label>
                <span className="text-xs font-mono-data font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                  {years} Years
                </span>
              </div>
              <div className="relative">
                <input
                  id="lumpsum-tenure-years"
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
                aria-label="Holding period slider in years"
                type="range"
                min="1"
                max="30"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
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
                    <label htmlFor="lumpsum-ltcg-rate" className="font-semibold text-stone-800">LTCG Tax Rate (%):</label>
                    <input
                      id="lumpsum-ltcg-rate"
                      type="number"
                      step="0.5"
                      value={ltcgRate}
                      onChange={(e) => setLtcgRate(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono-data text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="lumpsum-ltcg-exemption" className="font-semibold text-stone-800">Annual Exemption Threshold (₹):</label>
                    <input
                      id="lumpsum-ltcg-exemption"
                      type="number"
                      step="5000"
                      value={exemptionThreshold}
                      onChange={(e) => setExemptionThreshold(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono-data text-xs"
                    />
                  </div>

                  <div className="p-2.5 rounded bg-white border border-amber-200 text-[10px] text-stone-600 leading-normal">
                    <strong className="text-stone-800">Statutory Notice:</strong> Defaults may change. Verify on the Income Tax Department or SEBI/AMFI websites.
                  </div>
                </div>
              )}
            </div>

            {/* Illustrative Disclaimer Note */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Return assumptions are illustrative, not guaranteed.
              </span>
            </div>
          </div>

          {/* Right Column: Key Results, Chart, and Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            {/* 4 Summary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-stone-500">Initial Deposit</span>
                <div className="font-mono-data text-base sm:text-lg font-bold text-stone-900">{formatINR(principal)}</div>
                <div className="text-[11px] text-stone-500 font-sans">{formatIndianWords(principal)}</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-emerald-800">Wealth Gain (Est.)</span>
                <div className="font-mono-data text-base sm:text-lg font-bold text-emerald-900">+{formatINR(totalGains)}</div>
                <div className="text-[11px] text-emerald-700 font-sans">{formatIndianWords(totalGains)}</div>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 text-white shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-stone-400">Total Maturity</span>
                <div className="font-mono-data text-base sm:text-lg font-bold text-emerald-400">{formatINR(futureValue)}</div>
                <div className="text-[11px] text-stone-300 font-sans">{multiplier}x Multiplier</div>
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
                    <span>Lumpsum Compounding Trajectory</span>
                  </h3>
                  <p className="text-xs text-stone-500">Compounded value growth of one-time deposit over {years} years.</p>
                </div>
              </div>

              {/* Inline SVG Chart */}
              <div className="w-full overflow-hidden">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none overflow-visible">
                  <defs>
                    <linearGradient id="lumpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
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

                  <path d={valueArea} fill="url(#lumpGrad)" />
                  {/* Baseline principal horizontal line */}
                  <line
                    x1={paddingX}
                    y1={chartHeight - paddingY - (principal / maxVal) * innerHeight}
                    x2={chartWidth - paddingX}
                    y2={chartHeight - paddingY - (principal / maxVal) * innerHeight}
                    stroke="#78716c"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <path d={valuePath} fill="none" stroke="#059669" strokeWidth="2.5" />

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
                      {(pt.year === 1 || pt.year === Math.round(years / 2) || pt.year === years) && (
                        <text x={pt.x} y={chartHeight - 6} textAnchor="middle" fontSize="10" fill="#78716c" fontFamily="monospace">
                          Yr {pt.year}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>

              {hoveredYear !== null && (
                <div className="p-3 bg-stone-900 text-stone-100 rounded-xl text-xs font-mono-data flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-emerald-400 font-semibold">Year {hoveredYear}:</span> Value:{" "}
                    <strong className="text-white">{formatINR(schedule[hoveredYear - 1]?.closingBalance || 0)}</strong>
                  </div>
                  <div>
                    Growth in Year: <span className="text-emerald-300">+{formatINR(schedule[hoveredYear - 1]?.growthInYear || 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Year-by-Year Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/60">
            <div>
              <h3 className="text-sm font-mono-data uppercase tracking-wider font-semibold text-stone-900">
                Year-by-Year Compounding Amortization
              </h3>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Displays opening balance, annual growth, cumulative returns, and year-end valuation in ₹ INR.
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
                  <th className="py-3 px-4 font-semibold">Growth in Year</th>
                  <th className="py-3 px-4 font-semibold">Cumulative Gains</th>
                  <th className="py-3 px-4 font-semibold text-right">Closing Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {displayedSchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-900">Year {row.year}</td>
                    <td className="py-3 px-4 text-stone-600">{formatINR(row.openingBalance)}</td>
                    <td className="py-3 px-4 text-emerald-700 font-medium">+{formatINR(row.growthInYear)}</td>
                    <td className="py-3 px-4 text-stone-800">{formatINR(row.cumulativeGains)}</td>
                    <td className="py-3 px-4 text-right font-bold text-stone-950">{formatINR(row.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Educational Explainer */}
        <div className="p-6 sm:p-8 bg-[#fdfcf9] rounded-2xl border border-stone-200 space-y-4">
          <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-stone-950">
            How Lumpsum Compounding is Calculated
          </h3>
          <div className="text-stone-700 text-xs sm:text-sm leading-relaxed space-y-3 font-sans">
            <p>
              In a one-time lump-sum mutual fund investment, the entire principal starts compounding from Day 1. The compounded future value formula is:
            </p>
            <div className="p-4 bg-white rounded-xl border border-stone-200 font-mono-data text-xs sm:text-sm text-stone-900">
              A = P × (1 + r / n)^(n × t)
            </div>
            <p>
              Where <code>P</code> is the principal ({formatINR(principal)}), <code>r</code> is the annual return ({annualReturn}%), <code>n</code> is compounding frequency (monthly, 12 times a year), and <code>t</code> is time in years ({years} years).
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
