import { useState, useEffect, useCallback, useRef } from "react";
import { AMFISchemeData } from "../types";

export interface MarketIndexMetric {
  name: string;
  value: number;
  change: number;
  percentChange: number;
  updatedAt: string;
}

export interface MarketSnapshot {
  timestamp: string;
  lastUpdated?: string;
  formattedDate?: string;
  source: string;
  marketStatus?: string;
  eeatVerification: {
    status: "verified" | "stale" | "updating";
    maxCacheAgeHours: number;
    auditStandard: string;
    verifiedAt: string;
  };
  indices: MarketIndexMetric[];
  funds: AMFISchemeData[];
}

export interface EEATComplianceStatus {
  isCompliant: boolean;
  cacheAgeHours: number;
  lastVerifiedAt: string | null;
  source: string;
  standard: string;
  statusText: string;
}

export interface UseMarketDataSyncOptions {
  /**
   * Local storage key used to monitor data freshness timestamp.
   * @default "last-synced"
   */
  storageKey?: string;
  /**
   * Local storage key used to cache market data payload.
   * @default "yieldnest_market_data_cache"
   */
  cacheDataKey?: string;
  /**
   * Maximum acceptable cache age in milliseconds before triggering soft update.
   * Default: 4 hours (14,400,000 ms).
   */
  maxCacheAgeMs?: number;
  /**
   * Background polling interval to check cache freshness.
   * @default 300000 (5 minutes)
   */
  pollIntervalMs?: number;
  /**
   * Optional callback when market data is successfully refreshed.
   */
  onSyncSuccess?: (data: MarketSnapshot) => void;
  /**
   * Optional callback when background update encounters an error.
   */
  onSyncError?: (error: Error) => void;
}

export interface UseMarketDataSyncReturn {
  marketData: MarketSnapshot | null;
  lastSynced: Date | null;
  lastSyncedTimestamp: string | null;
  isStale: boolean;
  isSyncing: boolean;
  syncError: string | null;
  cacheAgeHours: number;
  eeatCompliance: EEATComplianceStatus;
  refresh: () => Promise<MarketSnapshot | null>;
}

// 4 hours in milliseconds as per EEAT financial recency requirement
export const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
export const DEFAULT_STORAGE_KEY = "last-synced";
export const DEFAULT_CACHE_KEY = "yieldnest_market_data_cache";

/**
 * Custom hook that monitors the 'last-synced' timestamp in local storage
 * and triggers a soft background update of market data if the cache exceeds 4 hours,
 * ensuring strict EEAT compliance for financial and AMFI mutual fund disclosures.
 */
