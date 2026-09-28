import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Calendar,
  Save,
  Sparkles,
} from "lucide-react";
import { ArticlePost } from "../../types";
import { saveSocialSchedule } from "../../lib/storage";

interface SocialPostsModalProps {
  post: ArticlePost;
  onClose: () => void;
  onUpdatePostSocial: (postId: string, socialSnippets: ArticlePost["socialSnippets"]) => Promise<void>;
}

export function SocialPostsModal({ post, onClose, onUpdatePostSocial }: SocialPostsModalProps) {
  const [activePlatform, setActivePlatform] = useState<"twitter" | "instagram" | "facebook">("twitter");

  // Editable copies
  const [twitterText, setTwitterText] = useState(
    post.socialSnippets?.twitter ||
      `📈 Deep Dive: ${post.title}\n\n${post.excerpt.slice(0, 140)}\n\nKey takeaways with verified AMFI data on YieldNest.online 🧵👇\nhttps://yieldnest.online/article/${post.slug}\n#MutualFundsIndia #StockMarketIndia #YieldNest`
  );

  const [instagramText, setInstagramText] = useState(
    post.socialSnippets?.instagram ||
      `Swipe for key takeaways 📊 ${post.title}!\n\n💡 ${post.excerpt}\n\n📌 Slide 1: Historical 5-year rolling returns\n📌 Slide 2: Expense ratio compounding drag\n📌 Slide 3: Practical portfolio allocation recommendations\n\n💬 Have questions on this scheme? Comment below!\n🔗 Full data breakdown link in bio 👉 yieldnest.online\n\n#MutualFunds #InvestingIndia #FinancialLiteracy #WealthBuilding #SIP #StockMarket #YieldNest`
  );

  const [facebookText, setFacebookText] = useState(
    post.socialSnippets?.facebook ||
      `New Research: ${post.title}\n\n${post.excerpt}\n\nKey highlights for mutual fund investors:\n- Long-term rolling return consistency against benchmarks\n- Risk-adjusted Sharpe and Alpha performance\n- Direct plan cost savings over 15-20 years\n\nRead the complete research report on YieldNest.online:\n👉 https://yieldnest.online/article/${post.slug}\n\nWhat are your thoughts on this strategy? Join the discussion below! 👇`
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [scheduleFeedback, setScheduleFeedback] = useState<string | null>(null);

  const articleUrl = `https://yieldnest.online/article/${post.slug}`;

  const handleCopy = (key: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveSocial = async () => {
    setIsSaving(true);
    setSaveFeedback(null);
    try {
      const updatedSnippets = {
        ...(post.socialSnippets || {}),
        twitter: twitterText,
        instagram: instagramText,
        facebook: facebookText,
      };
      await onUpdatePostSocial(post.id, updatedSnippets);
      setSaveFeedback("Social posts saved successfully!");
      setTimeout(() => setSaveFeedback(null), 3000);
    } catch (err) {
      console.error("Failed to save social snippets:", err);
      setSaveFeedback("Error saving social posts.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/social/generate-snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          excerpt: post.excerpt,
          keyFindings: post.content.slice(0, 600),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.twitter) setTwitterText(data.twitter);
        if (data.instagram) setInstagramText(data.instagram);
        if (data.facebook) setFacebookText(data.facebook);
      }
    } catch (err) {
      console.warn("Failed to regenerate snippets:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleScheduleCurrent = () => {
    let copy = "";
    if (activePlatform === "twitter") copy = twitterText;
    else if (activePlatform === "instagram") copy = instagramText;
    else copy = facebookText;

    const scheduledTime = new Date(Date.now() + 86400000).toISOString();
    saveSocialSchedule({
      id: "soc-" + Date.now(),
      postId: post.id,
      postTitle: post.title,
      platform: activePlatform,
      copy,
      scheduledTime,
      status: "scheduled",
    });

    setScheduleFeedback(`Queued to ${activePlatform.toUpperCase()} schedule!`);
    setTimeout(() => setScheduleFeedback(null), 2500);
  };

  const handleOpenNativeX = () => {
    const text = encodeURIComponent(twitterText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleOpenNativeFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white p-5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono-data px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                Admin Social Studio
              </span>
              <span className="text-[11px] font-mono-data text-stone-400">
                /article/{post.slug}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-serif-editorial font-semibold line-clamp-1 text-stone-100">
              {post.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action sub-bar */}
        <div className="bg-[#FAF9F5] border-b border-[#EAE8E0] px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Platform Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActivePlatform("twitter")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activePlatform === "twitter"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              <span>𝕏 (Twitter)</span>
            </button>

            <button
              onClick={() => setActivePlatform("instagram")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activePlatform === "instagram"
                  ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-xs"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              <span>Instagram</span>
            </button>

            <button
              onClick={() => setActivePlatform("facebook")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activePlatform === "facebook"
                  ? "bg-[#1877F2] text-white shadow-xs"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              <span>Facebook</span>
            </button>
          </div>

          {/* Quick AI Regeneration */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="text-xs px-3 py-1.5 rounded-xl border border-stone-300 hover:border-stone-400 bg-white text-stone-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Regenerate all 3 posts with AI based on article content"
            >
              <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
              <span>{isRegenerating ? "Generating..." : "Regenerate with AI"}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Active Platform View */}
          {activePlatform === "twitter" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-data">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-black" />
                  <span>𝕏 / Twitter Thread Hook & Link</span>
                </span>
                <span className={twitterText.length > 280 ? "text-rose-600 font-bold" : "text-stone-500"}>
                  {twitterText.length} / 280 characters
                </span>
              </div>

              <textarea
                rows={6}
                value={twitterText}
                onChange={(e) => setTwitterText(e.target.value)}
                placeholder="Hook, key takeaway, canonical link, and hashtags..."
                className="w-full text-xs p-3.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none focus:border-stone-800 font-sans leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy("twitter", twitterText)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    {copiedKey === "twitter" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy 𝕏 Post</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleOpenNativeX}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in 𝕏 Composer</span>
                  </button>
                </div>

                <button
                  onClick={handleScheduleCurrent}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Queue in Scheduler</span>
                </button>
              </div>
            </div>
          )}

          {activePlatform === "instagram" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-data">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  <span>Instagram Carousel Outline & Caption</span>
                </span>
                <span className="text-stone-500">{instagramText.length} characters</span>
              </div>

              <textarea
                rows={8}
                value={instagramText}
                onChange={(e) => setInstagramText(e.target.value)}
                placeholder="Visual slide outline, emoji bullet points, bio link CTA, and hashtags..."
                className="w-full text-xs p-3.5 rounded-xl border border-pink-200 bg-pink-50/20 focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy("instagram", instagramText)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs hover:opacity-95"
                  >
                    {copiedKey === "instagram" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copied Caption!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Instagram Caption</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleScheduleCurrent}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Queue in Scheduler</span>
                </button>
              </div>
            </div>
          )}

          {activePlatform === "facebook" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-data">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
                  <span>Facebook Discussion & Community Post</span>
                </span>
                <span className="text-stone-500">{facebookText.length} characters</span>
              </div>

              <textarea
                rows={8}
                value={facebookText}
                onChange={(e) => setFacebookText(e.target.value)}
                placeholder="Detailed findings, discussion prompt, and link referral..."
                className="w-full text-xs p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy("facebook", facebookText)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    {copiedKey === "facebook" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copied Post!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Facebook Post</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleOpenNativeFacebook}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Facebook Share</span>
                  </button>
                </div>

                <button
                  onClick={handleScheduleCurrent}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Queue in Scheduler</span>
                </button>
              </div>
            </div>
          )}

          {scheduleFeedback && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{scheduleFeedback}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF9F5] border-t border-[#EAE8E0] p-4 flex items-center justify-between gap-3">
          <div className="text-xs font-mono-data text-stone-500">
            {saveFeedback ? (
              <span className="text-emerald-700 font-semibold">{saveFeedback}</span>
            ) : (
              <span>Posts are saved to this article in database.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleSaveSocial}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSaving ? "Saving..." : "Save All Posts"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
