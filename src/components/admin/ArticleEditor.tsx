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
} from "lucide-react";
import { ArticleCategory, ArticlePost, AMFISchemeData, KeywordResearchResult, SiteSettings } from "../../types";
import { cleanSocialExcerpt } from "../SEOHead";

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

  // Social Snippets State
  const [linkedinCopy, setLinkedinCopy] = useState(post?.socialSnippets?.linkedin || "");
  const [twitterCopy, setTwitterCopy] = useState(post?.socialSnippets?.twitter || "");
  const [threadsCopy, setThreadsCopy] = useState(post?.socialSnippets?.threads || "");

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

  // Auto-generate slug from title if empty
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post && (!slug || slug === title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"))) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/--+/g, "-")
      );
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
        headers: { "Content-Type": "application/json" },
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

  // AI Generate Article
  const handleGenerateAIArticle = async (overrideTopic?: string) => {
    const targetTopic = (overrideTopic || aiTopicInput || title).trim();
    if (!targetTopic) {
      alert("Please enter a research topic or fund name (e.g. 'Parag Parikh vs Mirae Asset' or 'Best Mid Cap Funds for SIP').");
      return;
    }

    setIsGeneratingArticle(true);
    setGenerationNotice("Researching AMFI database & drafting comprehensive article... please wait.");
    try {
      const res = await fetch("/api/ai/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          setLinkedinCopy(data.socialScheduling.linkedin || "");
          setTwitterCopy(data.socialScheduling.twitter || "");
          setThreadsCopy(data.socialScheduling.threads || "");
        }
        setGenerationNotice("Research article successfully generated and populated into the editor!");
        setTimeout(() => setGenerationNotice(null), 4000);
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

    setIsSaving(true);
    const cleanedSlug = slug.trim() || title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

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
      socialSnippets: {
        linkedin: linkedinCopy,
        twitter: twitterCopy,
        threads: threadsCopy,
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
                placeholder="e.g. Parag Parikh Flexi Cap vs Mirae Asset Large & Midcap: 5-Year Rolling Return Audit"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full text-base sm:text-lg font-serif-editorial p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-white"
              />
            </div>

            {/* Slug & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
                  Google Search Console Slug *
                </label>
                <div className="flex items-center rounded-xl border border-stone-200 bg-[#FAF9F5] px-3 py-2 text-xs">
                  <span className="text-stone-400 font-mono-data">/article/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent font-mono-data text-stone-900 focus:outline-none ml-1"
                  />
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
                      Lagged Snapshot: As on {fund.date || "31-May-2024"}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-data pt-1">
                      <div>NAV: <span className="font-bold text-stone-900">₹{fund.nav.toFixed(2)}</span> <span className="text-[10px] text-stone-400">({fund.date || "31-May-2024"})</span></div>
                      <div>3Y CAGR: <span className="font-bold text-emerald-700">+{fund.cagr3Y || 21.8}%</span> <span className="text-[10px] text-stone-400">({fund.date || "31-May-2024"})</span></div>
                      <div>TER: <span className="text-stone-700">{fund.expenseRatio || 0.64}%</span> <span className="text-[10px] text-stone-400">({fund.date || "31-May-2024"})</span></div>
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
          <div className="space-y-1">
            <h3 className="font-serif-editorial text-xl font-semibold text-stone-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-stone-700" />
              <span>Automated Social Media Scheduling</span>
            </h3>
            <p className="text-xs text-stone-500">
              Customize publication-ready copy for LinkedIn, Twitter/X, and Threads before scheduling.
            </p>
          </div>

          {/* Social Card Live Preview */}
          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono-data text-stone-600">
              <span className="font-semibold">Attached Link Card Preview (OpenGraph & Twitter Card)</span>
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

          <div className="space-y-4">
            {/* LinkedIn */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800 font-mono-data">
                <span className="text-blue-800">LinkedIn Post Snippet</span>
                <span className="text-stone-400 font-normal">Thought Leadership Format</span>
              </div>
              <textarea
                rows={4}
                value={linkedinCopy}
                onChange={(e) => setLinkedinCopy(e.target.value)}
                placeholder="LinkedIn professional summary with bullet points..."
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              />
            </div>

            {/* Twitter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800 font-mono-data">
                <span>Twitter / X Thread Hook</span>
                <span className="text-stone-400 font-normal">280 Chars Max</span>
              </div>
              <textarea
                rows={3}
                value={twitterCopy}
                onChange={(e) => setTwitterCopy(e.target.value)}
                placeholder="Punchy hook with hashtags..."
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              />
            </div>

            {/* Threads */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800 font-mono-data">
                <span>Threads Teaser</span>
                <span className="text-stone-400 font-normal">Conversational Style</span>
              </div>
              <textarea
                rows={2}
                value={threadsCopy}
                onChange={(e) => setThreadsCopy(e.target.value)}
                placeholder="Conversational teaser..."
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
