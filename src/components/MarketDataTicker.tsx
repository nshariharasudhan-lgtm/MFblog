import React from "react";
import { TrendingUp, RefreshCw, ShieldCheck, Clock } from "lucide-react";
import { useMarketDataSync } from "../hooks/useMarketDataSync";

export function MarketDataTicker() {
  const { marketData, isSyncing, lastSynced, cacheAgeHours, isStale, refresh, eeatCompliance } =
    useMarketDataSync();

  const indices = marketData?.indices || [];

  return (
    <div className="bg-[#161513] text-stone-300 border-b border-stone-800/80 py-1.5 px-4 text-[11px] font-mono-data">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        {/* Indices & Mutual Fund Snapshot */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="flex items-center gap-1.5 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Market Feed:</span>
          </div>

          {indices.slice(0, 3).map((idx) => {
            const isPos = idx.change >= 0;
            return (
              <div key={idx.name} className="flex items-center gap-1.5">
                <span className="text-stone-300 font-medium">{idx.name}</span>
                <span className="text-stone-100 font-semibold">
                  {idx.value.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isPos ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPos ? "+" : ""}
                  {idx.percentChange}%
                </span>
              </div>
            );
          })}
        </div>

        {/* EEAT 4-Hour Compliance Status & Sync Indicator */}
        <div className="flex items-center gap-2.5 shrink-0 text-[10px]">
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
              isStale
                ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                : "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
            }`}
            title={eeatCompliance.statusText}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">EEAT Compliance:</span>
            <span>
              {isSyncing
                ? "Updating..."
                : isStale
                ? "Sync Pending (>4h)"
                : `Verified (${cacheAgeHours}h)`}
            </span>
          </div>

          {lastSynced && (
            <div className="hidden md:flex items-center gap-1 text-stone-500 text-[10px]">
              <Clock className="w-2.5 h-2.5" />
              <span>
                {lastSynced.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          <button
            onClick={() => refresh()}
            disabled={isSyncing}
            className="text-stone-400 hover:text-stone-200 transition-colors p-1 rounded hover:bg-stone-800 disabled:opacity-50"
            title="Trigger soft background update of market data"
            aria-label="Refresh market data"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
