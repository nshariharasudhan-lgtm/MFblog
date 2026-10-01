import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Share2,
  Check,
  Info,
  Layers,
  ArrowRight,
  Code2,
  Coins,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { ToolLayout } from "../ToolLayout";
import { SiteSettings, ArticleCategory } from "../../types";
import {
  formatINR,
  formatIndianWords,
  formatCompactINR,
  calculateStepUpSipSchedule,
  estimateLtcgTax,
} from "./calculatorUtils";

interface StepUpSipCalculatorPageProps {
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

export function StepUpSipCalculatorPage({
  settings,
  onNavigateHome,
  onNavigateCalculators,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onSelectCategory,
  onSearchChange,
  searchQuery,
}: StepUpSipCalculatorPageProps) {
  // Read initial query parameters from URL
  const [initialSip, setInitialSip] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("amount") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 10000;
  });

  const [stepUpPct, setStepUpPct] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("stepUp") || "");
      if (!isNaN(val) && val >= 0) return val;
    }
    return 10; // 10% annual increase
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
    params.set("amount", initialSip.toString());
    params.set("stepUp", stepUpPct.toString());
    params.set("rate", annualReturn.toString());
    params.set("years", years.toString());
    if (ltcgRate !== 12.5) params.set("ltcgRate", ltcgRate.toString());
    if (exemptionThreshold !== 125000) params.set("exemption", exemptionThreshold.toString());

    const newRelativePathQuery = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newRelativePathQuery);
  }, [initialSip, stepUpPct, annualReturn, years, ltcgRate, exemptionThreshold]);

  // Compute Step-Up SIP schedule & comparison data
  const {
    schedule,
    stepUpInvested,
    stepUpFV,
    stepUpGains,
    normalInvested,
    normalFV,
    extraWealth,
  } = useMemo(() => {
    return calculateStepUpSipSchedule(initialSip, stepUpPct, annualReturn, years);
  }, [initialSip, stepUpPct, annualReturn, years]);

  // Compute Tax Estimate for Step-Up SIP
  const taxData = useMemo(() => {
    return estimateLtcgTax(stepUpFV, stepUpInvested, ltcgRate, exemptionThreshold);
  }, [stepUpFV, stepUpInvested, ltcgRate, exemptionThreshold]);

  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2200);
  };

  const embedSnippet = `<iframe src="https://www.yieldnest.online/step-up-sip-calculator.html" width="100%" height="700" frameborder="0" style="border-radius:12px;border:1px solid #e5e3dc;"></iframe>`;

  // Inject WebApplication JSON-LD into DOM
  useEffect(() => {
    const scriptId = "stepup-calculator-jsonld";
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
          "@id": "https://www.yieldnest.online/calculators/step-up-sip#app",
          "name": "Step-Up SIP (Top-Up) Mutual Fund Compounding Calculator",
          "url": "https://www.yieldnest.online/calculators/step-up-sip",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript",
          "description": "Calculate extra wealth created by increasing your monthly mutual fund SIP annually by 5% to 25% in India with side-by-side comparative table.",
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
          "@id": "https://www.yieldnest.online/calculators/step-up-sip#breadcrumb",
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
              "name": "Step-Up SIP Calculator",
              "item": "https://www.yieldnest.online/calculators/step-up-sip",
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

  const maxVal = Math.max(stepUpFV, normalFV, 1000);
  const chartPoints = schedule.map((row, idx) => {
    const x = paddingX + (idx / Math.max(1, schedule.length - 1)) * innerWidth;
    const yStepUp = chartHeight - paddingY - (row.closingBalance / maxVal) * innerHeight;
    const yNormal = chartHeight - paddingY - (row.normalBalance / maxVal) * innerHeight;
    const yInvested = chartHeight - paddingY - (row.totalInvested / maxVal) * innerHeight;
    return { ...row, x, yStepUp, yNormal, yInvested };
  });

  const stepUpPath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yStepUp}`, "");
  const normalPath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yNormal}`, "");
  const investedPath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yInvested}`, "");

  const stepUpArea = `${stepUpPath} L ${chartPoints[chartPoints.length - 1]?.x || 0},${chartHeight - paddingY} L ${chartPoints[0]?.x || 0},${chartHeight - paddingY} Z`;

  const displayedSchedule = showAllYears ? schedule : schedule.slice(0, 10);

  return (
    <ToolLayout
      title="Step-Up SIP Calculator: Annual Top-Up Compounding"
      intro="Simulate how stepping up your monthly mutual fund SIP in line with your annual salary increments boosts your final wealth corpus compared to a static fixed SIP."
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
        { label: "Step-Up SIP Calculator" },
      ]}
    >
      <div className="space-y-10">
        {/* Top Control Bar: Share & Embed */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200 text-xs font-mono-data">
          <div className="flex items-center gap-2 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Step-Up Top-Up Engine</span>
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
              <span className="font-mono-data font-semibold text-stone-300">Embed Step-Up SIP Tool</span>
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
              <span>Step-Up Configuration</span>
              <span className="text-[11px] font-normal text-stone-500">₹ Indian Format</span>
            </h2>

            {/* Input 1: Initial Monthly SIP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="stepup-initial-amount" className="text-xs font-semibold text-stone-800">Starting Monthly SIP (₹)</label>
                <span className="text-xs font-mono-data font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {formatIndianWords(initialSip)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono-data text-sm">₹</span>
                <input
                  id="stepup-initial-amount"
                  type="number"
                  min="500"
                  max="1000000"
                  step="500"
                  value={initialSip}
                  onChange={(e) => setInitialSip(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <input
                aria-label="Starting monthly SIP slider"
                type="range"
                min="1000"
                max="100000"
                step="500"
                value={Math.min(initialSip, 100000)}
                onChange={(e) => setInitialSip(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Input 2: Annual Step-Up Percentage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="stepup-percentage" className="text-xs font-semibold text-stone-800">Annual Step-Up (% each year)</label>
                <span className="text-xs font-mono-data font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                  +{stepUpPct}% / yr
                </span>
              </div>
              <div className="relative">
                <input
                  id="stepup-percentage"
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={stepUpPct}
                  onChange={(e) => setStepUpPct(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-mono-data text-sm">%</span>
              </div>
              <input
                aria-label="Annual step-up percentage slider"
                type="range"
                min="2"
                max="30"
                step="1"
                value={stepUpPct}
                onChange={(e) => setStepUpPct(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] font-mono-data text-stone-400">
                <span>5% (Modest)</span>
                <span>10% (Recommended)</span>
                <span>20%+ (High)</span>
              </div>
            </div>

            {/* Input 3: Expected Return */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="stepup-expected-return" className="text-xs font-semibold text-stone-800">Expected Annual Return (% p.a.)</label>
                <span className="text-xs font-mono-data font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                  {annualReturn}% p.a.
                </span>
              </div>
              <div className="relative">
                <input
                  id="stepup-expected-return"
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

            {/* Input 4: Investment Horizon */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="stepup-tenure-years" className="text-xs font-semibold text-stone-800">Investment Horizon (Years)</label>
                <span className="text-xs font-mono-data font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                  {years} Years
                </span>
              </div>
              <div className="relative">
                <input
                  id="stepup-tenure-years"
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
                min="2"
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
                    <label htmlFor="stepup-ltcg-rate" className="font-semibold text-stone-800">LTCG Tax Rate (%):</label>
                    <input
                      id="stepup-ltcg-rate"
                      type="number"
                      step="0.5"
                      value={ltcgRate}
                      onChange={(e) => setLtcgRate(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono-data text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="stepup-ltcg-exemption" className="font-semibold text-stone-800">Annual Exemption Threshold (₹):</label>
                    <input
                      id="stepup-ltcg-exemption"
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

          {/* Right Column: Comparative Cards, Chart, and Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step-Up vs Normal Comparison Hero Card */}
            <div className="p-5 sm:p-6 bg-emerald-950 text-white rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono-data text-emerald-400 font-semibold">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Extra Wealth Generated via Step-Up</span>
                </span>
                <span className="text-[11px] font-mono-data text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded">
                  +{stepUpPct}% Annual Top-Up
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="text-3xl sm:text-4xl font-mono-data font-bold text-white tracking-tight">
                    +{formatINR(extraWealth)}
                  </div>
                  <div className="text-xs text-emerald-200 font-sans mt-0.5">
                    {formatIndianWords(extraWealth)} additional corpus over normal static SIP
                  </div>
                </div>
                <div className="text-right sm:text-left">
                  <div className="text-xs font-mono-data text-emerald-400">Step-Up Maturity Value:</div>
                  <div className="text-lg font-mono-data font-bold text-emerald-300">{formatINR(stepUpFV)}</div>
                </div>
              </div>
            </div>

            {/* 4 Comparative Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-stone-500">Step-Up Invested</span>
                <div className="font-mono-data text-sm sm:text-base font-bold text-stone-900">{formatINR(stepUpInvested)}</div>
                <div className="text-[11px] text-stone-500 font-sans">{formatIndianWords(stepUpInvested)}</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-stone-500">Normal Invested</span>
                <div className="font-mono-data text-sm sm:text-base font-bold text-stone-600">{formatINR(normalInvested)}</div>
                <div className="text-[11px] text-stone-400 font-sans">{formatIndianWords(normalInvested)}</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-stone-500">Normal Corpus</span>
                <div className="font-mono-data text-sm sm:text-base font-bold text-stone-700">{formatINR(normalFV)}</div>
                <div className="text-[11px] text-stone-400 font-sans">{formatIndianWords(normalFV)}</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-stone-500">Post-Tax (Est.)</span>
                <div className="font-mono-data text-sm sm:text-base font-bold text-emerald-800">{formatINR(taxData.postTaxCorpus)}</div>
                <div className="text-[11px] text-stone-500 font-sans">Tax: {formatINR(taxData.estimatedTax)}</div>
              </div>
            </div>

            {/* Growth Comparison Chart */}
            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-mono-data uppercase tracking-wider font-semibold text-stone-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Step-Up SIP vs Normal Fixed SIP</span>
                  </h3>
                  <p className="text-xs text-stone-500">Divergence of wealth accumulation as annual top-ups compound over {years} years.</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono-data">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="text-stone-700">Step-Up SIP</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span>
                    <span className="text-stone-700">Normal SIP</span>
                  </span>
                </div>
              </div>

              {/* Inline SVG Chart */}
              <div className="w-full overflow-hidden">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none overflow-visible">
                  <defs>
                    <linearGradient id="stepUpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.01" />
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

                  <path d={stepUpArea} fill="url(#stepUpGrad)" />
                  <path d={investedPath} fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d={normalPath} fill="none" stroke="#78716c" strokeWidth="2" strokeDasharray="5 5" />
                  <path d={stepUpPath} fill="none" stroke="#059669" strokeWidth="2.5" />

                  {chartPoints.map((pt) => (
                    <g key={pt.year}>
                      <circle
                        cx={pt.x}
                        cy={pt.yStepUp}
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
                    <span className="text-emerald-400 font-semibold">Year {hoveredYear}:</span> Step-Up:{" "}
                    <strong className="text-white">{formatINR(schedule[hoveredYear - 1]?.closingBalance || 0)}</strong>
                  </div>
                  <div>
                    Normal SIP: <span className="text-stone-300">{formatINR(schedule[hoveredYear - 1]?.normalBalance || 0)}</span>
                  </div>
                  <div>
                    Difference:{" "}
                    <span className="text-emerald-300 font-bold">
                      +{formatINR(schedule[hoveredYear - 1]?.additionalWealth || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Year-by-Year Amortization Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/60">
            <div>
              <h3 className="text-sm font-mono-data uppercase tracking-wider font-semibold text-stone-900">
                Annual Progression & Monthly SIP Schedule
              </h3>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Displays the stepped-up monthly installment amount for each year and compares resulting balances.
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
                  <th className="py-3 px-4 font-semibold">Monthly SIP (₹)</th>
                  <th className="py-3 px-4 font-semibold">Annual Deposit</th>
                  <th className="py-3 px-4 font-semibold">Step-Up Invested</th>
                  <th className="py-3 px-4 font-semibold">Step-Up Balance</th>
                  <th className="py-3 px-4 font-semibold">Normal Balance</th>
                  <th className="py-3 px-4 font-semibold text-right">Extra Wealth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {displayedSchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-900">Year {row.year}</td>
                    <td className="py-3 px-4 text-emerald-800 font-semibold">{formatINR(row.monthlyAmount)}</td>
                    <td className="py-3 px-4 text-stone-600">{formatINR(row.annualInvested)}</td>
                    <td className="py-3 px-4 text-stone-800 font-medium">{formatINR(row.totalInvested)}</td>
                    <td className="py-3 px-4 text-stone-900 font-bold">{formatINR(row.closingBalance)}</td>
                    <td className="py-3 px-4 text-stone-500">{formatINR(row.normalBalance)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">+{formatINR(row.additionalWealth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Educational Explainer */}
        <div className="p-6 sm:p-8 bg-[#fdfcf9] rounded-2xl border border-stone-200 space-y-4">
          <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-stone-950">
            How Step-Up (Top-Up) SIP Works
          </h3>
          <div className="text-stone-700 text-xs sm:text-sm leading-relaxed space-y-3 font-sans">
            <p>
              Salaried individuals typically experience annual income revisions or bonuses. By setting up a mandate to step up your SIP by a fixed percentage (such as 10% per year), you match investment discipline with lifestyle growth:
            </p>
            <div className="p-4 bg-white rounded-xl border border-stone-200 font-mono-data text-xs sm:text-sm text-stone-900">
              Yearly Installment: P_k = P_1 × (1 + s)^(k - 1)
            </div>
            <p>
              In Year 1, you invest {formatINR(initialSip)}/month. In Year 2 with a {stepUpPct}% step-up, your contribution rises to {formatINR(initialSip * (1 + stepUpPct / 100))}/month. These higher contributions compound substantially over multi-decade horizons, creating a massive divergence against flat SIPs.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
