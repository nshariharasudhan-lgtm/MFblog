import React, { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { ArticleCategory, SiteSettings } from "../types";
import { YieldNestLogo } from "./YieldNestLogo";

interface NavbarProps {
  currentCategory: ArticleCategory | "all";
  onSelectCategory: (category: ArticleCategory | "all") => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  settings: SiteSettings;
  onNavigateHome: () => void;
}

export function Navbar({
  currentCategory,
  onSelectCategory,
  onSearchChange,
  searchQuery,
  onNavigateHome,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: Array<{ id: ArticleCategory | "all"; label: string }> = [
    { id: "all", label: "All Research" },
    { id: "Fund Comparison", label: "Fund Comparisons" },
    { id: "Performance Analysis", label: "Performance Audits" },
    { id: "Market Trends", label: "Market Trends" },
    { id: "Category Deep-Dive", label: "Category Audits" },
    { id: "SIP Strategies", label: "SIP Tactics" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/98 backdrop-blur-md border-b border-[#EAE8E0] transition-colors shadow-2xs">
      {/* Slim Persistent Regulatory Notice */}
      <div className="bg-[#1C1A17] text-stone-300 text-[10px] sm:text-[11px] font-mono-data py-1 px-3 border-b border-stone-800 flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
        <span className="truncate">
          <strong className="text-stone-200">Statutory Notice:</strong> Not SEBI or AMFI registered • Strictly for investor education
        </span>
      </div>

      {/* Main Centered Masthead */}
      <div className="max-w-6xl mx-auto px-4 pt-4 sm:pt-6 pb-3 sm:pb-4 flex flex-col items-center justify-center relative">
        {/* Search bar pinned to top-right on desktop */}
        <div className="absolute top-4 sm:top-5 right-4 hidden md:flex items-center">
          <div className="relative w-52 lg:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C887B]" />
            <input
              type="text"
              placeholder="Search mutual funds..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#F0EEE6] text-xs rounded-full pl-8 pr-3 py-1.5 border border-transparent focus:border-[#C4C0B3] focus:bg-white focus:outline-none transition-all placeholder:text-[#9E9B90]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C887B] hover:text-black text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Mobile controls */}
        <div className="w-full flex items-center justify-between sm:hidden mb-2">
          <div className="relative flex-1 mr-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C887B]" />
            <input
              type="text"
              placeholder="Search funds..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#F0EEE6] text-[11px] rounded-full pl-7 pr-3 py-1 border border-stone-200 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-[#4A4740] hover:text-black shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-stone-800" />}
          </button>
        </div>

        {/* Centered Site Logo */}
        <div
          onClick={onNavigateHome}
          className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] text-center"
          title="YieldNest.online - Return to Homepage"
        >
          <YieldNestLogo size="md" showTagline={true} />
        </div>
      </div>

      {/* Category Navigation Tabs Below Logo - Centered */}
      <nav className="w-full border-t border-[#EAE8E0] bg-[#FAF9F5] py-2 px-4 hidden sm:block">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-1 sm:gap-2 text-xs whitespace-nowrap overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-md transition-all font-medium text-xs tracking-wide ${
                currentCategory === cat.id
                  ? "bg-[#1A1A1A] text-white shadow-xs font-semibold"
                  : "text-[#5A574E] hover:text-[#1A1A1A] hover:bg-[#EFECE3]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FAF9F5] border-t border-[#EAE8E0] px-4 py-3 space-y-2 shadow-inner">
          <div className="text-[10px] font-mono-data text-stone-500 uppercase tracking-wider pb-1">
            Research Categories
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-center px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentCategory === cat.id
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-white border border-stone-200 text-[#4A4740] hover:bg-[#EFECE3]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
