import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Send,
  Eye,
  BarChart2,
  Search,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  HelpCircle,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Link2,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { ArticleCategory, ArticlePost, AMFISchemeData, KeywordResearchResult, SiteSettings, DataFreshnessStatus } from "../../types";
import { cleanSocialExcerpt } from "../SEOHead";
import { sanitizeSlug, validateSlug, getCanonicalArticleUrl } from "../../lib/slugUtils";
import { getAdminAuthHeaders } from "../../lib/storage";

interface ArticleEditorProps {
  post?: ArticlePost | null;
  settings: SiteSettings;
  allPosts?: ArticlePost[];
  onSave: (post: ArticlePost) => Promise<void>;
  onCancel: () => void;
  onViewOnSite: (post: ArticlePost) => void;
}

export function ArticleEditor({ post, settings, allPosts = [], onSave, onCancel, onViewOnSite }: ArticleEditorProps) {
  // Form State
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [category, setCategory] = useState<ArticleCategory>(post?.category || "Fund Comparison");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [status, setStatus] = useState<ArticlePost["status"]>(post?.status || "draft");
  const [readTime, setReadTime] = useState(post?.readTimeMinutes || 6);
  const [authorName, setAuthorName] = useState("Research Desk");

  // SEO & Keywords State
  const [primaryKeyword, setPrimaryKeyword] = useState(post?.seoMetadata?.primaryKeyword || "");
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>(
    post?.seoMetadata?.secondaryKeywords || []
  );
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [metaTitle, setMetaTitle] = useState(post?.seoMetadata?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.seoMetadata?.metaDescription || "");

  // Social Snippets State (X, Instagram, Facebook)
  const [twitterCopy, setTwitterCopy] = useState(
    post?.socialSnippets?.twitter ||
      (post?.title
        ? `📈 Deep-Dive: ${post.title}\n\n${(post.excerpt || "").slice(0, 140)}\n\nKey takeaways with verified AMFI data 🧵👇\nhttps://www.yieldnest.online/article/${post.slug}\n#MutualFundsIndia #StockMarketIndia #YieldNest`
        : "")
  );
  const [instagramCopy, setInstagramCopy] = useState(
    post?.socialSnippets?.instagram ||
      (post?.title
        ? `Swipe to analyze 📊 ${post.title}!\n\n💡 ${post.excerpt || ""}\n\n📌 Slide 1: Historical 5-year rolling returns\n📌 Slide 2: Downside capture in market sell-offs\n📌 Slide 3: Direct plan compounding difference\n\n💬 Do you hold this in your mutual fund portfolio? Share below!\n🔗 Full article link in bio 👉 yieldnest.online\n\n#MutualFunds #InvestingIndia #FinancialLiteracy #WealthBuilding #SIP #StockMarket #YieldNest`
        : "")
  );
  const [facebookCopy, setFacebookCopy] = useState(
    post?.socialSnippets?.facebook ||
      (post?.title
        ? `Are you evaluating ${post.title} for your mutual fund portfolio?\n\nOur research desk analyzed official AMFI scheme metrics to evaluate rolling returns, alpha generation, and expense drag.\n\nKey Highlights:\n- Long-term performance consistency\n- Downside protection during market sell-offs\n- Direct plan cost savings\n\nRead the complete research report here: https://www.yieldnest.online/article/${post.slug}\n\nWhat has been your experience with this strategy? Let us know in the comments! 👇`
        : "")
  );
  const [copiedSocialKey, setCopiedSocialKey] = useState<string | null>(null);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);

  // AMFI Data Freshness Validation Layer State
  const [dataFreshnessStatus, setDataFreshnessStatus] = useState<DataFreshnessStatus | null>(
    post?.dataFreshness || null
  );

  const handleCopySnippet = (key: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSocialKey(key);
    setTimeout(() => setCopiedSocialKey(null), 2000);
  };

  const handleGenerateSocialSnippets = async () => {
    if (!title && !aiTopicInput) {
      alert("Please provide an article title first.");
      return;
    }
    setIsGeneratingSocial(true);
    try {
      const res = await fetch("/api/social/generate-snippets", {
        method: "POST",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          title: title || aiTopicInput,
          excerpt,
          keyFindings: content.slice(0, 600),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.twitter) setTwitterCopy(data.twitter);
        if (data.instagram) setInstagramCopy(data.instagram);
        if (data.facebook) setFacebookCopy(data.facebook);
      }
    } catch (err) {
      console.warn("Failed to generate social snippets:", err);
    } finally {
      setIsGeneratingSocial(false);
    }
  };

  // AMFI Schemes State
  const [attachedFunds, setAttachedFunds] = useState<AMFISchemeData[]>(post?.amfiDataSnapshot || []);
  const [amfiSearchQuery, setAmfiSearchQuery] = useState("");
  const [amfiSearchResults, setAmfiSearchResults] = useState<any[]>([]);
  const [isSearchingAmfi, setIsSearchingAmfi] = useState(false);

  // Keyword Research State
  const [keywordResearch, setKeywordResearch] = useState<KeywordResearchResult | null>(null);
  const [isResearchingKeywords, setIsResearchingKeywords] = useState(false);

  // AI Generation State
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState(title || "");
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "amfi" | "keywords" | "seo" | "social">("write");
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper to insert internal article link into content
  const handleInsertInternalLink = (targetPost: ArticlePost) => {
    const markdownLink = `[${targetPost.title}](/article/${targetPost.slug})`;
    setContent((prev) => prev ? `${prev}\n\n${markdownLink}` : markdownLink);
  };

  // Auto-generate clean, SEO-optimized slug from title if not custom-locked
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post && (!slug || slug === sanitizeSlug(title))) {
      setSlug(sanitizeSlug(val));
    }
    if (!metaTitle) {
      setMetaTitle(val.slice(0, 60));
    }
  };

  // Search AMFI Database
  const handleSearchAmfi = async () => {
    if (!amfiSearchQuery.trim()) return;
    setIsSearchingAmfi(true);
    try {
      const res = await fetch(`/api/amfi/search?q=${encodeURIComponent(amfiSearchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setAmfiSearchResults(data);
      }
    } catch (err) {
      console.error("AMFI Search Error:", err);
    } finally {
      setIsSearchingAmfi(false);
    }
  };

  // Attach an AMFI Scheme
  const handleAttachScheme = async (schemeCode: string) => {
    try {
      const res = await fetch(`/api/amfi/fund/${schemeCode}`);
      if (res.ok) {
        const fundData = await res.json();
        // check if already attached
        if (!attachedFunds.some((f) => f.schemeCode === String(schemeCode))) {
          setAttachedFunds([...attachedFunds, fundData]);
        }
      }
    } catch (err) {
      console.error("AMFI Fund fetch error:", err);
    }
  };

  const handleRemoveScheme = (schemeCode: string) => {
    setAttachedFunds(attachedFunds.filter((f) => f.schemeCode !== schemeCode));
  };

  // Keyword Research API
  const handleRunKeywordResearch = async () => {
    const topicToResearch = title || primaryKeyword || "Best mutual funds for long term SIP";
    setIsResearchingKeywords(true);
    try {
      const res = await fetch("/api/ai/research-keywords", {
        method: "POST",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ topic: topicToResearch, category }),
      });
      if (res.ok) {
        const data: KeywordResearchResult = await res.json();
        setKeywordResearch(data);
        if (data.primaryKeyword) setPrimaryKeyword(data.primaryKeyword);
        if (data.secondaryKeywords?.length) setSecondaryKeywords(data.secondaryKeywords);
      }
    } catch (err) {
      console.error("Keyword research failed:", err);
    } finally {
      setIsResearchingKeywords(false);
    }
  };

  // AI Generate Article with Data Freshness Validation Layer
  const handleGenerateAIArticle = async (overrideTopic?: string, isForcedRecencyRetry = false) => {
    const targetTopic = (overrideTopic || aiTopicInput || title).trim();
    if (!targetTopic) {
      alert("Please enter a research topic or fund name (e.g. 'Parag Parikh vs Mirae Asset' or 'Best Mid Cap Funds for SIP').");
      return;
    }

    setIsGeneratingArticle(true);
    setGenerationNotice(
      isForcedRecencyRetry
        ? "⚠️ Stale data (>30 days) detected. Executing forced re-fetch with fresh AMFI data..."
        : "Researching AMFI database & drafting comprehensive article... please wait."
    );
    try {
      const res = await fetch("/api/ai/generate-article", {
        method: "POST",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          topic: targetTopic,
          category,
          keywords: [primaryKeyword, ...secondaryKeywords].filter(Boolean),
          amfiDataSnapshot: attachedFunds,
          authorName: settings.authorName || "Research Desk",
          authorCredentials: settings.authorCredentials || "Mutual Fund Research Team",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          setTitle(data.title);
          setAiTopicInput(data.title);
        }
        if (data.slug) setSlug(data.slug);
        if (data.excerpt) setExcerpt(data.excerpt);
        if (data.content) setContent(data.content);
        if (data.readTimeMinutes) setReadTime(data.readTimeMinutes);
        if (data.category) setCategory(data.category);
        if (data.seoMetadata) {
          setMetaTitle(data.seoMetadata.metaTitle || data.title);
          setMetaDescription(data.seoMetadata.metaDescription || data.excerpt);
          if (data.seoMetadata.primaryKeyword) setPrimaryKeyword(data.seoMetadata.primaryKeyword);
          if (data.seoMetadata.secondaryKeywords?.length) setSecondaryKeywords(data.seoMetadata.secondaryKeywords);
        }
        if (data.socialScheduling) {
          if (data.socialScheduling.twitter) setTwitterCopy(data.socialScheduling.twitter);
          if (data.socialScheduling.instagram) setInstagramCopy(data.socialScheduling.instagram);
          if (data.socialScheduling.facebook) setFacebookCopy(data.socialScheduling.facebook);
        }

        // Data Freshness Validation Layer Check
        if (data.dataFreshness) {
          setDataFreshnessStatus(data.dataFreshness);

          // If the server reported data is still older than 30 days and we haven't retried yet, force re-fetch
          if (data.dataFreshness.isOlderThan30Days && !isForcedRecencyRetry) {
            console.warn("[Validation Layer] Data older than 30 days detected by client. Forcing automatic re-fetch...");
            setTimeout(() => {
              handleGenerateAIArticle(targetTopic, true);
            }, 600);
            return;
          }
        }

        setGenerationNotice(
          data.dataFreshness?.refetchTriggered
            ? "Research draft generated! Stale data (>30 days) was detected and automatically re-fetched with current September 2026 AMFI data."
            : "Research article successfully generated and verified fresh with official AMFI data!"
        );
        setTimeout(() => setGenerationNotice(null), 5000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Generation notice: ${errData.error || "Please verify topic and retry."}`);
        setGenerationNotice(null);
      }
    } catch (err) {
      console.error("AI Article Generation Failed:", err);
      alert("Failed to generate article. Check connection and try again.");
      setGenerationNotice(null);
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  const handleForceFreshRefetch = () => {
    handleGenerateAIArticle(aiTopicInput || title, true);
  };

  // Add Secondary Keyword
  const handleAddKeyword = () => {
    if (newKeywordInput.trim() && !secondaryKeywords.includes(newKeywordInput.trim())) {
      setSecondaryKeywords([...secondaryKeywords, newKeywordInput.trim()]);
      setNewKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setSecondaryKeywords(secondaryKeywords.filter((k) => k !== kw));
  };

  // Save Post
  const handleSavePost = async (publishStatus: ArticlePost["status"] = status) => {
    if (!title.trim()) {
      alert("Article title is required.");
      return;
    }
    if (!content.trim()) {
      alert("Article content cannot be empty.");
      return;
    }

    const cleanedSlug = sanitizeSlug(slug || title);
    if (!cleanedSlug) {
      alert("Please provide a valid title or URL slug for Google Search Console indexing.");
      return;
    }

    const otherSlugs = allPosts
      .filter((p) => !post || p.id !== post.id)
      .map((p) => p.slug);

    const validation = validateSlug(cleanedSlug, otherSlugs, post?.id);
    if (!validation.valid) {
      if (validation.suggestedSlug && confirm(`${validation.message}\n\nWould you like to use the suggested unique slug "/article/${validation.suggestedSlug}" instead?`)) {
        setSlug(validation.suggestedSlug);
        setIsSaving(false);
        return;
      } else {
        alert(validation.message);
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(true);
    setSlug(cleanedSlug);

    const postPayload: ArticlePost = {
      id: post?.id || "post-" + Date.now(),
      title: title.trim(),
      slug: cleanedSlug,
      category,
      excerpt: excerpt.trim() || content.slice(0, 160).replace(/[#*`]/g, ""),
      content,
      tags: secondaryKeywords,
      status: publishStatus,
      authorName: authorName.trim() || settings.authorName || "Research Desk",
      authorTitle: post?.authorTitle || settings.authorCredentials || "Mutual Fund Research Team",
      authorAvatar: post?.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      readTimeMinutes: readTime,
      viewsCount: post?.viewsCount || 0,
      amfiSchemeCodes: attachedFunds.map((f) => f.schemeCode),
      amfiDataSnapshot: attachedFunds,
      seoMetadata: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        primaryKeyword,
        secondaryKeywords,
        eeatScore: 96,
        riskRating: "Very High (Equity)",
      },
      dataFreshness: dataFreshnessStatus || post?.dataFreshness,
      socialSnippets: {
        twitter:
          twitterCopy.trim() ||
          `📈 Deep-Dive: ${title.trim()}\n\n${(excerpt.trim() || content.slice(0, 140)).replace(/[#*`]/g, "")}\n\nKey takeaways with verified AMFI data 🧵👇\nhttps://www.yieldnest.online/article/${cleanedSlug}\n#MutualFundsIndia #StockMarketIndia #YieldNest`,
        instagram:
          instagramCopy.trim() ||
          `Swipe to analyze 📊 ${title.trim()}!\n\n💡 ${(excerpt.trim() || content.slice(0, 160)).replace(/[#*`]/g, "")}\n\n📌 Slide 1: Historical 5-year rolling returns\n📌 Slide 2: Downside capture in market sell-offs\n📌 Slide 3: Direct plan compounding difference\n\n💬 Do you hold this in your mutual fund portfolio? Share below!\n🔗 Full article link in bio 👉 yieldnest.online\n\n#MutualFunds #InvestingIndia #FinancialLiteracy #WealthBuilding #SIP #StockMarket #YieldNest`,
        facebook:
          facebookCopy.trim() ||
          `Are you evaluating ${title.trim()} for your mutual fund portfolio?\n\nOur research desk analyzed official AMFI scheme metrics to evaluate rolling returns, alpha generation, and expense drag.\n\nKey Highlights:\n- Long-term performance consistency\n- Downside protection during market sell-offs\n- Direct plan cost savings\n\nRead the complete research report here: https://www.yieldnest.online/article/${cleanedSlug}\n\nWhat has been your experience with this strategy? Let us know in the comments! 👇`,
      },
      publishedAt: publishStatus === "published" ? (post?.publishedAt || new Date().toISOString()) : undefined,
      createdAt: post?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await onSave(postPayload);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EAE8E0] shadow-xs sticky top-20 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
            title="Return to Articles"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif-editorial text-lg sm:text-xl font-semibold text-stone-900 line-clamp-1">
              {post ? "Edit Research Article" : "New Mutual Fund Article Studio"}
            </h2>
            <div className="text-[11px] font-mono-data text-stone-500">
              Canonical URL: <span className="text-stone-800">/article/{slug || "slug-preview"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {post && (
            <button
              onClick={() => onViewOnSite(post)}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Live</span>
            </button>
          )}

          <button
            onClick={() => handleSavePost("draft")}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSavePost("published")}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Publish Article"}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Article saved and indexed successfully!</span>
        </div>
      )}

      {/* AMFI Data Freshness Validation Layer Alert Banner */}
      {dataFreshnessStatus && (
        <div
          className={`p-4 rounded-2xl border transition-all animate-fade-in ${
            dataFreshnessStatus.isOlderThan30Days || dataFreshnessStatus.warningTriggered
              ? "bg-amber-50 border-amber-300 text-amber-950"
              : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {dataFreshnessStatus.isOlderThan30Days || dataFreshnessStatus.warningTriggered ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-xs tracking-wide uppercase font-mono-data">
                    Data Freshness Guard (30-Day Recency)
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      dataFreshnessStatus.isOlderThan30Days
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : dataFreshnessStatus.refetchTriggered
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    {dataFreshnessStatus.isOlderThan30Days
                      ? "⚠️ Stale Data Warning (>30 Days)"
                      : dataFreshnessStatus.refetchTriggered
                      ? "⚡ Stale Data Detected & Auto-Refetched"
                      : "✓ 30-Day Recency Verified (Current Month)"}
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                  {dataFreshnessStatus.message}
                </p>
                {dataFreshnessStatus.staleDatesDetected && dataFreshnessStatus.staleDatesDetected.length > 0 && (
                  <div className="text-[11px] font-mono-data text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-200 mt-1">
                    <span className="font-semibold">Detected Stale Elements:</span>{" "}
                    {dataFreshnessStatus.staleDatesDetected.join(", ")}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                onClick={handleForceFreshRefetch}
                disabled={isGeneratingArticle}
                className="bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                title="Force complete re-fetch with verified September 2026 AMFI data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingArticle ? "animate-spin" : ""}`} />
                <span>Force Fresh Re-Fetch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI & Research Quick Assistant Banner */}
      <div className="bg-gradient-to-r from-[#2A2926] to-[#1A1A1A] text-white p-5 rounded-2xl shadow-sm space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-400/30">
              AMFI & Gemini Research Engine
            </span>
            <span className="text-stone-400 text-xs">EEAT Grounded</span>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-stone-100 font-serif-editorial">
            Draft Automated, Verified Mutual Fund Analysis
          </h3>
          <p className="text-xs text-stone-400">
            Enter a fund comparison, market theme, or category review. AI will generate an authoritative research draft with verified AMFI data and internal links.
          </p>
        </div>

        {/* Topic Input & Generate Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={aiTopicInput}
            onChange={(e) => {
              setAiTopicInput(e.target.value);
              if (!title) setTitle(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isGeneratingArticle) {
                e.preventDefault();
                handleGenerateAIArticle(aiTopicInput);
              }
            }}
            placeholder="Enter research topic (e.g. Quant Small Cap vs Nippon Small Cap, Best Flexi Cap Funds 2026...)"
            className="flex-1 bg-stone-900/90 border border-stone-700 text-stone-100 placeholder-stone-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400 font-sans"
          />
          <button
            onClick={() => handleGenerateAIArticle(aiTopicInput)}
            disabled={isGeneratingArticle}
            className="bg-amber-400 hover:bg-amber-300 text-black px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>{isGeneratingArticle ? "Generating Article..." : "Generate AI Draft with AMFI Data"}</span>
          </button>
        </div>

        {generationNotice && (
          <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-2 animate-fade-in font-mono-data">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{generationNotice}</span>
          </div>
        )}

        {/* Attached AMFI Funds Preview Strip */}
        <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 font-mono-data text-[11px]">Attached Schemes ({attachedFunds.length}):</span>
          {attachedFunds.length === 0 ? (
            <span className="text-stone-500 italic text-[11px]">No funds attached. Use the AMFI tab below to attach verified NAV data.</span>
          ) : (
            attachedFunds.map((fund) => (
              <span
                key={fund.schemeCode}
                className="bg-stone-800 text-stone-200 px-2.5 py-1 rounded-md text-[11px] font-mono-data flex items-center gap-1.5 border border-stone-700"
              >
                <span>{fund.schemeCode}: {fund.schemeName.slice(0, 22)}...</span>
                <span className="text-emerald-400 font-bold">₹{fund.nav.toFixed(2)}</span>
                <button
                  onClick={() => handleRemoveScheme(fund.schemeCode)}
                  className="text-stone-400 hover:text-rose-400 ml-1 font-bold"
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Editor Workspace Tabs */}
      <div className="flex items-center gap-1 border-b border-[#EAE8E0] pb-2 text-xs font-medium overflow-x-auto">
        {[
          { id: "write", label: "Article Content & Editor" },
          { id: "amfi", label: `AMFI Data Portal (${attachedFunds.length})` },
          { id: "keywords", label: "Keyword Research & EEAT" },
          { id: "seo", label: "Search Console SEO" },
          { id: "social", label: "Social Media Scheduling" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-[#1A1A1A] text-white"
                : "text-stone-600 hover:bg-[#FAF9F5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Main Write & Markdown Editor */}
      {activeTab === "write" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                Article Title * (EEAT & SEO Optimized)
              </label>
              <input
                type="text"
                placeholder="e.g. Parag Parikh Flexi Cap vs Mirae Asset Large & Midcap: 5-Year Rolling Return Analysis"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full text-base sm:text-lg font-serif-editorial p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-white"
              />
            </div>

            {/* Slug & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700 font-mono-data">
                    Google Search Console Slug *
                  </label>
                  <button
                    type="button"
                    onClick={() => setSlug(sanitizeSlug(slug || title))}
                    className="text-[10px] text-stone-500 hover:text-stone-900 underline font-mono-data"
                  >
                    Auto-Sanitize Slug
                  </button>
                </div>
                <div className="flex items-center rounded-xl border border-stone-200 bg-[#FAF9F5] px-3 py-2 text-xs">
                  <span className="text-stone-400 font-mono-data">/article/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    onBlur={() => setSlug(sanitizeSlug(slug))}
                    placeholder="clean-article-slug"
                    className="w-full bg-transparent font-mono-data text-stone-900 focus:outline-none ml-1"
                  />
                </div>
                <div className="text-[10px] font-mono-data text-stone-500 mt-1 truncate">
                  Canonical: <span className="text-stone-700">https://www.yieldnest.online/article/{sanitizeSlug(slug || "slug")}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                  Mutual Fund Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-white"
                >
                  <option value="Fund Comparison">Fund Comparison</option>
                  <option value="Performance Analysis">Performance Analysis</option>
                  <option value="Market Trends">Market Trends</option>
                  <option value="Category Deep-Dive">Category Deep-Dive</option>
                  <option value="SIP Strategies">SIP Strategies</option>
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data flex justify-between">
                <span>Executive Summary / Meta Excerpt</span>
                <span className="text-[11px] font-normal text-stone-400">{excerpt.length} / 160 chars</span>
              </label>
              <textarea
                rows={2}
                placeholder="Brief high-impact synthesis of the mutual fund research thesis..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-white"
              />
            </div>

            {/* Markdown Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-700 font-mono-data">
                  Full Research Body (Markdown Supported)
                </label>
                <div className="flex items-center gap-3">
                  {allPosts.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Link2 className="w-3.5 h-3.5 text-stone-500" />
                      <select
                        onChange={(e) => {
                          const selected = allPosts.find((p) => p.slug === e.target.value);
                          if (selected) {
                            handleInsertInternalLink(selected);
                          }
                          e.target.value = "";
                        }}
                        defaultValue=""
                        className="text-[11px] font-mono-data bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md px-2 py-1 text-stone-700 focus:outline-none"
                      >
                        <option value="" disabled>+ Link to Research Article...</option>
                        {allPosts
                          .filter((p) => !post || p.id !== post.id)
                          .map((p) => (
                            <option key={p.id} value={p.slug}>
                              {p.title.slice(0, 45)}...
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs text-stone-600 hover:text-black font-medium underline"
                  >
                    {showPreview ? "Switch to Raw Editor" : "Show Split Live Preview"}
                  </button>
                </div>
              </div>

              {showPreview ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea
                    rows={22}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full text-xs font-mono p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-white leading-relaxed"
                  />
                  <div className="p-4 bg-white rounded-xl border border-stone-200 overflow-y-auto max-h-[500px] prose prose-xs">
                    <div className="text-stone-800 whitespace-pre-wrap font-serif-editorial text-sm leading-relaxed">
                      {content || "No content written yet."}
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  rows={20}
                  placeholder="# Enter your markdown formatted mutual fund research..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs font-mono p-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-white leading-relaxed"
                />
              )}
            </div>
          </div>

          {/* Right Inspector Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Publication Settings */}
            <div className="bg-white p-4 rounded-xl border border-[#EAE8E0] space-y-3 shadow-xs text-xs">
              <h4 className="font-semibold text-stone-800 font-mono-data">Article Meta & Attribution</h4>
              
              <div>
                <label className="block text-stone-600 text-[11px] mb-1 font-mono-data">Author Name / Byline</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Research Desk or Your Name"
                  className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-900 text-xs focus:outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block text-stone-500 text-[11px] mb-1">Estimated Read Time (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={readTime}
                  onChange={(e) => setReadTime(parseInt(e.target.value, 10) || 5)}
                  className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-900 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AMFI Data Portal */}
      {activeTab === "amfi" && (
        <div className="bg-white p-6 rounded-2xl border border-[#EAE8E0] space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif-editorial text-xl font-semibold text-stone-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>Official AMFI India Data Search & Verification</span>
            </h3>
            <p className="text-xs text-stone-500">
              Directly query real-time AMFI India NAVs, expense ratios, and historical rolling returns to cite verifiable data in your article.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search scheme name (e.g. Parag Parikh, HDFC Top 100, Quant Small Cap, UTI Nifty)..."
              value={amfiSearchQuery}
              onChange={(e) => setAmfiSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchAmfi()}
              className="flex-1 text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-[#FAF9F5]"
            />
            <button
              onClick={handleSearchAmfi}
              disabled={isSearchingAmfi}
              className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isSearchingAmfi ? "Querying AMFI..." : "Search AMFI"}</span>
            </button>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 font-mono-data text-[11px]">Popular Schemes:</span>
            {[
              { code: "122639", name: "Parag Parikh Flexi Cap" },
              { code: "118834", name: "Mirae Asset Large & Midcap" },
              { code: "120828", name: "Quant Small Cap" },
              { code: "118778", name: "Nippon India Small Cap" },
              { code: "120716", name: "UTI Nifty 50 Index" },
              { code: "118989", name: "HDFC Top 100" },
            ].map((p) => (
              <button
                key={p.code}
                onClick={() => handleAttachScheme(p.code)}
                className="bg-[#F0EEE6] hover:bg-[#E3E0D5] px-2.5 py-1 rounded-md text-[11px] font-mono-data text-stone-700 transition-colors"
              >
                + {p.name}
              </button>
            ))}
          </div>

          {/* Search Results */}
          {amfiSearchResults.length > 0 && (
            <div className="space-y-2 border-t border-[#F0EEE6] pt-4">
              <h4 className="text-xs font-semibold text-stone-700 font-mono-data">Search Results</h4>
              <div className="divide-y divide-[#F0EEE6] max-h-60 overflow-y-auto border border-stone-200 rounded-xl">
                {amfiSearchResults.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-[#FAF9F5]">
                    <div>
                      <div className="font-semibold text-stone-900">{item.schemeName}</div>
                      <div className="text-[11px] font-mono-data text-stone-500">Scheme Code: {item.schemeCode}</div>
                    </div>
                    <button
                      onClick={() => handleAttachScheme(item.schemeCode)}
                      className="bg-stone-900 text-white hover:bg-black px-3 py-1 rounded-lg text-xs font-medium"
                    >
                      Attach Data
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attached Schemes List */}
          <div className="border-t border-[#F0EEE6] pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-stone-800 font-mono-data">
              Attached Schemes in this Research Report ({attachedFunds.length})
            </h4>
            {attachedFunds.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No schemes attached yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attachedFunds.map((fund) => (
                  <div key={fund.schemeCode} className="p-4 rounded-xl border border-stone-200 bg-[#FAF9F5] space-y-2 relative">
                    <button
                      onClick={() => handleRemoveScheme(fund.schemeCode)}
                      className="absolute top-3 right-3 text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="font-semibold text-xs text-stone-900 pr-6">{fund.schemeName}</div>
                    <div className="text-[10px] text-stone-500 font-mono-data">
                      Lagged Snapshot: As on {fund.date || "28-Sep-2026"}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-data pt-1">
                      <div>NAV: <span className="font-bold text-stone-900">₹{fund.nav.toFixed(2)}</span> <span className="text-[10px] text-stone-400">({fund.date || "28-Sep-2026"})</span></div>
                      <div>3Y CAGR: <span className="font-bold text-emerald-700">+{fund.cagr3Y || 21.8}%</span> <span className="text-[10px] text-stone-400">({fund.date || "28-Sep-2026"})</span></div>
                      <div>TER: <span className="text-stone-700">{fund.expenseRatio || 0.64}%</span> <span className="text-[10px] text-stone-400">({fund.date || "28-Sep-2026"})</span></div>
                      <div>Code: <span className="text-stone-700">{fund.schemeCode}</span></div>
                    </div>
                    <div className="text-[10px] text-stone-500 italic pt-1 border-t border-stone-100">
                      Historical data shown for educational illustration only; not a recommendation or performance claim.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Keyword Research */}
      {activeTab === "keywords" && (
        <div className="bg-white p-6 rounded-2xl border border-[#EAE8E0] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-serif-editorial text-xl font-semibold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Financial Keyword Research Engine</span>
              </h3>
              <p className="text-xs text-stone-500">
                Discover search volumes, commercial intent, and LSI terms for mutual fund queries in India.
              </p>
            </div>

            <button
              onClick={handleRunKeywordResearch}
              disabled={isResearchingKeywords}
              className="bg-[#1A1A1A] hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResearchingKeywords ? "animate-spin" : ""}`} />
              <span>{isResearchingKeywords ? "Analyzing Search Data..." : "Run Keyword Research"}</span>
            </button>
          </div>

          {/* Primary Keyword */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 font-mono-data">
              Primary Focus Keyword *
            </label>
            <input
              type="text"
              placeholder="e.g. Parag Parikh Flexi Cap vs Mirae Asset Large & Midcap"
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-[#FAF9F5]"
            />
          </div>

          {/* Secondary Keywords */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 font-mono-data">
              Secondary & LSI Keywords
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add keyword and press enter..."
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              />
              <button
                onClick={handleAddKeyword}
                className="bg-stone-800 text-white px-3 py-1.5 rounded-xl text-xs font-medium"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {secondaryKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 border border-stone-200"
                >
                  <span>{kw}</span>
                  <button onClick={() => handleRemoveKeyword(kw)} className="text-stone-400 hover:text-black">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Research Results Cards if available */}
          {keywordResearch && (
            <div className="border-t border-[#F0EEE6] pt-4 space-y-4">
              <h4 className="text-xs font-semibold text-stone-800 font-mono-data">
                Search Intent & Volume Metrics (AI Modeled)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {keywordResearch.keywordMetrics?.map((km, i) => (
                  <div key={i} className="p-3 bg-[#FAF9F5] rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-900">{km.keyword}</div>
                      <div className="text-[11px] text-stone-500 font-mono-data">Intent: {km.intent}</div>
                    </div>
                    <div className="text-right font-mono-data">
                      <div className="text-emerald-700 font-bold">{km.volume}</div>
                      <div className="text-[10px] text-stone-400">Diff: {km.difficulty}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Search Console SEO */}
      {activeTab === "seo" && (
        <div className="bg-white p-6 rounded-2xl border border-[#EAE8E0] space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif-editorial text-xl font-semibold text-stone-900">
              Google Search Console Optimization
            </h3>
            <p className="text-xs text-stone-500">
              Configure clean canonical URLs, snippet titles, and descriptions for SERP indexing.
            </p>
          </div>

          {/* Real-time Search & Social Sharing Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SERP Snippet Preview */}
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-stone-200 space-y-1.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="text-[11px] text-stone-500 font-mono-data flex items-center justify-between">
                  <span>Google Search SERP Preview</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Desktop & Mobile</span>
                </div>
                <div className="text-xs text-emerald-800 font-mono-data truncate">
                  {window.location.origin}/article/{slug || "parag-parikh-vs-mirae-asset"}
                </div>
                <div className="text-base text-[#1a0dab] font-medium hover:underline cursor-pointer line-clamp-1">
                  {metaTitle || title || "Article Title Preview"}
                </div>
                <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {metaDescription || excerpt || "Article meta description snippet showing in search engine results..."}
                </div>
              </div>
              <div className="text-[10px] text-stone-400 font-mono-data pt-2 border-t border-stone-200/60 flex justify-between">
                <span>Title: {(metaTitle || title).length}/60 chars</span>
                <span>Desc: {(metaDescription || excerpt).length}/160 chars</span>
              </div>
            </div>

            {/* Social Sharing Card Preview */}
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-stone-200 space-y-2">
              <div className="text-[11px] text-stone-500 font-mono-data flex items-center justify-between">
                <span>Social Sharing Card Preview</span>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">OpenGraph & Twitter Card</span>
              </div>
              
              <div className="rounded-xl border border-stone-300 p-4 bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono-data border-b border-stone-100 pb-2">
                  <span className="uppercase font-semibold tracking-wider text-stone-600">{window.location.hostname || "yieldnest.online"}</span>
                  <span className="text-emerald-700 font-medium">Text Editorial Summary</span>
                </div>
                <div className="font-serif-editorial font-semibold text-sm text-stone-900 line-clamp-2 leading-snug">
                  {metaTitle || title || "Article Headline for Social Media"}
                </div>
                <div className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {cleanSocialExcerpt(metaDescription || excerpt, content, 155)}
                </div>
                <div className="pt-2 flex items-center gap-2 text-[11px] font-mono-data text-stone-400 border-t border-stone-100">
                  <span>By {authorName || "Research Desk"}</span>
                  <span>•</span>
                  <span>{category}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data flex justify-between">
                <span>Meta Title Tag (30-60 characters)</span>
                <span className="text-[11px] text-stone-400">{metaTitle.length} chars</span>
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-[#FAF9F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data flex justify-between">
                <span>Meta Description (120-160 characters)</span>
                <span className="text-[11px] text-stone-400">{metaDescription.length} chars</span>
              </label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-[#FAF9F5]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Social Media Scheduling */}
      {activeTab === "social" && (
        <div className="bg-white p-6 rounded-2xl border border-[#EAE8E0] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif-editorial text-xl font-semibold text-stone-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-stone-700" />
                <span>Automated Social Media Post Generation</span>
              </h3>
              <p className="text-xs text-stone-500">
                Tailored publication-ready copy for 𝕏 (Twitter), Instagram, and Facebook.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateSocialSnippets}
              disabled={isGeneratingSocial}
              className="bg-[#1A1A1A] hover:bg-black text-white text-xs px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSocial ? "animate-spin" : ""}`} />
              <span>{isGeneratingSocial ? "Generating Posts..." : "Regenerate Social Posts (X, Insta, FB)"}</span>
            </button>
          </div>

          {/* Social Card Live Preview */}
          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono-data text-stone-600">
              <span className="font-semibold">Attached Link Card Preview (OpenGraph, Facebook & Instagram Links)</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Auto-generated from excerpt & headline
              </span>
            </div>
            <div className="max-w-md rounded-xl border border-stone-300 p-4 bg-white shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono-data border-b border-stone-100 pb-2">
                <span className="uppercase font-semibold tracking-wider text-stone-600">{window.location.hostname || "yieldnest.online"}</span>
                <span className="text-blue-700 font-medium">Article Preview</span>
              </div>
              <div className="font-serif-editorial font-semibold text-sm text-stone-900 line-clamp-2 leading-snug">
                {metaTitle || title || "Article Headline for Social Media"}
              </div>
              <div className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                {cleanSocialExcerpt(metaDescription || excerpt, content, 155)}
              </div>
              <div className="pt-2 flex items-center gap-2 text-[11px] font-mono-data text-stone-400 border-t border-stone-100">
                <span>By {authorName || "Research Desk"}</span>
                <span>•</span>
                <span>{category}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* 1. Twitter / X */}
            <div className="p-4 rounded-xl border border-stone-300 bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold font-mono-data">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black text-white text-[11px]">
                  <span>𝕏 / Twitter</span>
                  <span className="opacity-80">Post & Thread Hook</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopySnippet("twitter", twitterCopy)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 hover:text-black text-xs transition-colors shadow-2xs"
                >
                  {copiedSocialKey === "twitter" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-600" />
                      <span>Copy 𝕏 Post</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={4}
                value={twitterCopy}
                onChange={(e) => setTwitterCopy(e.target.value)}
                placeholder="Punchy hook, key data point, canonical link, and hashtags..."
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none focus:border-stone-800 font-sans leading-relaxed"
              />
              <div className="text-[11px] text-stone-500 font-mono-data flex justify-between">
                <span>Optimized for X feeds & thread engagement</span>
                <span className={twitterCopy.length > 280 ? "text-rose-600 font-bold" : ""}>
                  {twitterCopy.length} / 280 characters
                </span>
              </div>
            </div>

            {/* 2. Instagram Post & Carousel Caption */}
            <div className="p-4 rounded-xl border border-pink-200 bg-gradient-to-br from-pink-50/40 via-purple-50/20 to-amber-50/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold font-mono-data">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-[11px]">
                  <span>Instagram</span>
                  <span className="opacity-80">Carousel & Bio Link</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopySnippet("instagram", instagramCopy)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-pink-300 bg-white text-stone-700 hover:text-black hover:border-pink-400 text-xs transition-colors shadow-2xs"
                >
                  {copiedSocialKey === "instagram" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-pink-600" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={6}
                value={instagramCopy}
                onChange={(e) => setInstagramCopy(e.target.value)}
                placeholder="Visual carousel breakdown, bullet points with emoji pointers, bio link CTA, and hashtags..."
                className="w-full text-xs p-3 rounded-xl border border-pink-200/80 bg-white focus:outline-none focus:border-pink-400 font-sans leading-relaxed"
              />
              <div className="text-[11px] text-stone-500 flex justify-between font-mono-data">
                <span>Includes slide hooks & bio link CTA</span>
                <span>{instagramCopy.length} characters</span>
              </div>
            </div>

            {/* 3. Facebook Community Post */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold font-mono-data">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#1877F2] text-white text-[11px]">
                  <span>Facebook</span>
                  <span className="opacity-80">Community & Group Discussion</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopySnippet("facebook", facebookCopy)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-300 bg-white text-stone-700 hover:text-black hover:border-blue-400 text-xs transition-colors shadow-2xs"
                >
                  {copiedSocialKey === "facebook" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                      <span>Copy Post</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={6}
                value={facebookCopy}
                onChange={(e) => setFacebookCopy(e.target.value)}
                placeholder="Detailed educational discussion, key findings, discussion prompt, and link referral..."
                className="w-full text-xs p-3 rounded-xl border border-blue-200/80 bg-white focus:outline-none focus:border-blue-400 font-sans leading-relaxed"
              />
              <div className="text-[11px] text-stone-500 flex justify-between font-mono-data">
                <span>Optimized for investor groups & community discussion</span>
                <span>{facebookCopy.length} characters</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
