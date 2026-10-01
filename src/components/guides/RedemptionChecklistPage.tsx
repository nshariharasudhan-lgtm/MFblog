import React, { useState } from "react";
import {
  Printer,
  CheckSquare,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  Layers,
  FileText,
  Calendar,
  DollarSign,
  Download,
  BookOpen,
} from "lucide-react";
import { ToolLayout } from "../ToolLayout";
import { SiteSettings, ArticleCategory } from "../../types";
import { REDEMPTION_CHECKLIST, RedemptionCheckItem } from "../../data/guidesData";

interface RedemptionChecklistPageProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onNavigateCalculators?: () => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: () => void;
  onNavigateHowToChooseGuide?: () => void;
  onNavigateHub?: (slug?: string) => void;
  onSearchChange?: (q: string) => void;
  searchQuery?: string;
}

export function RedemptionChecklistPage({
  settings,
  onNavigateHome,
  onSelectCategory,
  onNavigateCalculators,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onNavigateHowToChooseGuide,
  onNavigateHub,
  onSearchChange,
  searchQuery,
}: RedemptionChecklistPageProps) {
  // Checkbox state for interactive web mode
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Optional investor notes (can be typed or printed blank)
  const [investorFolio, setInvestorFolio] = useState<string>("");
  const [schemeCategory, setSchemeCategory] = useState<string>("");
  const [redemptionAmount, setRedemptionAmount] = useState<string>("");

  const handleToggle = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReset = () => {
    setCheckedItems({});
  };

  const handleSelectAll = () => {
    const all: Record<string, boolean> = {};
    REDEMPTION_CHECKLIST.forEach((item) => {
      all[item.id] = true;
    });
    setCheckedItems(all);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const totalItems = REDEMPTION_CHECKLIST.length;
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const isAllDone = completedCount === totalItems;

  // Group items by phase
  const phases = [
    { id: "exit-load", title: "Phase 1: Exit Load & Statutory Lock-In Validation" },
    { id: "taxation", title: "Phase 2: Capital Gains Tax & Fiscal Timing" },
    { id: "banking", title: "Phase 3: Operational & Banking Readiness" },
    { id: "tracking", title: "Phase 4: Post-Redemption Tracking & Reconciliation" },
  ];

  return (
    <ToolLayout
      title="Printable Mutual Fund Redemption Checklist"
      intro="A comprehensive 12-step pre-redemption verification checklist covering exit loads, ELSS 36-month lock-ins, Section 112A capital gains tax, SEBI cut-off times, and payout bank validation. Designed for instant screen tracking or high-contrast physical printing."
      badge="Printable Investor Tool"
      activeMenu="guides"
      breadcrumbs={[
        { label: "Guides Hub", href: "/guides", onClick: onNavigateGuides },
        { label: "Redemption Checklist" },
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
      <div className="space-y-8 font-serif-editorial printable-content">
        {/* Printable Control Toolbar (Hidden in print) */}
        <div className="no-print bg-white border border-[#EAE8E0] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono-data text-emerald-800 uppercase tracking-wider font-semibold">
              Actionable Exit Safeguard
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif-editorial text-stone-900 mt-0.5">
              Redemption Pre-Flight Verification
            </h2>
            <p className="text-xs font-sans text-stone-600 mt-0.5">
              Check off items on your screen, or click Print for a clean, ink-friendly hard copy for your tax records.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-sans text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
              title="Clear all checkmarks"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-sans text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer font-medium"
            >
              <CheckSquare className="w-3.5 h-3.5 text-stone-600" />
              <span>Check All</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Checklist</span>
            </button>
          </div>
        </div>

        {/* Readiness Meter Card (Hidden in print) */}
        <div className="no-print bg-[#FAF9F5] border border-[#EAE8E0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm font-mono-data shrink-0 ${
                isAllDone
                  ? "bg-emerald-600 text-white"
                  : completedCount > 0
                  ? "bg-amber-500 text-white"
                  : "bg-stone-300 text-stone-700"
              }`}
            >
              {completedCount}/{totalItems}
            </div>
            <div>
              <div className="text-xs font-bold font-serif-editorial text-stone-900">
                {isAllDone
                  ? "All 12 Exit Safeguards Verified — Ready for Execution"
                  : completedCount > 0
                  ? `${totalItems - completedCount} Verification Items Remaining`
                  : "Verification Not Started"}
              </div>
              <div className="text-[11px] font-sans text-stone-600">
                Ensure bank details and cut-off times are confirmed before clicking submit on your broker portal.
              </div>
            </div>
          </div>

          <div className="text-xs font-mono-data text-stone-500">
            Cut-Off: <strong className="text-stone-800">1:30 PM (Liquid)</strong> •{" "}
            <strong className="text-stone-800">3:00 PM (Equity/Debt)</strong>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT WRAPPER */}
        <div className="bg-white border border-[#EAE8E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 printable-document">
          {/* Document Masthead (Formatted for pristine printing) */}
          <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-mono-data uppercase tracking-wider text-stone-500 font-semibold">
                YieldNest Investor Education Desk • Operational Audit Sheet
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-editorial text-stone-950 mt-1">
                Mutual Fund Redemption Checklist
              </h1>
              <p className="text-xs font-sans text-stone-600 mt-1">
                A formal pre-execution audit to avoid premature exit load penalties, capital gains tax surprises, and payout rejection.
              </p>
            </div>
            <div className="text-right text-[11px] font-mono-data text-stone-500 shrink-0">
              <div>Doc Ref: YN-REDEMPT-2026</div>
              <div>SEBI Circular: SEBI/HO/IMD/DF2/CIR/P/2019/42</div>
            </div>
          </div>

          {/* Fillable Metadata Table for Record Keeping */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
                Investor / Folio Holder
              </label>
              <input
                type="text"
                placeholder="e.g. Primary Holder Name"
                className="mt-1 w-full bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-800 focus:outline-none"
                value={investorFolio}
                onChange={(e) => setInvestorFolio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
                Scheme Category / Name
              </label>
              <input
                type="text"
                placeholder="e.g. Flexi-Cap Direct Growth"
                className="mt-1 w-full bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-800 focus:outline-none"
                value={schemeCategory}
                onChange={(e) => setSchemeCategory(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
                Planned Units or Rupee Amount
              </label>
              <input
                type="text"
                placeholder="e.g. All Units (or ₹50,000)"
                className="mt-1 w-full bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-800 focus:outline-none"
                value={redemptionAmount}
                onChange={(e) => setRedemptionAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono-data text-stone-500 uppercase tracking-wider font-semibold">
                Audit Date
              </label>
              <div className="mt-1 text-xs font-mono-data text-stone-800 px-2 py-1 bg-white border border-stone-300 rounded">
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Checklist Phases & Items */}
          <div className="space-y-6">
            {phases.map((phase) => {
              const phaseItems = REDEMPTION_CHECKLIST.filter((item) => item.phase === phase.id);

              return (
                <div key={phase.id} className="space-y-3 print-avoid-break">
                  <div className="flex items-center gap-2 border-b border-stone-300 pb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-900 shrink-0"></span>
                    <h3 className="text-sm sm:text-base font-bold font-serif-editorial text-stone-950 uppercase tracking-wide">
                      {phase.title}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {phaseItems.map((item) => {
                      const isChecked = !!checkedItems[item.id];

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isChecked
                              ? "bg-emerald-50/20 border-emerald-300"
                              : "bg-white border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggle(item.id)}
                              className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                isChecked
                                  ? "bg-emerald-700 border-emerald-700 text-white"
                                  : "border-stone-400 bg-white hover:border-stone-700"
                              }`}
                              aria-label={`Toggle check for ${item.title}`}
                            >
                              {isChecked ? (
                                <span className="text-xs font-bold leading-none">✓</span>
                              ) : (
                                <span className="opacity-0">.</span>
                              )}
                            </button>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4
                                  onClick={() => handleToggle(item.id)}
                                  className={`text-sm font-bold font-serif-editorial cursor-pointer select-none ${
                                    isChecked ? "text-stone-900 line-through decoration-emerald-600/50" : "text-stone-950"
                                  }`}
                                >
                                  {item.itemNumber}. {item.title}
                                </h4>
                                <span className="text-[10px] font-mono-data text-stone-500 uppercase shrink-0">
                                  YN-STEP #{item.itemNumber}
                                </span>
                              </div>

                              <p className="text-xs font-sans text-stone-700 leading-relaxed">
                                {item.instruction}
                              </p>

                              <div className="text-[11px] font-sans text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200/70 leading-relaxed mt-1">
                                <strong className="text-stone-800">Regulatory Rationale:</strong> {item.regulatoryDetail}
                              </div>

                              {item.warningNote && (
                                <div className="text-[11px] font-sans text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200 leading-relaxed flex items-start gap-1.5 mt-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Crucial Warning:</strong> {item.warningNote}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Physical Sign-off & Audit Notes Box (Ideal for physical filing) */}
          <div className="pt-4 border-t-2 border-stone-200 space-y-4 print-avoid-break">
            <div className="text-xs font-bold font-serif-editorial text-stone-900">
              Execution Sign-Off &amp; Reference Log:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
              <div className="border border-stone-300 p-3 rounded-lg h-20 flex flex-col justify-between">
                <span className="text-[10px] font-mono-data text-stone-500 uppercase">RTA Reference / Order ID:</span>
                <span className="text-stone-400 font-mono-data text-[11px]">e.g. CAMS-TXN-XXXXXXXX</span>
              </div>
              <div className="border border-stone-300 p-3 rounded-lg h-20 flex flex-col justify-between">
                <span className="text-[10px] font-mono-data text-stone-500 uppercase">Estimated Credit Date:</span>
                <span className="text-stone-400 font-mono-data text-[11px]">e.g. T+2 Business Days</span>
              </div>
              <div className="border border-stone-300 p-3 rounded-lg h-20 flex flex-col justify-between">
                <span className="text-[10px] font-mono-data text-stone-500 uppercase">Verified Signature:</span>
                <span className="border-b border-dotted border-stone-400 w-3/4"></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[10px] font-mono-data text-stone-600 leading-relaxed">
              <strong>Statutory Disclosure:</strong> Mutual fund investments are subject to market risks. Read all scheme-related documents carefully. This checklist is provided purely for investor education under SEBI and AMFI public awareness guidelines. YieldNest is not a registered investment advisor.
            </div>
          </div>
        </div>

        {/* Navigation back to How to Choose & Guides Hub */}
        <div className="no-print border-t border-[#EAE8E0] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
          <button
            onClick={onNavigateGuides}
            className="text-stone-600 hover:text-stone-900 transition-colors cursor-pointer flex items-center gap-1"
          >
            ← Return to Guides Hub
          </button>
          {onNavigateHowToChooseGuide && (
            <button
              onClick={onNavigateHowToChooseGuide}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 transition-colors cursor-pointer shadow-2xs font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>How to Choose a Mutual Fund (10-Point Checklist)</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
            </button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
