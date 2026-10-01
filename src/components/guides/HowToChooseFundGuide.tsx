import React, { useState } from "react";
import {
  CheckSquare,
  HelpCircle,
  ShieldCheck,
  Compass,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Layers,
  Calculator,
  BookMarked,
  Printer,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { ToolLayout } from "../ToolLayout";
import { SiteSettings, ArticleCategory } from "../../types";
import {
  DUE_DILIGENCE_CHECKLIST,
  QUIZ_QUESTIONS,
  evaluateFundCategoryRecommendations,
  FundCategoryResult,
} from "../../data/guidesData";

interface HowToChooseFundGuideProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onNavigateCalculators?: () => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: () => void;
  onNavigateHub?: (slug?: string) => void;
  onNavigateRedemptionChecklist?: () => void;
  onSearchChange?: (q: string) => void;
  searchQuery?: string;
}

export function HowToChooseFundGuide({
  settings,
  onNavigateHome,
  onSelectCategory,
  onNavigateCalculators,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onNavigateHub,
  onNavigateRedemptionChecklist,
  onSearchChange,
  searchQuery,
}: HowToChooseFundGuideProps) {
  // Navigation active tab: 'checklist' | 'quiz'
  const [activeTab, setActiveTab] = useState<"checklist" | "quiz">("checklist");

  // Checklist interactive state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [checklistFilter, setChecklistFilter] = useState<string>("all");

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({
    goal: "wealth_building",
    horizon: "h_5_to_7",
    drawdown_reaction: "r_stay_calm",
    priority: "p_balanced_growth",
    inflow_mode: "mode_sip",
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Toggle checklist item
  const handleToggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle detail expander
  const handleToggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Select all or reset
  const handleResetChecklist = () => {
    setCheckedItems({});
  };

  const handleSelectAllChecklist = () => {
    const allChecked: Record<string, boolean> = {};
    DUE_DILIGENCE_CHECKLIST.forEach((item) => {
      allChecked[item.id] = true;
    });
    setCheckedItems(allChecked);
  };

  // Checklist score calculation
  const totalChecks = DUE_DILIGENCE_CHECKLIST.length;
  const completedChecks = Object.values(checkedItems).filter(Boolean).length;
  const completionPercentage = Math.round((completedChecks / totalChecks) * 100);

  // Filter checklist
  const filteredChecklist =
    checklistFilter === "all"
      ? DUE_DILIGENCE_CHECKLIST
      : DUE_DILIGENCE_CHECKLIST.filter((item) => item.category === checklistFilter);

  // Quiz Evaluation
  const quizResult = evaluateFundCategoryRecommendations(quizAnswers);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
  };

  return (
    <ToolLayout
      title="How to Choose a Mutual Fund: 10-Point Checklist & Category Evaluation"
      intro="An evidence-backed educational guide featuring an interactive pre-investment due diligence checklist and a goal-horizon evaluation engine that maps your profile to official SEBI fund categories without endorsing specific commercial schemes."
      badge="Investor Educational Guide"
      activeMenu="guides"
      breadcrumbs={[
        { label: "Guides Hub", href: "/guides", onClick: onNavigateGuides },
        { label: "How to Choose a Mutual Fund" },
      ]}
      settings={settings}
      onNavigateHome={onNavigateHome}
      onSelectCategory={onSelectCategory}
      onNavigateCalculators={onNavigateCalculators}
      onNavigateFAQ={onNavigateFAQ}
      onNavigateGlossary={onNavigateGlossary}
      onNavigateGuides={onNavigateGuides}
      onNavigateHubs={onNavigateHub ? () => onNavigateHub() : undefined}
      onSearchChange={onSearchChange}
      searchQuery={searchQuery}
    >
      <div className="space-y-8 font-serif-editorial">
        {/* Statutory Regulatory Header Box */}
        <div className="bg-[#FAF9F5] border border-[#EAE8E0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs font-sans leading-relaxed text-stone-700">
            <strong className="text-stone-900 font-semibold">Strict SEBI Categorization Compliance Notice:</strong>{" "}
            This tool educates investors on evaluating investment horizons, expense drag, and risk tolerance. All recommendations output{" "}
            <strong>broad SEBI-mandated fund categories</strong> (e.g. Liquid, Index, Aggressive Hybrid, Flexi-Cap) with structural reasons and inherent risks.{" "}
            <span className="text-stone-900 font-semibold underline decoration-emerald-600/40">
              YieldNest is purely educational, not SEBI-registered, and never names or promotes specific commercial mutual fund schemes or AMCs.
            </span>
          </div>
        </div>

        {/* View Switcher Tabs (Checklist vs Quiz) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#EAE8E0] pb-4">
          <div className="inline-flex rounded-xl bg-stone-200/70 p-1 border border-stone-300">
            <button
              onClick={() => setActiveTab("checklist")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === "checklist"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              <ListChecks className="w-4 h-4 text-emerald-700" />
              <span>10-Point Due Diligence Checklist</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono-data bg-emerald-100 text-emerald-800">
                {completedChecks}/{totalChecks}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-700" />
              <span>Goal &amp; Risk-Profile Category Quiz</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono-data bg-indigo-100 text-indigo-800">
                5 Steps
              </span>
            </button>
          </div>

          {/* Quick links to companion tools */}
          <div className="flex items-center gap-2 text-xs font-sans">
            {onNavigateRedemptionChecklist && (
              <button
                onClick={onNavigateRedemptionChecklist}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors shadow-2xs font-medium cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-stone-500" />
                <span>Printable Redemption Checklist</span>
                <ArrowRight className="w-3 h-3 text-stone-400" />
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: 10-POINT DUE DILIGENCE CHECKLIST */}
        {activeTab === "checklist" && (
          <div className="space-y-6">
            {/* Checklist Progress Header Card */}
            <div className="bg-white border border-[#EAE8E0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono-data text-emerald-800 uppercase tracking-wider font-semibold">
                    Investor Pre-Flight Audit
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-editorial text-stone-900">
                    Pre-Investment Due Diligence Checklist
                  </h2>
                  <p className="text-xs font-sans text-stone-600 mt-1 max-w-2xl">
                    Run through these 10 objective checks before committing capital or setting up a monthly SIP. Verify expense ratios, horizon alignment, and downside metrics.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={handleResetChecklist}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
                    title="Clear all checkmarks"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleSelectAllChecklist}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer font-medium"
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>Check All</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar & Score */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono-data">
                  <span className="text-stone-700 font-medium">
                    Due Diligence Score:{" "}
                    <strong className="text-stone-900 font-bold">
                      {completedChecks} of {totalChecks} Checks Passed
                    </strong>{" "}
                    ({completionPercentage}%)
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      completionPercentage === 100
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : completionPercentage >= 60
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {completionPercentage === 100
                      ? "✓ High Diligence Ready"
                      : completionPercentage >= 60
                      ? "⚠️ Moderate Caution"
                      : "✕ Incomplete Due Diligence"}
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      completionPercentage === 100
                        ? "bg-emerald-600"
                        : completionPercentage >= 60
                        ? "bg-amber-500"
                        : "bg-stone-400"
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar text-xs font-sans">
                {[
                  { id: "all", label: "All 10 Checks" },
                  { id: "horizon", label: "Horizon & Liquidity" },
                  { id: "costs", label: "Costs & Direct Plan" },
                  { id: "performance", label: "Consistency & Alpha" },
                  { id: "governance", label: "Governance & Stress" },
                  { id: "tax-exit", label: "Tax & Exit Loads" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setChecklistFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                      checklistFilter === tab.id
                        ? "bg-stone-900 text-white font-medium"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist Items Accordion List */}
            <div className="space-y-3">
              {filteredChecklist.map((item) => {
                const isChecked = !!checkedItems[item.id];
                const isExpanded = !!expandedItems[item.id];

                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-xl transition-all duration-200 ${
                      isChecked
                        ? "border-emerald-300 bg-emerald-50/20 shadow-2xs"
                        : "border-[#EAE8E0] hover:border-stone-300 shadow-xs"
                    }`}
                  >
                    <div className="p-4 sm:p-5 flex items-start gap-3.5">
                      <button
                        onClick={() => handleToggleCheck(item.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isChecked
                            ? "bg-emerald-700 border-emerald-700 text-white shadow-2xs"
                            : "border-stone-400 bg-white hover:border-stone-600"
                        }`}
                        aria-label={`Toggle check for ${item.title}`}
                      >
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
                            {item.categoryLabel}
                          </span>
                          <span className="text-[11px] font-mono-data text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
                            {item.metricOrRule}
                          </span>
                        </div>

                        <h3
                          onClick={() => handleToggleCheck(item.id)}
                          className={`text-base font-bold font-serif-editorial cursor-pointer select-none ${
                            isChecked ? "text-stone-900 line-through decoration-emerald-700/50" : "text-stone-950"
                          }`}
                        >
                          {item.title}
                        </h3>

                        <p className="text-xs font-sans text-stone-600 leading-relaxed">{item.shortDesc}</p>

                        <div className="pt-1 flex items-center gap-3">
                          <button
                            onClick={() => handleToggleExpand(item.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-stone-700 hover:text-emerald-800 transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? "Hide Technical Rationale" : "View Technical Rationale & Action Step"}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Technical Explainer */}
                    {isExpanded && (
                      <div className="border-t border-stone-200/80 bg-stone-50/70 p-4 sm:p-5 rounded-b-xl space-y-3 text-xs font-sans text-stone-700">
                        <div>
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-stone-500" />
                            <span>Why This Check Matters (Quantitative Context):</span>
                          </div>
                          <p className="leading-relaxed text-stone-600 pl-5">{item.detailedRationale}</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-stone-200/80 space-y-1">
                          <strong className="text-emerald-900 block font-semibold">Immediate Action Step:</strong>
                          <p className="text-stone-700 leading-relaxed">{item.actionableStep}</p>
                        </div>

                        <div className="text-[11px] font-mono-data text-stone-500 pt-1 border-t border-stone-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3 text-stone-400" />
                          <span>Regulatory Baseline: {item.regulatoryContext}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: GOAL & RISK-PROFILE CATEGORY RECOMMENDATION QUIZ */}
        {activeTab === "quiz" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#EAE8E0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-data uppercase tracking-wider text-indigo-700 font-semibold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">
                    <Sparkles className="w-3 h-3" />
                    <span>Objective Categorization Engine</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-editorial text-stone-900 mt-1">
                    Goal &amp; Risk-Profile Fund Category Evaluator
                  </h2>
                  <p className="text-xs font-sans text-stone-600 mt-0.5 max-w-2xl">
                    Answer 5 questions regarding your horizon, emotional drawdown tolerance, and investment style to receive your optimal SEBI fund categories with structural rationale and risks.
                  </p>
                </div>
                {quizCompleted && (
                  <button
                    onClick={handleResetQuiz}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer self-start sm:self-center font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                )}
              </div>

              {/* Step indicator breadcrumbs */}
              <div className="flex items-center gap-1 pt-2 overflow-x-auto no-scrollbar">
                {QUIZ_QUESTIONS.map((q, idx) => {
                  const isCurrent = currentQuestionIndex === idx && !quizCompleted;
                  const isAnswered = !!quizAnswers[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setQuizCompleted(false);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono-data transition-all cursor-pointer whitespace-nowrap ${
                        isCurrent
                          ? "bg-indigo-700 text-white font-semibold shadow-xs"
                          : isAnswered
                          ? "bg-stone-200/80 text-stone-800 hover:bg-stone-300"
                          : "bg-stone-100 text-stone-400"
                      }`}
                    >
                      <span>Q{idx + 1}</span>
                      {isAnswered && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    </button>
                  );
                })}
                <button
                  onClick={() => setQuizCompleted(true)}
                  className={`px-3 py-1 rounded-md text-[11px] font-mono-data font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    quizCompleted
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Results →
                </button>
              </div>
            </div>

            {/* Active Question Card (if in quiz progression) */}
            {!quizCompleted && (
              <div className="bg-white border border-[#EAE8E0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
                    Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-serif-editorial text-stone-900">
                    {QUIZ_QUESTIONS[currentQuestionIndex].title}
                  </h3>
                  <p className="text-xs font-sans text-stone-600">
                    {QUIZ_QUESTIONS[currentQuestionIndex].subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt) => {
                    const isSelected = quizAnswers[QUIZ_QUESTIONS[currentQuestionIndex].id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleAnswerSelect(QUIZ_QUESTIONS[currentQuestionIndex].id, opt.id)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                            : "border-stone-200 hover:border-indigo-300 hover:bg-stone-50/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                              isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-stone-400 bg-white"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold font-serif-editorial text-stone-900">
                              {opt.label}
                            </div>
                            <div className="text-xs font-sans text-stone-600 mt-0.5 leading-relaxed">
                              {opt.sublabel}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-3 py-1.5 rounded-lg text-xs font-sans text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ← Previous Question
                  </button>
                  <button
                    onClick={() => {
                      if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
                        setCurrentQuestionIndex((prev) => prev + 1);
                      } else {
                        setQuizCompleted(true);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-sans font-semibold bg-stone-900 text-white hover:bg-black transition-colors cursor-pointer"
                  >
                    <span>{currentQuestionIndex === QUIZ_QUESTIONS.length - 1 ? "Calculate Results" : "Next Question"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* QUIZ RESULTS VIEW */}
            {quizCompleted && (
              <div className="space-y-6">
                {/* Result Summary Banner */}
                <div className="bg-gradient-to-r from-[#1e293b] via-[#1a2333] to-[#0f172a] text-white p-6 sm:p-7 rounded-2xl border border-slate-700 shadow-md space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono-data uppercase tracking-wider text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      Evaluated Profile: {quizResult.riskProfileLabel}
                    </span>
                    <span className="text-[11px] font-mono-data text-slate-300">
                      Suggested Minimum Horizon: <strong className="text-white">{quizResult.recommendedHorizon}</strong>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-serif-editorial text-white">
                    Your Optimal Allocation Strategy &amp; SEBI Categories
                  </h3>

                  <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed max-w-3xl">
                    {quizResult.allocationAdvice}
                  </p>

                  <div className="text-[11px] font-mono-data text-amber-300 pt-2 border-t border-slate-700/60 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Statutory Rule: Output is limited strictly to official SEBI fund categories. No individual commercial schemes are recommended.</span>
                  </div>
                </div>

                {/* Primary Recommended Category Card */}
                <CategoryDetailCard
                  category={quizResult.primaryCategory}
                  tierLabel="Primary Core Category"
                  badgeText="Core Recommended Anchor"
                />

                {/* Secondary Recommended Category Card */}
                <CategoryDetailCard
                  category={quizResult.secondaryCategory}
                  tierLabel="Secondary / Complementary Category"
                  badgeText="Diversification / Complementary Vehicle"
                />

                {/* Action steps */}
                <div className="p-5 rounded-2xl bg-white border border-[#EAE8E0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold font-serif-editorial text-stone-900">
                      Next Step: Ready to Evaluate Fund Schemes Within These Categories?
                    </h4>
                    <p className="text-xs font-sans text-stone-600 mt-0.5">
                      Use the 10-point checklist to screen schemes, or compare expense ratios with our Direct vs. Regular calculator.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("checklist")}
                      className="px-4 py-2 rounded-xl text-xs font-sans font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      Run 10-Point Checklist →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cross-linking to Calculators, Glossary & Topics */}
        <div className="border-t border-[#EAE8E0] pt-8 space-y-4">
          <div className="text-[11px] font-mono-data uppercase tracking-wider text-stone-500 font-semibold">
            Companion Investor Tools &amp; Reading
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => onNavigateCalculators && onNavigateCalculators()}
              className="p-4 rounded-xl border border-[#EAE8E0] bg-white hover:border-stone-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs font-bold font-serif-editorial text-stone-900 group-hover:text-emerald-800">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>Direct vs Regular TER Calculator</span>
              </div>
              <p className="text-[11px] font-sans text-stone-600 mt-1 leading-snug">
                Simulate how a 1% distributor commission difference impacts your final 20-year corpus.
              </p>
            </div>

            <div
              onClick={() => onNavigateGlossary && onNavigateGlossary()}
              className="p-4 rounded-xl border border-[#EAE8E0] bg-white hover:border-stone-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs font-bold font-serif-editorial text-stone-900 group-hover:text-emerald-800">
                <BookMarked className="w-4 h-4 text-indigo-700" />
                <span>50+ Mutual Fund Glossary</span>
              </div>
              <p className="text-[11px] font-sans text-stone-600 mt-1 leading-snug">
                Clear definitions for NAV, AUM, Alpha, Beta, Tracking Error, and Exit Load rules.
              </p>
            </div>

            {onNavigateRedemptionChecklist && (
              <div
                onClick={onNavigateRedemptionChecklist}
                className="p-4 rounded-xl border border-[#EAE8E0] bg-white hover:border-stone-400 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-bold font-serif-editorial text-stone-900 group-hover:text-emerald-800">
                  <Printer className="w-4 h-4 text-stone-700" />
                  <span>Printable Redemption Checklist</span>
                </div>
                <p className="text-[11px] font-sans text-stone-600 mt-1 leading-snug">
                  12 pre-exit verification steps covering exit loads, FIFO, cut-off times, and capital gains tax.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

// Subcomponent: Category Detail Card
function CategoryDetailCard({
  category,
  tierLabel,
  badgeText,
}: {
  category: FundCategoryResult;
  tierLabel: string;
  badgeText: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#EAE8E0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <span className="text-[10px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
            {tierLabel}
          </span>
          <h4 className="text-xl font-bold font-serif-editorial text-stone-900 mt-0.5">
            {category.categoryName}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono-data font-semibold px-2.5 py-0.5 rounded-full border ${category.badgeColor}`}>
            {badgeText}
          </span>
          <span className="text-[11px] font-mono-data bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
            Risk: {category.riskLevel}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs font-sans">
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
          <div className="font-semibold text-stone-900 mb-0.5">Official SEBI Mandated Definition:</div>
          <p className="text-stone-700 leading-relaxed">{category.mandatedAssetAllocation}</p>
        </div>

        <div>
          <div className="font-semibold text-stone-900 mb-1">Why This Category Fits Your Goals:</div>
          <p className="text-stone-700 leading-relaxed">{category.primaryRationale}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-200/80 space-y-1.5">
            <div className="text-emerald-900 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Key Category Benefits:</span>
            </div>
            <ul className="space-y-1 text-stone-700 list-disc list-inside text-[11px] leading-relaxed">
              {category.keyBenefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-200/80 space-y-1.5">
            <div className="text-rose-900 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
              <span>Inherent Risks &amp; Vulnerabilities:</span>
            </div>
            <ul className="space-y-1 text-stone-700 list-disc list-inside text-[11px] leading-relaxed">
              {category.criticalRisks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-mono-data text-stone-500">
            Suggested Minimum Horizon: <strong className="text-stone-800">{category.idealHorizon}</strong>
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-sans font-semibold text-stone-700 hover:text-stone-950 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{expanded ? "Less details" : "Who should avoid this category?"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {expanded && (
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] space-y-1">
            <strong className="text-amber-900 block font-semibold">Who Should Avoid This Category:</strong>
            <p className="text-amber-950 leading-relaxed">{category.whoShouldAvoid}</p>
            <div className="text-stone-500 font-mono-data pt-1 border-t border-amber-200/60">
              Regulatory Basis: {category.sebiClassification}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
