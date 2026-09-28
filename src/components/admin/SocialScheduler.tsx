import React, { useState } from "react";
import {
  Share2,
  Calendar,
  Clock,
  Check,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";
import { getSocialSchedules, saveSocialSchedule, deleteSocialSchedule } from "../../lib/storage";
import { ArticlePost } from "../../types";

interface SocialSchedulerProps {
  posts?: ArticlePost[];
}

export function SocialScheduler({ posts = [] }: SocialSchedulerProps) {
  const [schedules, setSchedules] = useState(getSocialSchedules());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // New item form
  const [platform, setPlatform] = useState<"twitter" | "instagram" | "facebook">("twitter");
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [copyText, setCopyText] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [timeSlot, setTimeSlot] = useState("08:30"); // morning pre-market

  const loadSchedules = () => {
    setSchedules(getSocialSchedules());
  };

  const handleCopy = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    deleteSocialSchedule(id);
    loadSchedules();
  };

  const handleArticleSelect = (articleId: string, currentPlatform: "twitter" | "instagram" | "facebook") => {
    setSelectedArticleId(articleId);
    if (!articleId) return;
    const target = posts.find((p) => p.id === articleId);
    if (target?.socialSnippets) {
      if (currentPlatform === "twitter" && target.socialSnippets.twitter) {
        setCopyText(target.socialSnippets.twitter);
      } else if (currentPlatform === "instagram" && target.socialSnippets.instagram) {
        setCopyText(target.socialSnippets.instagram);
      } else if (currentPlatform === "facebook" && target.socialSnippets.facebook) {
        setCopyText(target.socialSnippets.facebook);
      } else {
        setCopyText(`New Research: ${target.title}\n\n${target.excerpt}\n\nRead more at https://yieldnest.online/article/${target.slug}`);
      }
    }
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyText.trim()) return;

    const fullTimestamp = new Date(`${scheduledDate}T${timeSlot}:00`).toISOString();
    const target = posts.find((p) => p.id === selectedArticleId);

    saveSocialSchedule({
      id: "soc-" + Date.now(),
      postId: target?.id || "custom",
      postTitle: target?.title || "Custom Research Insight",
      platform,
      copy: copyText.trim(),
      scheduledTime: fullTimestamp,
      status: "scheduled",
    });

    setCopyText("");
    setSelectedArticleId("");
    setIsComposing(false);
    loadSchedules();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif-editorial text-stone-900 font-semibold flex items-center gap-2">
            <Share2 className="w-5 h-5 text-stone-700" />
            <span>Automatic Social Media Scheduling</span>
          </h2>
          <p className="text-xs text-stone-500 font-mono-data">
            Queue and synchronize research takeaways for 𝕏 (Twitter), Instagram, and Facebook.
          </p>
        </div>

        <button
          onClick={() => setIsComposing(!isComposing)}
          className="bg-[#1A1A1A] hover:bg-black text-white text-xs px-4 py-2.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isComposing ? "Close Composer" : "Queue Social Post"}</span>
        </button>
      </div>

      {/* Composer Form */}
      {isComposing && (
        <form
          onSubmit={handleCreateSchedule}
          className="bg-white p-5 rounded-2xl border border-[#EAE8E0] space-y-4 shadow-xs"
        >
          <h3 className="text-xs font-semibold text-stone-800 font-mono-data uppercase tracking-wider">
            Compose & Schedule Post
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-stone-600 text-xs mb-1 font-mono-data">Autofill from Article</label>
              <select
                value={selectedArticleId}
                onChange={(e) => handleArticleSelect(e.target.value, platform)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              >
                <option value="">-- Choose Article (Optional) --</option>
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title.slice(0, 40)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-600 text-xs mb-1 font-mono-data">Platform</label>
              <select
                value={platform}
                onChange={(e) => {
                  const newPlatform = e.target.value as "twitter" | "instagram" | "facebook";
                  setPlatform(newPlatform);
                  if (selectedArticleId) {
                    handleArticleSelect(selectedArticleId, newPlatform);
                  }
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              >
                <option value="twitter">𝕏 / Twitter (Thread Hook & Link)</option>
                <option value="instagram">Instagram (Carousel & Bio Link)</option>
                <option value="facebook">Facebook (Community Post)</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-600 text-xs mb-1 font-mono-data">Target Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-600 text-xs mb-1 font-mono-data">Time Slot (IST)</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              >
                <option value="08:30">08:30 AM (Pre-Market Open)</option>
                <option value="11:30">11:30 AM (Mid-Day Peak)</option>
                <option value="18:15">06:15 PM (Post-Market Wrap)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-mono-data">
              <label className="text-stone-600">Post Copy</label>
              <span className={platform === "twitter" && copyText.length > 280 ? "text-rose-600 font-bold" : "text-stone-400"}>
                {copyText.length} {platform === "twitter" ? "/ 280 chars" : "chars"}
              </span>
            </div>
            <textarea
              required
              rows={5}
              value={copyText}
              onChange={(e) => setCopyText(e.target.value)}
              placeholder="Post text, hook, link, and hashtags..."
              className="w-full text-xs p-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-800 bg-[#FAF9F5] font-sans leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsComposing(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1A1A1A] hover:bg-black text-white text-xs px-4 py-2 rounded-xl font-medium transition-colors shadow-xs"
            >
              Schedule Post
            </button>
          </div>
        </form>
      )}

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#EAE8E0] space-y-2">
            <Share2 className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs text-stone-500 font-mono-data">No social media posts scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-[#EAE8E0] space-y-3 shadow-xs relative"
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-mono-data font-semibold uppercase text-[10px] px-2.5 py-1 rounded-md shadow-2xs ${
                      item.platform === "instagram"
                        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white"
                        : item.platform === "facebook"
                        ? "bg-[#1877F2] text-white"
                        : "bg-black text-white"
                    }`}
                  >
                    {item.platform === "twitter" ? "𝕏 / Twitter" : item.platform}
                  </span>

                  <div className="flex items-center gap-1.5 text-stone-500 font-mono-data text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(item.scheduledTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <Clock className="w-3 h-3 ml-1" />
                    <span>
                      {new Date(item.scheduledTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-stone-800 whitespace-pre-wrap font-sans bg-[#FAF9F5] p-3 rounded-xl border border-stone-200 max-h-40 overflow-y-auto leading-relaxed">
                  {item.copy}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleCopy(item.id, item.copy)}
                    className="inline-flex items-center gap-1 text-stone-600 hover:text-black font-medium"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-stone-400 hover:text-rose-600 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