export function useMarketDataSync(options: UseMarketDataSyncOptions = {}): UseMarketDataSyncReturn {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    cacheDataKey = DEFAULT_CACHE_KEY,
    maxCacheAgeMs = FOUR_HOURS_MS,
    pollIntervalMs = 5 * 60 * 1000, // Check every 5 minutes
    onSyncSuccess,
    onSyncError,
  } = options;

  const [marketData, setMarketData] = useState<MarketSnapshot | null>(() => {
    try {
      const cached = localStorage.getItem(cacheDataKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<string | null>(() => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const isSyncingRef = useRef(false);

  // Helper to parse 'last-synced' into Date object
  const parseLastSyncedDate = useCallback((raw: string | null): Date | null => {
    if (!raw) return null;
    const numeric = Number(raw);
    if (!isNaN(numeric) && numeric > 0) {
      return new Date(numeric);
    }
    const parsed = new Date(raw);
    return isNaN(parsed.getTime()) ? null : parsed;
  }, []);

  const lastSyncedDate = parseLastSyncedDate(lastSyncedTimestamp);

  // Calculate cache age and staleness against the 4-hour threshold
  const nowMs = Date.now();
  const cacheAgeMs = lastSyncedDate ? Math.max(0, nowMs - lastSyncedDate.getTime()) : Infinity;
  const cacheAgeHours = lastSyncedDate ? Number((cacheAgeMs / (1000 * 60 * 60)).toFixed(1)) : 999;
  const isStale = !lastSyncedDate || cacheAgeMs > maxCacheAgeMs;

  // Compute EEAT compliance audit structure
  const eeatCompliance: EEATComplianceStatus = {
    isCompliant: !isStale && marketData !== null,
    cacheAgeHours,
    lastVerifiedAt: lastSyncedDate ? lastSyncedDate.toISOString() : null,
    source: "AMFI India & NSE Market Feeds",
    standard: "Google EEAT YMYL Financial Accuracy (4-Hour Recency Mandate)",
    statusText: isStale
      ? `Stale (>4h old: ${cacheAgeHours}h). Soft background update triggered to restore EEAT compliance.`
      : `Verified Fresh (${cacheAgeHours}h old). Within 4-hour EEAT compliance window.`,
  };

  /**
   * Executes a soft background update of market data.
   * Soft update means:
   * 1. Runs non-blockingly without throwing errors or interrupting UX.
   * 2. Preserves existing cache while network request is in-flight.
   * 3. Seamlessly updates local storage 'last-synced' and cache on success.
   * 4. Broadcasts custom event for multi-tab and multi-component reactivity.
   */
  const performSoftBackgroundUpdate = useCallback(async (): Promise<MarketSnapshot | null> => {
    if (isSyncingRef.current) return null;
    isSyncingRef.current = true;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;

      const response = await fetch("/api/market/snapshot", {
        signal: controller?.signal,
        headers: { Accept: "application/json" },
      });
      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Market snapshot server responded with status: ${response.status}`);
      }

      const freshData = (await response.json()) as MarketSnapshot;
      const nowIso = new Date().toISOString();

      // Update Local Storage
      try {
        localStorage.setItem(storageKey, nowIso);
        localStorage.setItem(cacheDataKey, JSON.stringify(freshData));
      } catch (storageErr) {
        console.warn("[useMarketDataSync] LocalStorage write note:", storageErr);
      }

      // Update State
      setMarketData(freshData);
      setLastSyncedTimestamp(nowIso);
      setSyncError(null);

      // Notify consumer
      if (onSyncSuccess) {
        onSyncSuccess(freshData);
      }

      // Broadcast custom event for other components and active tabs
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("yieldnest:market-data-synced", {
            detail: { timestamp: nowIso, data: freshData },
          })
        );
      }

      return freshData;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update market data in background";
      console.warn("[useMarketDataSync] Soft background update note (preserving existing cache):", errorMessage);
      setSyncError(errorMessage);
      if (onSyncError) {
        onSyncError(err instanceof Error ? err : new Error(errorMessage));
      }
      return null;
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [storageKey, cacheDataKey, onSyncSuccess, onSyncError]);

  /**
   * Evaluates if 'last-synced' timestamp in local storage exceeds the 4-hour threshold
   * and triggers the soft background revalidation if necessary.
   */
  const checkAndSyncIfNeeded = useCallback(() => {
    try {
      const currentStored = localStorage.getItem(storageKey);
      const parsedDate = parseLastSyncedDate(currentStored);

      const currentTime = Date.now();
      const currentAge = parsedDate ? currentTime - parsedDate.getTime() : Infinity;

      // Update timestamp in state if it changed from external tab
      if (currentStored !== lastSyncedTimestamp) {
        setLastSyncedTimestamp(currentStored);
      }

      // Trigger soft background update if cache exceeds 4 hours (or has never been synced)
      if (!parsedDate || currentAge > maxCacheAgeMs) {
        performSoftBackgroundUpdate();
      }
    } catch (e) {
      console.warn("[useMarketDataSync] Check error:", e);
    }
  }, [storageKey, lastSyncedTimestamp, maxCacheAgeMs, parseLastSyncedDate, performSoftBackgroundUpdate]);

  // Set up listeners: Mount, Visibility/Focus change, Multi-tab storage events, and Polling interval
  useEffect(() => {
    // 1. Initial check on mount
    checkAndSyncIfNeeded();

    // 2. Window focus & tab visibility change (triggers soft check when user returns after 4 hours)
    const handleVisibilityOrFocus = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        checkAndSyncIfNeeded();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    // 3. Multi-tab cross-synchronization via storage event
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        setLastSyncedTimestamp(event.newValue);
        try {
          const cachedData = localStorage.getItem(cacheDataKey);
          if (cachedData) setMarketData(JSON.parse(cachedData));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    // 4. Custom in-app broadcast event
    const handleCustomSynced = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.timestamp) setLastSyncedTimestamp(customEvent.detail.timestamp);
        if (customEvent.detail.data) setMarketData(customEvent.detail.data);
      }
    };
    window.addEventListener("yieldnest:market-data-synced", handleCustomSynced);

    // 5. Periodic background polling interval (e.g. check every 5 minutes)
    const intervalId = setInterval(() => {
      checkAndSyncIfNeeded();
    }, pollIntervalMs);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("yieldnest:market-data-synced", handleCustomSynced);
      clearInterval(intervalId);
    };
  }, [checkAndSyncIfNeeded, pollIntervalMs, storageKey, cacheDataKey]);

  return {
    marketData,
    lastSynced: lastSyncedDate,
    lastSyncedTimestamp,
    isStale,
    isSyncing,
    syncError,
    cacheAgeHours,
    eeatCompliance,
    refresh: performSoftBackgroundUpdate,
  };
}
