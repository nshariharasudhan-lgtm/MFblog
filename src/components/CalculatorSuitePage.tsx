import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Percent,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import { ArticlePost } from "../types";

interface CalculatorSuitePageProps {
  onBackToHome: () => void;
  onNavigateArticle?: (post: ArticlePost) => void;
  allPosts?: ArticlePost[];
  initialTab?: "direct-vs-regular" | "step-up" | "cost-of-delay" | "sip-vs-lumpsum";
}

type TabType = "direct-vs-regular" | "step-up" | "cost-of-delay" | "sip-vs-lumpsum";

// Helper: Format INR currency
function formatINR(val: number): string {
  const rounded = Math.round(val);
  return "₹" + rounded.toLocaleString("en-IN");
}

// Helper: Format to Indian Words (Lakhs / Crores)
function formatIndianWords(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    return (amount / 10000000).toFixed(2) + " Crore";
  } else if (abs >= 100000) {
    return (amount / 100000).toFixed(2) + " Lakh";
  } else if (abs >= 1000) {
    return (amount / 1000).toFixed(1) + " Thousand";
  }
  return "₹" + Math.round(amount);
}

export function CalculatorSuitePage({
  onBackToHome,
  onNavigateArticle,
  allPosts = [],
  initialTab = "direct-vs-regular",
}: CalculatorSuitePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Tab 1: Direct vs Regular
  const [t1Sip, setT1Sip] = useState(10000);
  const [t1Years, setT1Years] = useState(15);
  const [t1Gross, setT1Gross] = useState(13);
  const [t1Drag, setT1Drag] = useState(1.0);

  // Tab 2: Step-Up SIP
  const [t2Sip, setT2Sip] = useState(10000);
  const [t2Step, setT2Step] = useState(10);
  const [t2Years, setT2Years] = useState(15);
  const [t2Return, setT2Return] = useState(12);

  // Tab 3: Cost of Delay
  const [t3Sip, setT3Sip] = useState(10000);
  const [t3Delay, setT3Delay] = useState(2);
  const [t3Horizon, setT3Horizon] = useState(15);
  const [t3Return, setT3Return] = useState(12);

  // Tab 4: SIP vs Lumpsum
  const [t4Lump, setT4Lump] = useState(240000);
  const [t4Sip, setT4Sip] = useState(10000);
  const [t4Years, setT4Years] = useState(10);
  const [t4Return, setT4Return] = useState(12);

  // Switch Tab & sync URL hash without reload
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    window.history.pushState({}, "", `/calculators?tab=${tab}`);
  };

  // ==========================================
  // Calculations: Tab 1 (Direct vs Regular)
  // ==========================================
  const t1Data = useMemo(() => {
    const n = t1Years * 12;
    const totalInvested = t1Sip * n;
    const r_direct = (t1Gross / 100) / 12;
    const netRegularAnnual = Math.max(0, t1Gross - t1Drag);
    const r_regular = (netRegularAnnual / 100) / 12;

    let fvDirect = 0;
    if (r_direct > 0 && n > 0 && t1Sip > 0) {
      fvDirect = t1Sip * ((Math.pow(1 + r_direct, n) - 1) / r_direct) * (1 + r_direct);
    } else {
      fvDirect = totalInvested;
    }

    let fvRegular = 0;
    if (r_regular > 0 && n > 0 && t1Sip > 0) {
      fvRegular = t1Sip * ((Math.pow(1 + r_regular, n) - 1) / r_regular) * (1 + r_regular);
    } else {
      fvRegular = totalInvested;
    }

    const diff = Math.max(0, fvDirect - fvRegular);
    const lossPct = fvDirect > 0 ? (diff / fvDirect) * 100 : 0;
    const regularRatio = fvDirect > 0 ? (fvRegular / fvDirect) * 100 : 100;

    return { totalInvested, fvDirect, fvRegular, diff, lossPct, regularRatio, n };
  }, [t1Sip, t1Years, t1Gross, t1Drag]);

  // ==========================================
  // Calculations: Tab 2 (Step-Up SIP)
  // ==========================================
  const t2Data = useMemo(() => {
    const totalMonths = t2Years * 12;
    const r = (t2Return / 100) / 12;

    let stepUpFV = 0;
    let stepUpInvested = 0;

    for (let m = 1; m <= totalMonths; m++) {
      const yearIndex = Math.floor((m - 1) / 12);
      const monthlyAmount = t2Sip * Math.pow(1 + (t2Step / 100), yearIndex);
      stepUpInvested += monthlyAmount;
      const monthsRemaining = totalMonths - m + 1;
      stepUpFV += monthlyAmount * Math.pow(1 + r, monthsRemaining);
    }

    const normalInvested = t2Sip * totalMonths;
    let normalFV = 0;
    if (r > 0 && totalMonths > 0) {
      normalFV = t2Sip * ((Math.pow(1 + r, totalMonths) - 1) / r) * (1 + r);
    } else {
      normalFV = normalInvested;
    }

    const extraWealth = Math.max(0, stepUpFV - normalFV);
    const normalRatio = stepUpFV > 0 ? (normalFV / stepUpFV) * 100 : 100;

    return { stepUpFV, stepUpInvested, normalFV, normalInvested, extraWealth, normalRatio };
  }, [t2Sip, t2Step, t2Years, t2Return]);

  // ==========================================
  // Calculations: Tab 3 (Cost of Delay)
  // ==========================================
  const t3Data = useMemo(() => {
    const r = (t3Return / 100) / 12;
    const totalMonths = t3Horizon * 12;
    const delayedMonths = Math.max(0, (t3Horizon - t3Delay) * 12);

    let fvToday = 0;
    if (r > 0 && totalMonths > 0) {
      fvToday = t3Sip * ((Math.pow(1 + r, totalMonths) - 1) / r) * (1 + r);
    } else {
      fvToday = t3Sip * totalMonths;
    }

    let fvDelayed = 0;
    if (r > 0 && delayedMonths > 0) {
      fvDelayed = t3Sip * ((Math.pow(1 + r, delayedMonths) - 1) / r) * (1 + r);
    } else {
      fvDelayed = t3Sip * delayedMonths;
    }

    const lostWealth = Math.max(0, fvToday - fvDelayed);
    const missedInstallments = t3Sip * (t3Delay * 12);
    const lossPct = fvToday > 0 ? (lostWealth / fvToday) * 100 : 0;
    const retainedRatio = fvToday > 0 ? (fvDelayed / fvToday) * 100 : 100;

    return { fvToday, fvDelayed, lostWealth, missedInstallments, lossPct, retainedRatio };
  }, [t3Sip, t3Delay, t3Horizon, t3Return]);

  // ==========================================
  // Calculations: Tab 4 (SIP vs Lumpsum)
  // ==========================================
  const t4Data = useMemo(() => {
    const r = (t4Return / 100) / 12;
    const totalMonths = t4Years * 12;
    const totalSipInvested = t4Sip * totalMonths;

    // Lumpsum Future Value
    const fvLump = t4Lump * Math.pow(1 + (t4Return / 100), t4Years);

    // SIP Future Value
    let fvSip = 0;
    if (r > 0 && totalMonths > 0) {
      fvSip = t4Sip * ((Math.pow(1 + r, totalMonths) - 1) / r) * (1 + r);
    } else {
      fvSip = totalSipInvested;
    }

    const diff = Math.abs(fvLump - fvSip);
    const isLumpAhead = fvLump >= fvSip;
    const maxVal = Math.max(fvLump, fvSip, 1);
    const lumpRatio = (fvLump / maxVal) * 100;
    const sipRatio = (fvSip / maxVal) * 100;

    return { fvLump, fvSip, totalSipInvested, diff, isLumpAhead, lumpRatio, sipRatio, totalMonths };
  }, [t4Lump, t4Sip, t4Years, t4Return]);

  // Curated research guides linking back to articles
  const relatedArticles = useMemo(() => {
    return allPosts.filter((p) => p.status === "published").slice(0, 3);
  }, [allPosts]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Return to Research */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-mono-data text-stone-600 hover:text-stone-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-[#EAE8E0] shadow-2xs"
        >
          ← Return to Research Reports
        </button>

        <div className="flex items-center gap-1 text-[11px] font-mono-data text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Interactive Quantitative Tools</span>
        </div>
      </div>

      {/* Main Suite Card */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl shadow-xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#1e293b] to-[#151f30] border-b border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono-data text-xs font-semibold uppercase tracking-wider mb-2">
              YieldNest.online • Mutual Fund Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Mutual Fund Quantitative Calculator Suite
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-sans">
              Evaluate distributor TER friction, compounding acceleration via annual step-ups, the financial cost of procrastinating, and SIP vs lumpsum entry dynamics.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-[#0f172a] p-1.5 gap-1.5 border-b border-[#334155]">
          <button
            onClick={() => handleTabChange("direct-vs-regular")}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 font-mono-data ${
              activeTab === "direct-vs-regular"
                ? "bg-[#1e293b] text-emerald-400 border border-[#334155] shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Percent className="w-4 h-4 shrink-0" />
            <span>1. Direct vs Regular (TER Drag)</span>
          </button>

          <button
            onClick={() => handleTabChange("step-up")}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 font-mono-data ${
              activeTab === "step-up"
                ? "bg-[#1e293b] text-emerald-400 border border-[#334155] shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>2. Step-Up SIP</span>
          </button>

          <button
            onClick={() => handleTabChange("cost-of-delay")}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 font-mono-data ${
              activeTab === "cost-of-delay"
                ? "bg-[#1e293b] text-emerald-400 border border-[#334155] shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>3. Cost of Delay (Tax)</span>
          </button>

          <button
            onClick={() => handleTabChange("sip-vs-lumpsum")}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 font-mono-data ${
              activeTab === "sip-vs-lumpsum"
                ? "bg-[#1e293b] text-emerald-400 border border-[#334155] shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>4. SIP vs Lumpsum</span>
          </button>
        </div>

        {/* TAB 1: Direct vs Regular */}
        {activeTab === "direct-vs-regular" && (
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Inputs Panel */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#334155]">
              {/* Monthly SIP */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Monthly SIP Amount</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₹</span>
                    <input
                      type="number"
                      min={1000}
                      max={100000}
                      step={1000}
                      value={t1Sip}
                      onChange={(e) => setT1Sip(Number(e.target.value))}
                      className="w-32 bg-[#0f172a] border border-[#475569] rounded-lg pl-6 pr-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={t1Sip}
                  onChange={(e) => setT1Sip(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-data text-slate-500 mt-1">
                  <span>₹1,000</span>
                  <span>₹50,000</span>
                  <span>₹1,00,000</span>
                </div>
              </div>

              {/* Time Horizon */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Investment Horizon</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={35}
                      step={1}
                      value={t1Years}
                      onChange={(e) => setT1Years(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">Y</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={35}
                  step={1}
                  value={t1Years}
                  onChange={(e) => setT1Years(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-data text-slate-500 mt-1">
                  <span>1 Year</span>
                  <span>15 Years</span>
                  <span>35 Years</span>
                </div>
              </div>

              {/* Expected Return */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Expected Gross CAGR</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={6}
                      max={25}
                      step={0.5}
                      value={t1Gross}
                      onChange={(e) => setT1Gross(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={6}
                  max={25}
                  step={0.5}
                  value={t1Gross}
                  onChange={(e) => setT1Gross(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-data text-slate-500 mt-1">
                  <span>6.0%</span>
                  <span>13.0%</span>
                  <span>25.0%</span>
                </div>
              </div>

              {/* Commission Drag */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Regular Plan Commission Drag (TER)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0.2}
                      max={2.5}
                      step={0.1}
                      value={t1Drag}
                      onChange={(e) => setT1Drag(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.5}
                  step={0.1}
                  value={t1Drag}
                  onChange={(e) => setT1Drag(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-data text-slate-500 mt-1">
                  <span>0.2%</span>
                  <span>1.0% (AMFI Industry Avg)</span>
                  <span>2.5%</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-slate-700/60 flex flex-wrap gap-2">
                <span className="text-[11px] text-slate-400 font-mono-data flex items-center">Presets:</span>
                {[
                  { label: "₹5k / 10Y", sip: 5000, yrs: 10, ret: 13, drag: 1.0 },
                  { label: "₹10k / 15Y", sip: 10000, yrs: 15, ret: 13, drag: 1.0 },
                  { label: "₹25k / 20Y", sip: 25000, yrs: 20, ret: 13, drag: 1.0 },
                  { label: "₹50k / 25Y", sip: 50000, yrs: 25, ret: 13, drag: 1.0 },
                ].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setT1Sip(p.sip);
                      setT1Years(p.yrs);
                      setT1Gross(p.ret);
                      setT1Drag(p.drag);
                    }}
                    className="px-2.5 py-1 rounded bg-[#0f172a] hover:bg-slate-800 text-[11px] font-mono-data text-slate-300 border border-[#334155] transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Outputs Panel */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0f172a]/60 flex flex-col justify-between space-y-6">
              {/* Highlight Callout Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/15 to-red-900/5 border border-red-500/35">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 font-mono-data mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Lost to Distributor Commissions</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-data">
                  {formatINR(t1Data.diff)}
                </div>
                <div className="text-xs text-red-300 mt-1 font-sans">
                  {t1Data.lossPct.toFixed(1)}% of your final wealth wiped out ({formatIndianWords(t1Data.diff)})
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-emerald-500/40">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono-data flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Direct Plan
                  </div>
                  <div className="text-lg font-bold text-emerald-400 font-mono-data mt-1">
                    {formatINR(t1Data.fvDirect)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t1Data.fvDirect)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono-data flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    Regular Plan
                  </div>
                  <div className="text-lg font-bold text-white font-mono-data mt-1">
                    {formatINR(t1Data.fvRegular)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t1Data.fvRegular)}
                  </div>
                </div>

                <div className="col-span-2 p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 font-mono-data flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Total Principal Invested
                  </div>
                  <div className="text-base font-bold text-slate-200 font-mono-data mt-1">
                    {formatINR(t1Data.totalInvested)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t1Data.totalInvested)} across {t1Data.n} monthly installments
                  </div>
                </div>
              </div>

              {/* Visual Comparison Bar */}
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#334155] space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono-data mb-1 text-emerald-400">
                    <span>Direct Plan Corpus</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono-data mb-1 text-slate-400">
                    <span>Regular Plan Retained</span>
                    <span>{t1Data.regularRatio.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-600 to-slate-400 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, t1Data.regularRatio))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Step-Up SIP */}
        {activeTab === "step-up" && (
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#334155]">
              {/* Starting SIP */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Starting Monthly SIP</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₹</span>
                    <input
                      type="number"
                      min={1000}
                      max={100000}
                      step={1000}
                      value={t2Sip}
                      onChange={(e) => setT2Sip(Number(e.target.value))}
                      className="w-32 bg-[#0f172a] border border-[#475569] rounded-lg pl-6 pr-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={t2Sip}
                  onChange={(e) => setT2Sip(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-data text-slate-500 mt-1">
                  <span>₹1,000</span>
                  <span>₹50,000</span>
                  <span>₹1,00,000</span>
                </div>
              </div>

              {/* Step-Up % */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Annual Step-Up Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      step={1}
                      value={t2Step}
                      onChange={(e) => setT2Step(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={t2Step}
                  onChange={(e) => setT2Step(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-data text-slate-500 mt-1">
                  <span>1%</span>
                  <span>10% (Annual Salary Hike)</span>
                  <span>30%</span>
                </div>
              </div>

              {/* Horizon */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Investment Horizon</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={35}
                      step={1}
                      value={t2Years}
                      onChange={(e) => setT2Years(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">Y</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={35}
                  step={1}
                  value={t2Years}
                  onChange={(e) => setT2Years(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-data text-slate-500 mt-1">
                  <span>1 Year</span>
                  <span>15 Years</span>
                  <span>35 Years</span>
                </div>
              </div>

              {/* Expected Return */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Expected CAGR</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={5}
                      max={25}
                      step={0.5}
                      value={t2Return}
                      onChange={(e) => setT2Return(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={0.5}
                  value={t2Return}
                  onChange={(e) => setT2Return(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-data text-slate-500 mt-1">
                  <span>5.0%</span>
                  <span>12.0%</span>
                  <span>25.0%</span>
                </div>
              </div>
            </div>

            {/* Outputs */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0f172a]/60 flex flex-col justify-between space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-900/5 border border-emerald-500/35">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono-data mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Extra Wealth Generated by Step-Up</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-data">
                  +{formatINR(t2Data.extraWealth)}
                </div>
                <div className="text-xs text-emerald-300 mt-1 font-sans">
                  +{formatIndianWords(t2Data.extraWealth)} additional corpus compared to a flat SIP
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-emerald-500/40">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono-data">
                    Step-Up Corpus
                  </div>
                  <div className="text-lg font-bold text-emerald-400 font-mono-data mt-1">
                    {formatINR(t2Data.stepUpFV)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t2Data.stepUpFV)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono-data">
                    Constant SIP Corpus
                  </div>
                  <div className="text-lg font-bold text-white font-mono-data mt-1">
                    {formatINR(t2Data.normalFV)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t2Data.normalFV)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 font-mono-data">
                    Step-Up Invested
                  </div>
                  <div className="text-sm font-bold text-slate-200 font-mono-data mt-1">
                    {formatINR(t2Data.stepUpInvested)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t2Data.stepUpInvested)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono-data">
                    Normal Invested
                  </div>
                  <div className="text-sm font-bold text-slate-200 font-mono-data mt-1">
                    {formatINR(t2Data.normalInvested)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t2Data.normalInvested)}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#334155] space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono-data mb-1 text-emerald-400">
                    <span>Step-Up SIP Corpus</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono-data mb-1 text-slate-400">
                    <span>Flat SIP Output</span>
                    <span>{t2Data.normalRatio.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-600 to-slate-400"
                      style={{ width: `${Math.min(100, Math.max(5, t2Data.normalRatio))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Cost of Delay */}
        {activeTab === "cost-of-delay" && (
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#334155]">
              {/* Target SIP */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Target Monthly SIP</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₹</span>
                    <input
                      type="number"
                      min={1000}
                      max={100000}
                      step={1000}
                      value={t3Sip}
                      onChange={(e) => setT3Sip(Number(e.target.value))}
                      className="w-32 bg-[#0f172a] border border-[#475569] rounded-lg pl-6 pr-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={t3Sip}
                  onChange={(e) => setT3Sip(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Delay Period */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Delay / Waiting Period</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0.5}
                      max={5}
                      step={0.5}
                      value={t3Delay}
                      onChange={(e) => setT3Delay(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">Y</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={t3Delay}
                  onChange={(e) => setT3Delay(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-data text-slate-500 mt-1">
                  <span>6 Months (0.5Y)</span>
                  <span>2 Years</span>
                  <span>5 Years</span>
                </div>
              </div>

              {/* Total Planned Horizon */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Total Planned Horizon</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={3}
                      max={35}
                      step={1}
                      value={t3Horizon}
                      onChange={(e) => setT3Horizon(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">Y</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={3}
                  max={35}
                  step={1}
                  value={t3Horizon}
                  onChange={(e) => setT3Horizon(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Expected CAGR */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Expected CAGR</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={6}
                      max={25}
                      step={0.5}
                      value={t3Return}
                      onChange={(e) => setT3Return(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={6}
                  max={25}
                  step={0.5}
                  value={t3Return}
                  onChange={(e) => setT3Return(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Outputs */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0f172a]/60 flex flex-col justify-between space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/15 to-red-900/5 border border-red-500/35">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 font-mono-data mb-1">
                  <Clock className="w-3.5 h-3.5 text-red-400" />
                  <span>Procrastination Tax (Wealth Lost to Waiting)</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-data">
                  {formatINR(t3Data.lostWealth)}
                </div>
                <div className="text-xs text-red-300 mt-1 font-sans">
                  {t3Data.lossPct.toFixed(1)}% of your potential final wealth destroyed by waiting {t3Delay} years
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-emerald-500/40">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono-data">
                    Started Today
                  </div>
                  <div className="text-lg font-bold text-emerald-400 font-mono-data mt-1">
                    {formatINR(t3Data.fvToday)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t3Data.fvToday)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono-data">
                    Delayed Start
                  </div>
                  <div className="text-lg font-bold text-white font-mono-data mt-1">
                    {formatINR(t3Data.fvDelayed)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t3Data.fvDelayed)}
                  </div>
                </div>

                <div className="col-span-2 p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 font-mono-data">
                    Installments Missed vs Compounding Penalty
                  </div>
                  <div className="text-sm font-bold text-slate-200 font-mono-data mt-1">
                    Saved {formatINR(t3Data.missedInstallments)} out-of-pocket, but lost {formatINR(t3Data.lostWealth - t3Data.missedInstallments)} in compounding gains!
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#334155] space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono-data mb-1 text-emerald-400">
                    <span>Started Today Corpus</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono-data mb-1 text-red-400">
                    <span>Delayed Portfolio Retained</span>
                    <span>{t3Data.retainedRatio.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-600 to-slate-400"
                      style={{ width: `${Math.min(100, Math.max(5, t3Data.retainedRatio))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SIP vs Lumpsum */}
        {activeTab === "sip-vs-lumpsum" && (
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#334155]">
              {/* Lumpsum Amount */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">One-Time Lumpsum Principal</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₹</span>
                    <input
                      type="number"
                      min={10000}
                      max={2500000}
                      step={10000}
                      value={t4Lump}
                      onChange={(e) => setT4Lump(Number(e.target.value))}
                      className="w-36 bg-[#0f172a] border border-[#475569] rounded-lg pl-6 pr-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={2500000}
                  step={10000}
                  value={t4Lump}
                  onChange={(e) => setT4Lump(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-data text-slate-500 mt-1">
                  <span>₹10,000</span>
                  <span>₹10,00,000</span>
                  <span>₹25,00,000</span>
                </div>
              </div>

              {/* Monthly SIP Amount */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Equivalent Monthly SIP</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₹</span>
                    <input
                      type="number"
                      min={1000}
                      max={100000}
                      step={500}
                      value={t4Sip}
                      onChange={(e) => setT4Sip(Number(e.target.value))}
                      className="w-32 bg-[#0f172a] border border-[#475569] rounded-lg pl-6 pr-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={500}
                  value={t4Sip}
                  onChange={(e) => setT4Sip(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Time Horizon */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Investment Horizon</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      step={1}
                      value={t4Years}
                      onChange={(e) => setT4Years(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">Y</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={t4Years}
                  onChange={(e) => setT4Years(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Expected Return */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Expected Annual Return (CAGR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={5}
                      max={25}
                      step={0.5}
                      value={t4Return}
                      onChange={(e) => setT4Return(Number(e.target.value))}
                      className="w-28 bg-[#0f172a] border border-[#475569] rounded-lg pr-7 pl-3 py-1.5 text-right font-mono-data text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={0.5}
                  value={t4Return}
                  onChange={(e) => setT4Return(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Outputs */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0f172a]/60 flex flex-col justify-between space-y-6">
              <div
                className={`p-4 rounded-xl border ${
                  t4Data.isLumpAhead
                    ? "bg-gradient-to-br from-cyan-500/15 to-cyan-900/5 border-cyan-500/35"
                    : "bg-gradient-to-br from-emerald-500/15 to-emerald-900/5 border-emerald-500/35"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider font-mono-data mb-1 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {t4Data.isLumpAhead
                      ? "Lumpsum Yields Higher Corpus"
                      : "Monthly SIP Yields Higher Corpus"}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-data">
                  +{formatINR(t4Data.diff)}
                </div>
                <div className="text-xs text-slate-300 mt-1 font-sans">
                  {t4Data.isLumpAhead
                    ? `Lumpsum captures full compounding from Day 1, outperforming SIP by ${formatIndianWords(t4Data.diff)}`
                    : `Cumulative SIP inflows accumulate larger principal, outperforming by ${formatIndianWords(t4Data.diff)}`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-cyan-500/40">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 font-mono-data">
                    Lumpsum Corpus
                  </div>
                  <div className="text-lg font-bold text-cyan-400 font-mono-data mt-1">
                    {formatINR(t4Data.fvLump)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t4Data.fvLump)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-emerald-500/40">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono-data">
                    Monthly SIP Corpus
                  </div>
                  <div className="text-lg font-bold text-emerald-400 font-mono-data mt-1">
                    {formatINR(t4Data.fvSip)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {formatIndianWords(t4Data.fvSip)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono-data">
                    Lumpsum Invested
                  </div>
                  <div className="text-sm font-bold text-slate-200 font-mono-data mt-1">
                    {formatINR(t4Lump)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Day 1 upfront allocation
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 font-mono-data">
                    Total SIP Invested
                  </div>
                  <div className="text-sm font-bold text-slate-200 font-mono-data mt-1">
                    {formatINR(t4Data.totalSipInvested)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Across {t4Data.totalMonths} monthly installments
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#334155] space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono-data mb-1 text-cyan-400">
                    <span>Lumpsum Corpus</span>
                    <span>{t4Data.lumpRatio.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                      style={{ width: `${t4Data.lumpRatio}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono-data mb-1 text-emerald-400">
                    <span>SIP Corpus</span>
                    <span>{t4Data.sipRatio.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                      style={{ width: `${t4Data.sipRatio}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Educational Disclaimer Footer */}
        <div className="p-4 sm:px-8 bg-[#0b1120] border-t border-[#334155] flex items-center gap-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong>Statutory Notice:</strong> Strictly for investor education. Projections assume constant CAGR and monthly compounding. Direct plan savings compound over time because distributor trail commissions are never deducted from daily NAV. Mutual fund investments are subject to market risks.
          </span>
        </div>
      </div>

      {/* Suggested Reading & In-Depth Research Section */}
      {relatedArticles.length > 0 && (
        <div className="mt-12 pt-8 border-t border-[#EAE8E0]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold font-serif-editorial text-stone-900">
                Related Mutual Fund Research Notes
              </h2>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Understand the math behind Total Expense Ratio (TER), active vs index performance, and AMFI data transparency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => onNavigateArticle && onNavigateArticle(art)}
                className="group cursor-pointer p-4 rounded-xl bg-white border border-[#EAE8E0] hover:border-emerald-600/40 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
                    {art.category}
                  </span>
                  <h3 className="font-serif-editorial text-sm font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-stone-600 font-sans line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono-data text-stone-500">
                  <span>{art.readTimeMinutes} min read</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold group-hover:translate-x-1 transition-transform">
                    Read Analysis <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
