import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  BookMarked,
  Link as LinkIcon,
  Check,
  Tag,
  ArrowRight,
  Filter,
  Calculator,
  Compass,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { ToolLayout } from "./ToolLayout";
import { SiteSettings, ArticleCategory } from "../types";
import { GLOSSARY_TERMS, GlossaryTerm } from "../data/glossaryData";

interface GlossaryPageProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onNavigateCalculators?: () => void;
  onNavigateFAQ?: () => void;
  onNavigateGlossary?: () => void;
  onNavigateGuides?: () => void;
  onSelectCategory?: (category: ArticleCategory | "all") => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function GlossaryPage({
  settings,
  onNavigateHome,
  onNavigateCalculators,
  onNavigateFAQ,
  onNavigateGlossary,
  onNavigateGuides,
  onSelectCategory,
  onSearchChange,
  searchQuery = "",
}: GlossaryPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Clusters list
  const clusters = useMemo(() => {
    const list = Array.from(new Set(GLOSSARY_TERMS.map((t) => t.cluster)));
    return ["all", ...list.sort()];
  }, []);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return GLOSSARY_TERMS.filter((item) => {
      // Cluster filter
      if (selectedCluster !== "all" && item.cluster !== selectedCluster) {
        return false;
      }
      // Search filter
      if (query) {
        const matchName = item.term.toLowerCase().includes(query);
        const matchAbbr = item.abbreviation?.toLowerCase().includes(query);
        const matchDef = item.definition.toLowerCase().includes(query);
        const matchCluster = item.cluster.toLowerCase().includes(query);
        return matchName || matchAbbr || matchDef || matchCluster;
      }
      return true;
    });
  }, [searchTerm, selectedCluster]);

  // Set of available letters in the current filtered terms
  const availableLetters = useMemo(() => {
    return new Set(filteredTerms.map((t) => t.letter.toUpperCase()));
  }, [filteredTerms]);

  // Group terms by letter
  const groupedTerms = useMemo(() => {
    const map: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach((term) => {
      const letter = term.letter.toUpperCase();
      if (!map[letter]) {
        map[letter] = [];
      }
      map[letter].push(term);
    });
    return map;
  }, [filteredTerms]);

  const activeGroupLetters = Object.keys(groupedTerms).sort();

  // Scroll to hash on mount if present
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(hashId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, []);

  // Handle Copy Anchor Link
  const handleCopyAnchor = (termId: string) => {
    const url = `${window.location.origin}/glossary#${termId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(termId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Jump to letter
  const handleJumpToLetter = (letter: string) => {
    const el = document.getElementById(`letter-section-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Inject DefinedTermSet & DefinedTerm Schema.org JSON-LD
  useEffect(() => {
    const scriptId = "glossary-definedterms-jsonld";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const definedTermsArray = GLOSSARY_TERMS.map((term) => ({
      "@type": "DefinedTerm",
      "@id": `https://www.yieldnest.online/glossary#${term.id}`,
      "name": term.term,
      "description": term.definition,
      "termCode": term.abbreviation || term.id,
      "url": `https://www.yieldnest.online/glossary#${term.id}`,
      "inDefinedTermSet": "https://www.yieldnest.online/glossary#terms",
    }));

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "DefinedTermSet",
          "@id": "https://www.yieldnest.online/glossary#terms",
          "name": "Indian Mutual Fund Investor Educational Glossary",
          "description": "Comprehensive reference glossary defining over 50 essential Indian mutual fund terms, regulatory metrics, valuation methodologies, and operational mechanisms under SEBI and AMFI guidelines.",
          "url": "https://www.yieldnest.online/glossary",
          "hasDefinedTerm": definedTermsArray,
        },
        {
          "@type": "BreadcrumbList",
          "@id": "https://www.yieldnest.online/glossary#breadcrumb",
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
              "name": "Glossary",
              "item": "https://www.yieldnest.online/glossary",
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

  return (
    <ToolLayout
      title="Mutual Fund Glossary: Key Terms & Definitions"
      intro="An authoritative, evidence-based reference encyclopedia of over 50 essential Indian mutual fund terms. Strictly educational definitions covering SEBI regulatory frameworks, NAV valuation formulas, expense drag, and redemption settlement rules."
      badge="Comprehensive Regulatory Dictionary"
      settings={settings}
      onNavigateHome={onNavigateHome}
      onNavigateCalculators={onNavigateCalculators}
      onNavigateFAQ={onNavigateFAQ}
      onNavigateGlossary={onNavigateGlossary}
      onNavigateGuides={onNavigateGuides}
      onSelectCategory={onSelectCategory}
      onSearchChange={onSearchChange}
      searchQuery={searchQuery}
      activeMenu="glossary"
      breadcrumbs={[{ label: "Glossary" }]}
    >
      <div className="space-y-8">
        {/* Search & Filter Bar */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Instant Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search term (e.g. NAV, ISIN, CAN, IDCW, exit load, TER, SEBI, SIP)..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-sans"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-600 px-1 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Cluster Dropdown / Filter Selector */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-500 shrink-0 hidden sm:block" />
              <select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                aria-label="Filter glossary terms by cluster"
                className="w-full sm:w-auto px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs font-mono-data focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {clusters.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All Clusters (53 Terms)" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
            <span className="text-stone-400 font-mono-data text-[11px] uppercase mr-1">Clusters:</span>
            {clusters.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCluster(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-data transition-colors cursor-pointer ${
                  selectedCluster === c
                    ? "bg-emerald-800 text-white font-semibold"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>

        {/* Sticky A-Z Alphabetical Jump Bar */}
        <div className="sticky top-14 z-20 bg-[#FAF9F5]/95 backdrop-blur-md py-2.5 px-3 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-1 overflow-x-auto select-none">
          <span className="text-[10px] font-mono-data uppercase tracking-wider text-stone-400 font-semibold px-2 shrink-0">
            A-Z Jump:
          </span>
          <div className="flex items-center gap-1">
            {ALPHABET.map((char) => {
              const hasTerms = availableLetters.has(char);
              return (
                <button
                  key={char}
                  disabled={!hasTerms}
                  onClick={() => handleJumpToLetter(char)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono-data font-bold flex items-center justify-center transition-all ${
                    hasTerms
                      ? "text-stone-900 hover:bg-emerald-700 hover:text-white cursor-pointer bg-white border border-stone-200/70 shadow-2xs"
                      : "text-stone-300 bg-transparent cursor-not-allowed border border-transparent"
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter Header */}
        <div className="flex items-center justify-between text-xs font-mono-data text-stone-500 px-1">
          <div>
            Showing <strong className="text-stone-900">{filteredTerms.length}</strong> of{" "}
            {GLOSSARY_TERMS.length} defined terms
          </div>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCluster("all");
              }}
              className="text-emerald-800 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Alphabetical Sections List */}
        {activeGroupLetters.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
            <BookMarked className="w-8 h-8 text-stone-400 mx-auto" />
            <div className="text-stone-800 font-bold text-sm">No glossary terms match your search</div>
            <p className="text-stone-500 text-xs max-w-sm mx-auto">
              We couldn&apos;t find any terms matching &quot;{searchTerm}&quot;. Try searching for general terms like NAV, SIP, TER, or SEBI.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCluster("all");
              }}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-mono-data font-semibold hover:bg-emerald-800 transition-colors"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {activeGroupLetters.map((letter) => {
              const terms = groupedTerms[letter] || [];
              return (
                <section
                  key={letter}
                  id={`letter-section-${letter}`}
                  className="space-y-4 scroll-mt-28"
                >
                  {/* Letter Header */}
                  <div className="flex items-center gap-3 border-b-2 border-stone-200 pb-2">
                    <span className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-mono-data text-sm font-bold shadow-xs">
                      {letter}
                    </span>
                    <span className="text-xs font-mono-data text-stone-400 uppercase tracking-wider">
                      {terms.length} {terms.length === 1 ? "term" : "terms"}
                    </span>
                  </div>

                  {/* Terms Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {terms.map((item) => (
                      <article
                        key={item.id}
                        id={item.id}
                        className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500/80 hover:shadow-xs transition-all duration-200 flex flex-col justify-between space-y-3 scroll-mt-32 target:ring-2 target:ring-emerald-500 target:bg-emerald-50/20"
                      >
                        <div className="space-y-2.5">
                          {/* Top Row: Abbreviation / Cluster badge & Anchor link */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-mono-data font-semibold uppercase tracking-wider">
                              <Tag className="w-2.5 h-2.5 text-stone-500" />
                              <span>{item.cluster}</span>
                            </span>

                            <button
                              onClick={() => handleCopyAnchor(item.id)}
                              title="Copy direct link to this term"
                              className="inline-flex items-center gap-1 text-[11px] font-mono-data text-stone-400 hover:text-emerald-700 transition-colors cursor-pointer p-1 rounded hover:bg-stone-100"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold text-[10px]">Copied</span>
                                </>
                              ) : (
                                <>
                                  <LinkIcon className="w-3.5 h-3.5" />
                                  <span className="text-[10px]">#{item.id}</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Term Name */}
                          <h3 className="font-serif-editorial text-lg font-bold text-stone-950 leading-snug">
                            {item.term}
                          </h3>

                          {/* Definition (strictly 40-80 words) */}
                          <p className="text-stone-700 text-xs sm:text-sm font-sans leading-relaxed">
                            {item.definition}
                          </p>
                        </div>

                        {/* Bottom Row: Related Links or Calculator Shortcuts */}
                        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          {item.relatedTerms && item.relatedTerms.length > 0 && (
                            <div className="flex items-center gap-1 text-stone-500 font-mono-data">
                              <span className="text-stone-400">See:</span>
                              {item.relatedTerms.slice(0, 3).map((relId) => (
                                <a
                                  key={relId}
                                  href={`#${relId}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const target = document.getElementById(relId);
                                    if (target) {
                                      target.scrollIntoView({ behavior: "smooth", block: "center" });
                                      window.history.pushState(null, "", `#${relId}`);
                                    }
                                  }}
                                  className="text-emerald-800 hover:underline hover:text-emerald-950 uppercase font-semibold"
                                >
                                  {relId}
                                </a>
                              ))}
                            </div>
                          )}

                          {item.relatedCalculatorUrl && (
                            <a
                              href={item.relatedCalculatorUrl}
                              onClick={(e) => {
                                e.preventDefault();
                                if (onNavigateCalculators && item.relatedCalculatorUrl) {
                                  window.history.pushState({}, "", item.relatedCalculatorUrl);
                                  window.dispatchEvent(new PopStateEvent("popstate"));
                                }
                              }}
                              className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-mono-data font-semibold hover:underline"
                            >
                              <Calculator className="w-3 h-3 text-emerald-600" />
                              <span>{item.relatedCalculatorName || "Calculator"}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
