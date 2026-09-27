import React, { useState } from "react";
import {
  Settings,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Globe,
  FileCode,
} from "lucide-react";
import { SiteSettings } from "../../types";
import { saveSiteSettings, syncAllToSupabase } from "../../lib/storage";
import { testSupabaseConnection } from "../../lib/supabaseClient";

interface SiteSettingsManagerProps {
  settings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  articlesCount: number;
}

export function SiteSettingsManager({
  settings,
  onUpdateSettings,
  articlesCount,
}: SiteSettingsManagerProps) {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiteSettings(formData);
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    const result = await testSupabaseConnection(formData.supabaseUrl, formData.supabaseAnonKey);
    setSupabaseTestStatus({
      tested: true,
      success: result.success,
      message: result.message,
    });
    setIsTestingSupabase(false);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    const res = await syncAllToSupabase();
    setSyncStatus(res.message);
    setIsSyncing(false);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handleCopySqlPath = () => {
    navigator.clipboard.writeText("supabase/schema.sql");
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif-editorial text-stone-900 font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-stone-700" />
            <span>Site Settings & Supabase Database</span>
          </h2>
          <p className="text-xs text-stone-500 font-mono-data">
            Configure EEAT author accreditation, Supabase PostgreSQL synchronization, and Search Console indexing.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Publication Branding & Identity */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE8E0] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0EEE6]">
            <Globe className="w-4 h-4 text-emerald-700" />
            <h3 className="font-semibold text-sm text-stone-900 font-mono-data uppercase tracking-wider">
              Publication Branding &amp; Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                Publication / Site Name *
              </label>
              <input
                type="text"
                value={formData.siteName || "YieldNest.online"}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none font-semibold text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                Publication Tagline
              </label>
              <input
                type="text"
                value={formData.tagline || "Mutual Fund Research & Analytics"}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail || "research@yieldnest.online"}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                Official Domain
              </label>
              <input
                type="text"
                readOnly
                value="yieldnest.online"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 focus:outline-none cursor-not-allowed font-mono-data"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
              Publication Description
            </label>
            <textarea
              rows={2}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Supabase Database Integration */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE8E0] space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EEE6]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-sm text-stone-900 font-mono-data uppercase tracking-wider">
                Supabase PostgreSQL Database
              </h3>
            </div>
            <span className="text-[11px] font-mono-data text-stone-500">Dual-sync Active</span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            The application operates with full offline and local browser persistence by default. Connecting your Supabase PostgreSQL project stores articles, comments, and analytics in the cloud for multi-device collaboration.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                VITE_SUPABASE_URL
              </label>
              <input
                type="text"
                placeholder="https://your-project-id.supabase.co"
                value={formData.supabaseUrl}
                onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none focus:border-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                VITE_SUPABASE_ANON_KEY
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={formData.supabaseAnonKey}
                onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none focus:border-stone-800"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="px-3.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-medium text-stone-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? "animate-spin" : ""}`} />
              <span>{isTestingSupabase ? "Testing..." : "Test Connection"}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={isSyncing}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSyncing ? "Syncing..." : `Sync All ${articlesCount} Articles to Supabase`}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySqlPath}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium flex items-center gap-1"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{copiedSchema ? "Path Copied!" : "Schema: supabase/schema.sql"}</span>
            </button>
          </div>

          {supabaseTestStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                supabaseTestStatus.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {supabaseTestStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              )}
              <span>{supabaseTestStatus.message}</span>
            </div>
          )}

          {syncStatus && (
            <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-800 font-mono-data">
              {syncStatus}
            </div>
          )}
        </div>

        {/* Section 2: Publication & Author Attribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE8E0] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0EEE6]">
            <ShieldCheck className="w-4 h-4 text-stone-800" />
            <h3 className="font-semibold text-sm text-stone-900 font-mono-data uppercase tracking-wider">
              Author Attribution & Regulatory Transparency
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <div className="font-semibold font-mono-data flex items-center gap-1.5">
              <span>Non-SEBI / Non-AMFI Registered Disclosure Active</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              In compliance with regulations, all public articles, masthead notices, and footers display explicit disclaimers stating that the authors and platform are not AMFI or SEBI registered analysts or advisers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                Author & Principal Analyst
              </label>
              <input
                type="text"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                Regulatory Status
              </label>
              <input
                type="text"
                readOnly
                value="Independent Educational Publisher (Not SEBI/AMFI Registered)"
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
              Author Professional Title
            </label>
            <input
              type="text"
              value={formData.authorTitle}
              onChange={(e) => setFormData({ ...formData, authorTitle: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
              Credentials & Qualifications (Optional)
            </label>
            <input
              type="text"
              value={formData.authorCredentials}
              onChange={(e) => setFormData({ ...formData, authorCredentials: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
              Author Biography (Used in Article Byline & Schema.org)
            </label>
            <textarea
              rows={3}
              value={formData.authorBio}
              onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
            />
          </div>
        </div>

        {/* Section 3: Google Search Console & Indexing */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE8E0] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0EEE6]">
            <Globe className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-sm text-stone-900 font-mono-data uppercase tracking-wider">
              Google Search Console & SEO Verification
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
              Google Site Verification Token
            </label>
            <input
              type="text"
              placeholder="e.g. gsc-verification-code-..."
              value={formData.googleSearchConsoleVerification}
              onChange={(e) =>
                setFormData({ ...formData, googleSearchConsoleVerification: e.target.value })
              }
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
            />
          </div>

          <div className="p-3 bg-[#FAF9F5] rounded-xl border border-stone-200 text-xs space-y-1.5 text-stone-600">
            <div className="font-semibold text-stone-900 font-mono-data">Canonical Slug Structure:</div>
            <p className="text-[11px] font-mono text-stone-700">
              Each article provides a permanent clean URL formatted as:
              <br />
              <span className="text-emerald-700 font-bold">{window.location.origin}/article/[slug]</span>
            </p>
            <p className="text-[11px]">
              Every article automatically injects JSON-LD <code>FinancialArticle</code> Schema.org metadata into the HTML head for instant Google Rich Snippet parsing.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#1A1A1A] hover:bg-black text-white text-xs px-6 py-2.5 rounded-xl font-medium shadow-xs transition-colors"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
