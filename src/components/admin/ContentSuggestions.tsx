import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, ArrowUpRight, TrendingUp, BarChart2 } from "lucide-react";
import { ContentSuggestion } from "../../types";
import { getAdminAuthHeaders } from "../../lib/storage";

interface ContentSuggestionsProps {
  onDraftSuggestion: (suggestion: ContentSuggestion) => void;
}

export function ContentSuggestions({ onDraftSuggestion }: ContentSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/content-suggestions", {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error("Suggestions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif-editorial text-stone-900 font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>AI-Driven Editorial Topic Suggestions</span>
          </h2>
          <p className="text-xs text-stone-500 font-mono-data">
            Trending mutual fund themes modeled on recent AMFI liquidity updates, SPIVA data, and SEBI regulations.
          </p>
        </div>

        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Generating Ideas..." : "Refresh Suggestions"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((sug, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-[#EAE8E0] hover:border-[#D9D6C9] hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="bg-[#FAF9F5] text-stone-700 font-mono-data text-[11px] font-medium px-2 py-0.5 rounded border border-stone-200">
                  {sug.category}
                </span>
                <span className="text-emerald-700 bg-emerald-50 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Traffic: {sug.estimatedTraffic}
                </span>
              </div>

              <h3 className="font-serif-editorial text-lg sm:text-xl font-semibold text-stone-900 leading-snug">
                {sug.title}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                {sug.hook}
              </p>
            </div>

            <div className="pt-3 border-t border-[#F0EEE6] flex items-center justify-between">
              {sug.amfiSchemeCodes && sug.amfiSchemeCodes.length > 0 ? (
                <span className="text-[11px] font-mono-data text-indigo-700 flex items-center gap-1">
                  <BarChart2 className="w-3 h-3" />
                  {sug.amfiSchemeCodes.length} AMFI Schemes targeted
                </span>
              ) : (
                <span className="text-[11px] font-mono-data text-stone-400">Industry Macro Topic</span>
              )}

              <button
                onClick={() => onDraftSuggestion(sug)}
                className="bg-[#1A1A1A] hover:bg-black text-white text-xs px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
              >
                <span>Draft Article</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
