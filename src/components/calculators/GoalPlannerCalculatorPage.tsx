import React, { useState, useEffect, useMemo } from "react";
import {
  Compass,
  TrendingUp,
  Share2,
  Copy,
  Check,
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
  HelpCircle,
  Calculator,
  Target,
  Clock,
  PiggyBank,
  CheckCircle2,
  Info,
  Scale,
} from "lucide-react";
import { ToolLayout } from "../ToolLayout";
import { SiteSettings, ArticleCategory } from "../../types";
import {
  formatINR,
  formatIndianWords,
  formatCompactINR,
  calculateGoalPlanner,
} from "./calculatorUtils";

interface GoalPlannerCalculatorPageProps {
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

const PRESET_GOALS = [
  { name: "Child Higher Education", defaultCost: 2500000, defaultYears: 12, defaultInflation: 10 },
  { name: "Retirement Nest Egg", defaultCost: 15000000, defaultYears: 20, defaultInflation: 6 },
  { name: "Home Down Payment", defaultCost: 3500000, defaultYears: 7, defaultInflation: 8 },
  { name: "International Vacation", defaultCost: 600000, defaultYears: 3, defaultInflation: 7 },
  { name: "Emergency Sabbatical Fund", defaultCost: 1200000, defaultYears: 5, defaultInflation: 6 },
];

export function GoalPlannerCalculatorPage({
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
}: GoalPlannerCalculatorPageProps) {
  // Read initial query parameters from URL
  const [goalName, setGoalName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("goal");
      if (val && val.trim().length > 0) return val.trim();
    }
    return "Child Higher Education";
  });

  const [currentCost, setCurrentCost] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("cost") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 2500000; // Default ₹25 Lakh
  });

  const [years, setYears] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseInt(params.get("years") || "", 10);
      if (!isNaN(val) && val > 0) return val;
    }
    return 12; // Default 12 Years
  });

  const [inflationRate, setInflationRate] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("inflation") || "");
      if (!isNaN(val) && val >= 0) return val;
    }
    return 8; // Default 8% p.a.
  });

  const [annualReturn, setAnnualReturn] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("rate") || "");
      if (!isNaN(val) && val > 0) return val;
    }
    return 12; // Default 12% p.a.
  });

  const [existingSavings, setExistingSavings] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = parseFloat(params.get("savings") || "");
      if (!isNaN(val) && val >= 0) return val;
    }
    return 200000; // Default ₹2 Lakh existing savings
  });

  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Sync state to URL search parameters for instant shareability
  useEffect(() => {
    const params = new URLSearchParams();
    if (goalName) params.set("goal", goalName);
    params.set("cost", currentCost.toString());
    params.set("years", years.toString());
    params.set("inflation", inflationRate.toString());
    params.set("rate", annualReturn.toString());
    if (existingSavings > 0) params.set("savings", existingSavings.toString());

    const newRelativePathQuery = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newRelativePathQuery);
  }, [goalName, currentCost, years, inflationRate, annualReturn, existingSavings]);

  // Compute Goal Planner Results
  const goalResult = useMemo(() => {
    return calculateGoalPlanner(currentCost, years, inflationRate, annualReturn, existingSavings);
  }, [currentCost, years, inflationRate, annualReturn, existingSavings]);

  const {
    futureCost,
    existingSavingsFV,
    remainingTarget,
    requiredMonthlySip,
    totalSipInvested,
    totalCapitalInvested,
    estimatedGains,
    schedule,
    whatIfScenarios,
  } = goalResult;

  // Warning conditions
  const isNegativeRealReturn = inflationRate >= annualReturn;
  const isGoalFullyFunded = existingSavingsFV >= futureCost;

  // Handle Share link copy
  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2200);
  };

  // Embed snippet code
  const embedSnippet = `<iframe src="https://www.yieldnest.online/calculators/goal-planner" width="100%" height="760" frameborder="0" style="border-radius:12px;border:1px solid #e5e3dc;"></iframe>`;

  // Inject WebApplication JSON-LD into DOM
  useEffect(() => {
    const scriptId = "goal-planner-calculator-jsonld";
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
          "@id": "https://www.yieldnest.online/calculators/goal-planner#app",
          "name": "Mutual Fund Goal Planner Calculator",
          "url": "https://www.yieldnest.online/calculators/goal-planner",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript",
          "description": "Calculate inflation-adjusted future target cost and the required monthly mutual fund SIP to achieve life goals like child education, home purchase, and retirement.",
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
          "@id": "https://www.yieldnest.online/calculators/goal-planner#breadcrumb",
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
              "name": "Goal Planner Calculator",
              "item": "https://www.yieldnest.online/calculators/goal-planner",
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
  const chartHeight = 230;
  const chartWidth = 600;
  const paddingX = 44;
  const paddingY = 24;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Chart data points including Year 0
  const fullChartData = useMemo(() => {
    const points = [
      {
        year: 0,
        totalInvested: existingSavings,
        projectedCorpus: existingSavings,
        inflationTargetProgress: futureCost > 0 ? (existingSavings / futureCost) * 100 : 0,
      },
      ...schedule,
    ];
    return points;
  }, [schedule, existingSavings, futureCost]);

  const maxVal = Math.max(futureCost, ...fullChartData.map((d) => d.projectedCorpus), 100000);

  const chartPoints = fullChartData.map((row, idx) => {
    const x = paddingX + (idx / Math.max(1, fullChartData.length - 1)) * innerWidth;
    const yCorpus = chartHeight - paddingY - (row.projectedCorpus / maxVal) * innerHeight;
    const yInvested = chartHeight - paddingY - (row.totalInvested / maxVal) * innerHeight;
    return { ...row, x, yCorpus, yInvested };
  });

  const corpusPath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yCorpus}`, "");
  const corpusArea = `${corpusPath} L ${chartPoints[chartPoints.length - 1]?.x || 0},${chartHeight - paddingY} L ${chartPoints[0]?.x || 0},${chartHeight - paddingY} Z`;

  const investedPath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yInvested}`, "");

  const targetY = chartHeight - paddingY - (futureCost / maxVal) * innerHeight;

  const displayedSchedule = showAllYears ? schedule : schedule.slice(0, 10);

  // Quick preset goal handler
  const handleSelectPreset = (preset: typeof PRESET_GOALS[0]) => {
    setGoalName(preset.name);
    setCurrentCost(preset.defaultCost);
    setYears(preset.defaultYears);
    setInflationRate(preset.defaultInflation);
  };

  // Navigation handlers
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
      title="Goal Planner Calculator: Inflation-Adjusted Target & SIP"
      intro="Model the exact future inflation-adjusted cost of your life goals and back-calculate the required monthly mutual fund SIP. Account for existing savings compounding and compare required contributions across market scenarios."
      badge="Quantitative Planning Engine"
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
        { label: "Goal Planner Calculator" },
      ]}
    >
      <div className="space-y-10">
        {/* Top Control Bar: Share, Embed & Model Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 text-xs font-mono-data">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>Model: Inflation-Adjusted SIP Back-Calculation</span>
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
                  <span>Share Goal</span>
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
              <span className="font-mono-data font-semibold text-stone-300">Embed Goal Planner Calculator</span>
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

        {/* Goal Preset Quick Select Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono-data uppercase font-semibold text-stone-500 tracking-wider">
            Quick Select Common Life Goals:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_GOALS.map((preset) => {
              const isSelected = goalName === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono-data font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-emerald-900 text-white border-emerald-950 shadow-xs"
                      : "bg-white text-stone-700 border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50"
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Alerts */}
        {isGoalFullyFunded ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs sm:text-sm font-bold font-mono-data uppercase tracking-wider text-emerald-900">
                  Goal 100% Pre-Funded by Existing Capital
                </h2>
                <p className="text-xs text-emerald-800/90 font-sans mt-0.5 leading-relaxed">
                  Your existing savings of <strong>{formatINR(existingSavings)}</strong> compounding at {annualReturn}% will grow to{" "}
                  <strong>{formatIndianWords(existingSavingsFV)}</strong> ({formatINR(existingSavingsFV)}), fully covering your future target of{" "}
                  <strong>{formatIndianWords(futureCost)}</strong>. No additional monthly SIP is mandatory!
                </p>
              </div>
            </div>
            <div className="shrink-0 font-mono-data text-xs bg-emerald-200/80 px-2.5 py-1 rounded text-emerald-900 font-semibold">
              Surplus: +{formatINR(existingSavingsFV - futureCost)}
            </div>
          </div>
        ) : isNegativeRealReturn ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs sm:text-sm font-bold font-mono-data uppercase tracking-wider text-amber-900">
                  Negative Real Return Warning: Inflation ({inflationRate.toFixed(1)}%) ≥ Expected Return ({annualReturn.toFixed(1)}%)
                </h2>
                <p className="text-xs text-amber-800/90 font-sans mt-0.5 leading-relaxed">
                  Your expected investment return does not outpace the estimated inflation rate for this goal. The target cost will expand faster than your compounded gains, requiring substantially larger out-of-pocket monthly SIP contributions.
                </p>
              </div>
            </div>
            <div className="shrink-0 font-mono-data text-xs bg-amber-200/80 px-2.5 py-1 rounded text-amber-900 font-semibold">
              Real Drag: {(annualReturn - inflationRate).toFixed(1)}%/yr
            </div>
          </div>
        ) : null}

        {/* Main Grid: Inputs Column & Summary/Chart Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Inputs (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-mono-data uppercase tracking-wider font-semibold text-stone-900">
                Goal Parameters
              </h2>
              <span className="text-[11px] font-mono-data text-stone-500">₹ Indian Format</span>
            </div>

            {/* Input 1: Goal Name */}
            <div className="space-y-2">
              <label htmlFor="goal-name-input" className="text-xs font-semibold text-stone-800 block">
                Goal Name / Milestone
              </label>
              <div className="relative">
                <input
                  id="goal-name-input"
                  type="text"
                  maxLength={50}
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Child Higher Education, House Down Payment"
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-sans text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Input 2: Today's Cost of the Goal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="goal-today-cost" className="text-xs font-semibold text-stone-800">
                  Today&apos;s Cost of the Goal (₹)
                </label>
                <span className="text-xs font-mono-data font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {formatIndianWords(currentCost)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono-data text-sm">₹</span>
                <input
                  id="goal-today-cost"
                  type="number"
                  min="10000"
                  max="100000000"
                  step="50000"
                  value={currentCost}
                  onChange={(e) => setCurrentCost(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <input
                aria-label="Today's goal cost slider"
                type="range"
                min="100000"
                max="20000000"
                step="100000"
                value={Math.min(currentCost, 20000000)}
                onChange={(e) => setCurrentCost(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-data">
                <span>₹10 Lakh</span>
                <span>₹25 Lakh</span>
                <span>₹50 Lakh</span>
                <span>₹1 Crore</span>
                <span>₹2 Crore</span>
              </div>
            </div>

            {/* Input 3: Years to Goal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="goal-years" className="text-xs font-semibold text-stone-800">
                  Time Horizon to Goal (Years)
                </label>
                <span className="text-xs font-mono-data font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                  {years} Years ({years * 12} Months)
                </span>
              </div>
              <div className="relative">
                <input
                  id="goal-years"
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
                aria-label="Years to goal slider"
                type="range"
                min="1"
                max="35"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-data">
                <span>3 Yrs</span>
                <span>7 Yrs</span>
                <span>12 Yrs</span>
                <span>20 Yrs</span>
                <span>30 Yrs</span>
              </div>
            </div>

            {/* Input 4: Expected Annual Inflation Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="goal-inflation" className="text-xs font-semibold text-stone-800">
                  Expected Inflation Rate (% p.a.)
                </label>
                <span className="text-xs font-mono-data font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {inflationRate.toFixed(1)}% p.a.
                </span>
              </div>
              <div className="relative">
                <input
                  id="goal-inflation"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, Math.min(20, Number(e.target.value))))}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-mono-data text-xs">%</span>
              </div>
              <input
                aria-label="Expected inflation rate slider"
                type="range"
                min="0"
                max="16"
                step="0.5"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-data">
                <span>6% (General CPI)</span>
                <span>8% (Lifestyle)</span>
                <span>10% (Higher Edu)</span>
                <span>12% (Healthcare)</span>
              </div>
            </div>

            {/* Input 5: Expected Annual Return Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="goal-expected-return" className="text-xs font-semibold text-stone-800">
                  Expected Return Rate (% p.a.)
                </label>
                <span className="text-xs font-mono-data font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                  {annualReturn.toFixed(1)}% p.a.
                </span>
              </div>
              <div className="relative">
                <input
                  id="goal-expected-return"
                  type="number"
                  min="1"
                  max="30"
                  step="0.5"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-mono-data text-xs">%</span>
              </div>
              <input
                aria-label="Expected annual return slider"
                type="range"
                min="4"
                max="18"
                step="0.5"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-data">
                <span>7% (Debt)</span>
                <span>10% (Hybrid)</span>
                <span>12% (Equity Index)</span>
                <span>14% (Active)</span>
              </div>
            </div>

            {/* Input 6: Existing Savings (Optional) */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="goal-existing-savings" className="text-xs font-semibold text-stone-800">
                    Existing Savings Toward Goal (₹)
                  </label>
                  <span className="text-[10px] font-mono-data px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                    Optional
                  </span>
                </div>
                <span className="text-xs font-mono-data font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  {formatIndianWords(existingSavings)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-mono-data text-sm">₹</span>
                <input
                  id="goal-existing-savings"
                  type="number"
                  min="0"
                  max="50000000"
                  step="25000"
                  value={existingSavings}
                  onChange={(e) => setExistingSavings(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-data text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <input
                aria-label="Existing savings slider"
                type="range"
                min="0"
                max="5000000"
                step="25000"
                value={Math.min(existingSavings, 5000000)}
                onChange={(e) => setExistingSavings(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
              />
              <p className="text-[11px] text-stone-500 font-sans leading-tight">
                {existingSavings > 0
                  ? `Your existing ₹${formatINR(existingSavings)} grows to ${formatIndianWords(existingSavingsFV)} at ${annualReturn}% p.a., reducing your funding gap.`
                  : "Enter any existing mutual funds, FDs, or PPF earmarked for this goal."}
              </p>
            </div>

            {/* Quick Math Summary Box */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono-data space-y-1.5 text-stone-600">
              <div className="flex justify-between">
                <span>Today&apos;s Baseline Cost:</span>
                <span className="font-semibold text-stone-900">{formatINR(currentCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Inflation Multiplier ({years} Yrs):</span>
                <span className="font-semibold text-amber-900">
                  {(Math.pow(1 + inflationRate / 100, years)).toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between">
                <span>Future Goal Cost:</span>
                <span className="font-bold text-stone-950">{formatINR(futureCost)}</span>
              </div>
              {existingSavings > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>Savings Compounded FV:</span>
                  <span className="font-semibold">-{formatINR(existingSavingsFV)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-stone-200 font-semibold text-stone-900">
                <span>Net Gap to Fund via SIP:</span>
                <span className="text-emerald-900">{formatINR(remainingTarget)}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Outputs & Visual Chart (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Metrics Hero Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 text-white border border-emerald-900/60 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono-data text-xs text-stone-300 uppercase tracking-wider">
                    Required Systematic Investment
                  </span>
                </div>
                <span className="text-xs font-mono-data text-emerald-400 font-semibold">
                  For: {goalName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-baseline">
                {/* Monthly SIP Required */}
                <div className="space-y-1">
                  <span className="text-xs font-mono-data uppercase text-stone-400">
                    Monthly SIP Required
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono-data text-emerald-400">
                    {formatINR(requiredMonthlySip)}
                    <span className="text-sm font-normal text-stone-300"> / month</span>
                  </div>
                  <div className="text-xs text-stone-300 font-sans">
                    {formatIndianWords(requiredMonthlySip)} per month for {years} years
                  </div>
                </div>

                {/* Inflation Adjusted Target */}
                <div className="space-y-1 sm:border-l sm:border-stone-800 sm:pl-6">
                  <span className="text-xs font-mono-data uppercase text-stone-400">
                    Inflation-Adjusted Target Cost
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono-data text-white">
                    {formatINR(futureCost)}
                  </div>
                  <div className="text-xs text-stone-300 font-sans">
                    {formatIndianWords(futureCost)} (vs ₹{formatIndianWords(currentCost)} today)
                  </div>
                </div>
              </div>

              {/* Progress & Capital Breakdown Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono-data text-stone-300">
                  <span>Funding Source Breakdown</span>
                  <span>{((totalCapitalInvested / Math.max(1, futureCost)) * 100).toFixed(0)}% Out-of-Pocket • {((estimatedGains / Math.max(1, futureCost)) * 100).toFixed(0)}% Compounded Gains</span>
                </div>
                <div className="h-3 w-full bg-stone-800 rounded-full overflow-hidden flex">
                  {existingSavings > 0 && (
                    <div
                      style={{ width: `${Math.min(100, (existingSavings / futureCost) * 100)}%` }}
                      className="bg-stone-500 h-full"
                      title={`Existing Savings: ${formatINR(existingSavings)}`}
                    />
                  )}
                  <div
                    style={{ width: `${Math.min(100, (totalSipInvested / futureCost) * 100)}%` }}
                    className="bg-emerald-600 h-full"
                    title={`SIP Invested: ${formatINR(totalSipInvested)}`}
                  />
                  <div
                    style={{ width: `${Math.min(100, (estimatedGains / futureCost) * 100)}%` }}
                    className="bg-amber-400 h-full"
                    title={`Estimated Gains: ${formatINR(estimatedGains)}`}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono-data text-stone-400 pt-1">
                  {existingSavings > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-stone-500"></span>
                      <span>Existing: {formatINR(existingSavings)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                    <span>SIP Principal: {formatINR(totalSipInvested)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
                    <span>Growth / Gains: {formatINR(estimatedGains)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Capital Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Invested */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10.5px] font-mono-data uppercase font-semibold text-stone-500 tracking-wider">
                  Total Capital Invested
                </span>
                <div className="text-xl font-bold font-mono-data text-stone-900">
                  {formatINR(totalCapitalInvested)}
                </div>
                <div className="text-[11px] text-stone-500 font-sans">
                  {formatIndianWords(totalCapitalInvested)}
                </div>
              </div>

              {/* Estimated Gains */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10.5px] font-mono-data uppercase font-semibold text-stone-500 tracking-wider">
                  Estimated Compounded Gains
                </span>
                <div className="text-xl font-bold font-mono-data text-emerald-800">
                  +{formatINR(estimatedGains)}
                </div>
                <div className="text-[11px] text-stone-500 font-sans">
                  {formatIndianWords(estimatedGains)}
                </div>
              </div>

              {/* Existing Savings FV */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                <span className="text-[10.5px] font-mono-data uppercase font-semibold text-stone-500 tracking-wider">
                  Savings Growth (FV)
                </span>
                <div className="text-xl font-bold font-mono-data text-stone-900">
                  {formatINR(existingSavingsFV)}
                </div>
                <div className="text-[11px] text-stone-500 font-sans">
                  from {formatINR(existingSavings)} today
                </div>
              </div>
            </div>

            {/* Goal Corpus Accumulation Over Time SVG Chart */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 font-serif-editorial">
                    Corpus Accumulation vs Inflation-Adjusted Target
                  </h2>
                  <p className="text-[11px] text-stone-500 font-mono-data">
                    Green area: Projected Corpus • Amber line: Inflation-Adjusted Target • Gray line: Capital Invested
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono-data">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="text-stone-600">Accumulated Corpus</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-stone-600">Target Goal</span>
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
                    <linearGradient id="goalCorpusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = paddingY + innerHeight * (1 - ratio);
                    const val = maxVal * ratio;
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

                  {/* Inflation Target Horizon Dashed Line */}
                  <line
                    x1={paddingX}
                    y1={targetY}
                    x2={chartWidth - paddingX}
                    y2={targetY}
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                  <text
                    x={chartWidth - paddingX - 4}
                    y={targetY - 5}
                    textAnchor="end"
                    className="text-[9.5px] fill-amber-700 font-mono-data font-bold"
                  >
                    Target: {formatCompactINR(futureCost)}
                  </text>

                  {/* Corpus Area Fill */}
                  <path d={corpusArea} fill="url(#goalCorpusGrad)" />

                  {/* Capital Invested Line */}
                  <path
                    d={investedPath}
                    fill="none"
                    stroke="#78716C"
                    strokeWidth="1.8"
                    strokeDasharray="3 2"
                  />

                  {/* Accumulated Corpus Line */}
                  <path
                    d={corpusPath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Interactive Points */}
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
                          cy={pt.yCorpus}
                          r={isHovered ? 5.5 : 2.5}
                          fill="#059669"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-all"
                        />
                        {/* Year Axis Labels */}
                        {(pt.year === 0 || pt.year === years || (years > 6 && pt.year % Math.ceil(years / 5) === 0)) && (
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
                        <span>Corpus: <strong className="text-emerald-400">{formatINR(point.projectedCorpus)}</strong></span>
                        <span>Invested: <strong>{formatINR(point.totalInvested)}</strong></span>
                        <span>Goal Progress: <strong className="text-amber-400">{point.inflationTargetProgress.toFixed(1)}%</strong></span>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {/* Mandatory Regulatory Note */}
            <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200/80 text-xs text-stone-600 font-sans leading-relaxed">
              <span className="font-semibold text-stone-800">Mandatory Regulatory Note: </span>
              Assumptions are illustrative. Inflation and returns are not guaranteed.
            </div>

            {/* Link to SIP Calculator Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 text-white border border-emerald-900/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-data text-emerald-400 font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Execution & Compounding</span>
                </div>
                <h2 className="text-base font-bold font-serif-editorial text-white">
                  Ready to simulate your SIP compounding schedule?
                </h2>
                <p className="text-xs text-stone-300 font-sans max-w-md">
                  Explore how salary step-ups and annual increments can help you reach this ₹{formatIndianWords(futureCost)} goal even faster.
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

        {/* Short "What-If" Sensitivity Analysis Table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold font-serif-editorial text-stone-900">
                &quot;What-If&quot; Sensitivity Analysis: Impact of ±2% Returns
              </h2>
              <p className="text-xs text-stone-500 font-mono-data">
                See how a 2% variation in annual equity returns changes your required monthly SIP and out-of-pocket commitment
              </p>
            </div>
            <span className="font-mono-data text-[11px] bg-stone-100 text-stone-700 px-2.5 py-1 rounded">
              Horizon: {years} Years
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-data border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-700">
                  <th className="py-2.5 px-3 font-semibold">Scenario</th>
                  <th className="py-2.5 px-3 font-semibold">Annual Return</th>
                  <th className="py-2.5 px-3 font-semibold">Monthly SIP Required</th>
                  <th className="py-2.5 px-3 font-semibold">Difference vs Baseline</th>
                  <th className="py-2.5 px-3 font-semibold">Total SIP Invested</th>
                  <th className="py-2.5 px-3 font-semibold text-emerald-800">Estimated Gains</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {whatIfScenarios.map((sc, idx) => {
                  const isBase = idx === 1;
                  return (
                    <tr
                      key={sc.label}
                      className={`hover:bg-stone-50/80 transition-colors ${isBase ? "bg-emerald-50/40 font-semibold" : ""}`}
                    >
                      <td className="py-2.5 px-3 text-stone-900">
                        {sc.label}
                        {isBase && (
                          <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                            Current
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">{sc.returnRate.toFixed(1)}% p.a.</td>
                      <td className="py-2.5 px-3 font-bold text-stone-900">{formatINR(sc.monthlySip)} / mo</td>
                      <td className="py-2.5 px-3">
                        {sc.differenceVsBase > 0 ? (
                          <span className="text-amber-800 font-medium">+{formatINR(sc.differenceVsBase)} / mo</span>
                        ) : sc.differenceVsBase < 0 ? (
                          <span className="text-emerald-700 font-medium">{formatINR(sc.differenceVsBase)} / mo</span>
                        ) : (
                          <span className="text-stone-400">Baseline</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-stone-700">{formatINR(sc.totalSipInvested)}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium">+{formatINR(sc.estimatedGains)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
            * <strong>Insight:</strong> A 2% higher return rate lowers your required monthly SIP by{" "}
            <strong>{formatINR(Math.abs(whatIfScenarios[2]?.differenceVsBase || 0))}</strong> every single month, saving a cumulative{" "}
            <strong>{formatINR((whatIfScenarios[1]?.totalSipInvested || 0) - (whatIfScenarios[2]?.totalSipInvested || 0))}</strong> in out-of-pocket capital.
          </p>
        </div>

        {/* Year-by-Year Growth Table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
            <div>
              <h2 className="text-base font-bold font-serif-editorial text-stone-900">
                Year-by-Year Goal Progress Schedule
              </h2>
              <p className="text-xs text-stone-500 font-mono-data">
                Milestone trajectory towards the inflation-adjusted target of {formatINR(futureCost)}
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
                  <th className="py-2.5 px-3 font-semibold">Cumulative SIP Invested</th>
                  <th className="py-2.5 px-3 font-semibold">Total Capital (incl. Savings)</th>
                  <th className="py-2.5 px-3 font-semibold text-emerald-800">Projected Corpus</th>
                  <th className="py-2.5 px-3 font-semibold text-emerald-800">Gains Cumulative</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Goal Progress %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {displayedSchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-stone-900">Year {row.year}</td>
                    <td className="py-2.5 px-3">{formatINR(row.sipInvestedCumulative)}</td>
                    <td className="py-2.5 px-3 font-medium text-stone-900">{formatINR(row.totalInvested)}</td>
                    <td className="py-2.5 px-3 text-emerald-900 font-bold">{formatINR(row.projectedCorpus)}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-medium">+{formatINR(row.gainsCumulative)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-800">
                      {row.inflationTargetProgress.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* General Category Asset Allocation Guide by Time Horizon */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold font-serif-editorial text-stone-900">
                Asset Allocation Guide by Time Horizon (SEBI Categories)
              </h2>
            </div>
            <span className="text-[11px] font-mono-data text-stone-500">General Educational Guide</span>
          </div>

          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Asset allocation should always match your time horizon. YieldNest never recommends specific commercial fund schemes. The matrix below illustrates typical regulatory category archetypes used for various goal horizons:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Horizon 1: Short Term */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-xs font-bold text-stone-900">&lt; 3 Years (Short-Term)</span>
                <span className="text-[10px] font-mono-data bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">Low Risk</span>
              </div>
              <p className="text-[11px] text-stone-500 font-sans">
                Capital preservation priority. Short horizons cannot tolerate equity drawdowns.
              </p>
              <div className="pt-1 text-xs font-mono-data text-stone-800 space-y-1">
                <div>• Liquid / Overnight Funds</div>
                <div>• Ultra Short / Low Duration Debt</div>
                <div>• Arbitrage Funds (Equity Taxation)</div>
              </div>
            </div>

            {/* Horizon 2: Medium Term */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-xs font-bold text-emerald-950">3 to 7 Years (Medium-Term)</span>
                <span className="text-[10px] font-mono-data bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Moderate Risk</span>
              </div>
              <p className="text-[11px] text-stone-600 font-sans">
                Balanced growth with built-in asset allocation or dynamic equity rebalancing.
              </p>
              <div className="pt-1 text-xs font-mono-data text-emerald-950 space-y-1">
                <div>• Balanced Advantage Funds (BAF)</div>
                <div>• Multi-Asset Allocation Funds</div>
                <div>• Aggressive Hybrid Strategies</div>
              </div>
            </div>

            {/* Horizon 3: Long Term */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-xs font-bold text-stone-900">&gt; 7 Years (Long-Term)</span>
                <span className="text-[10px] font-mono-data bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">Growth Focus</span>
              </div>
              <p className="text-[11px] text-stone-500 font-sans">
                Maximum compounding potential. Time horizon allows recovering from market cycles.
              </p>
              <div className="pt-1 text-xs font-mono-data text-stone-800 space-y-1">
                <div>• Flexi Cap & Large &amp; Mid Cap Funds</div>
                <div>• Broad Market NIFTY 50 / 500 Index Funds</div>
                <div>• Multi Cap / Mid Cap allocations</div>
              </div>
            </div>
          </div>
        </div>

        {/* "How This Is Calculated" Explanatory Section */}
        <div className="bg-[#FAF9F5] rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5">
          <div className="border-b border-stone-200 pb-3 flex items-center gap-2 text-stone-900">
            <HelpCircle className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold font-serif-editorial">
              How This Goal Planner Is Calculated
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 font-sans leading-relaxed">
            <div>
              <h3 className="font-bold text-stone-900 text-sm font-serif-editorial mb-1">
                1. Inflation-Adjusted Future Goal Cost Formula
              </h3>
              <p>
                Money loses purchasing power over time. The future cost of your goal accounts for cumulative compound inflation over your target horizon:
              </p>
              <div className="my-2.5 p-3 rounded-xl bg-white border border-stone-200 font-mono-data text-xs sm:text-sm text-emerald-950 font-semibold inline-block">
                Future Cost = Today&apos;s Cost × (1 + Inflation Rate)<sup>Years</sup>
              </div>
              <p>
                For instance, a higher education cost of ₹25 Lakh inflating at 10% annually expands to approximately ₹78.4 Lakh in 12 years.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 text-sm font-serif-editorial mb-1">
                2. Growth of Existing Savings (Monthly Periodic Compounding)
              </h3>
              <p>
                Any existing capital already earmarked for the goal continues compounding at your portfolio return rate:
              </p>
              <div className="my-2.5 p-3 rounded-xl bg-white border border-stone-200 font-mono-data text-xs sm:text-sm text-emerald-950 font-semibold inline-block">
                FV<sub>Savings</sub> = Existing Savings × (1 + r / 12)<sup>12 × Years</sup>
              </div>
              <p>
                The remaining funding gap is calculated as: <strong>Funding Gap = Future Cost - FV<sub>Savings</sub></strong>.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 text-sm font-serif-editorial mb-1">
                3. Back-Calculating Required Monthly SIP
              </h3>
              <p>
                To determine the monthly investment needed to bridge the remaining funding gap, we invert the standard annuity future value formula:
              </p>
              <div className="my-2.5 p-3 rounded-xl bg-white border border-stone-200 font-mono-data text-xs sm:text-sm text-emerald-950 font-semibold inline-block">
                Monthly SIP = Funding Gap ÷ [ (((1 + r/12)<sup>n</sup> - 1) / (r/12)) × (1 + r/12) ]
              </div>
              <p>
                Where <strong>n = Years × 12</strong> months, and <strong>r</strong> is the nominal annual return rate.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 text-sm font-serif-editorial mb-1">
                4. Decoupled Education vs. General Inflation
              </h3>
              <p>
                Specialized goals like tertiary education or medical procedures consistently outpace general CPI inflation in India (typically 8% to 12% vs. 5% to 6% for general consumer baskets). Calibrating your goal with realistic category-specific inflation prevents underfunding.
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
            Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing. YieldNest is an independent investor education platform and is not registered with SEBI or AMFI. Past performance does not guarantee future returns. Calculator projections are mathematical simulations for educational purposes only and do not constitute investment advice or return guarantees. Assumptions are illustrative. Inflation and returns are not guaranteed.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
