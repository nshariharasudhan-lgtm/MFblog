import React from "react";
import { ShieldAlert, ArrowLeft, ChevronRight } from "lucide-react";
import { ArticleCategory, SiteSettings } from "../types";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface ToolLayoutProps {
  title: string;
  intro?: string;
  badge?: string;
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
  settings: SiteSettings;
  currentCategory?: ArticleCategory | "all";
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  onNavigateHome: () => void;
  onNavigateCalculators?: () => void;
  onNavigateCalculator?: (target: string) => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: () => void;
  onNavigateHubs?: () => void;
  activeMenu?: "calculators" | "faq" | "glossary" | "guides" | "categories" | "none";
}

export function ToolLayout({
  title,
  intro,
  badge,
  breadcrumbs,
  children,
  settings,
  currentCategory = "all",
  onSelectCategory = () => {},
  onSearchChange = () => {},
  searchQuery = "",
  onNavigateHome,
  onNavigateCalculators,
  onNavigateCalculator,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onNavigateHubs,
  activeMenu = "none",
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Navbar */}
      <Navbar
        currentCategory={currentCategory}
        onSelectCategory={onSelectCategory}
        onSearchChange={onSearchChange}
        searchQuery={searchQuery}
        settings={settings}
        onNavigateHome={onNavigateHome}
        isCalculatorView={activeMenu === "calculators"}
        onNavigateCalculators={onNavigateCalculators}
        activeMenu={activeMenu}
        onNavigateFAQ={onNavigateFAQ}
        onNavigateGlossary={onNavigateGlossary}
        onNavigateGuides={onNavigateGuides}
      />

      {/* Main Page Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-[11px] font-mono-data text-stone-500 overflow-x-auto whitespace-nowrap pb-1">
          <a
            href="/"
            onClick={(e) => {
              if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                onNavigateHome();
              }
            }}
            className="hover:text-stone-900 transition-colors cursor-pointer flex items-center gap-1 text-inherit no-underline"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Home</span>
          </a>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
              {crumb.onClick || crumb.href ? (
                <a
                  href={crumb.href || "/calculators"}
                  onClick={(e) => {
                    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && crumb.onClick) {
                      e.preventDefault();
                      crumb.onClick();
                    }
                  }}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-inherit no-underline"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-stone-800 font-semibold truncate max-w-[240px]">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Page Header Header */}
        <header className="space-y-3 pb-6 border-b border-[#EAE8E0]">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-200/80 text-stone-800 text-[10px] font-mono-data uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>{badge}</span>
            </div>
          )}
          <h1 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 tracking-tight leading-[1.15]">
            {title}
          </h1>
          {intro && (
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-3xl font-sans">
              {intro}
            </p>
          )}
        </header>

        {/* Dynamic Tool / Page Content */}
        <div className="w-full">
          {children}
        </div>

        {/* Global Statutory Disclaimer Footer Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE8E0] text-xs text-stone-600 leading-relaxed flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="m-0 font-sans">
            <strong className="text-stone-900">Regulatory Disclaimer:</strong> Mutual fund investments are subject to market risks. Read all scheme-related documents carefully. This site is for education only and is not investment advice. Past performance does not guarantee future returns.
          </p>
        </div>
      </main>

      {/* Global Footer */}
      <Footer
        settings={settings}
        onSelectCategory={onSelectCategory}
        onNavigateCalculators={onNavigateCalculators}
        onNavigateCalculator={onNavigateCalculator}
        onNavigateFAQ={onNavigateFAQ}
        onNavigateGlossary={onNavigateGlossary}
        onNavigateGuides={onNavigateGuides}
        onNavigateHubs={onNavigateHubs}
      />
    </div>
  );
}
