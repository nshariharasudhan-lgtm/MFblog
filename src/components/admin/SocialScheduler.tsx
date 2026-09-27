import React, { useState, useEffect } from "react";
import {
  Share2,
  Calendar,
  Clock,
  Check,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { getSocialSchedules, saveSocialSchedule, deleteSocialSchedule } from "../../lib/storage";

export function SocialScheduler() {
  const [schedules, setSchedules] = useState(getSocialSchedules());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // New item form
  const [platform, setPlatform] = useState<"linkedin" | "twitter" | "threads">("linkedin");
  const [copyText, setCopyText] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [timeSlot, setTimeSlot] = useState("08:30"); // morning pre-market

  const loadSchedules = () => {
    setSchedules(getSocialSchedules());
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    deleteSocialSchedule(id);
    loadSchedules();
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyText.trim()) return;

    const fullTimestamp = new Date(`${scheduledDate}T${timeSlot}:00`).toISOString();

    saveSocialSchedule({
      id: "soc-" + Date.now(),
      postId: "custom",
      postTitle: "Custom Mutual Fund Insight",
      platform,
      copy: copyText.trim(),
      scheduledTime: fullTimestamp,
      status: "scheduled",
    });

    setCopyText("");
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
            Queue and synchronize research takeaways for LinkedIn, Twitter/X, and Threads.
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-600 text-xs mb-1 font-mono-data">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
              >
                <option value="linkedin">LinkedIn (Professional)</option>
                <option value="twitter">Twitter / X (Thread & Hook)</option>
                <option value="threads">Threads (Conversational)</option>
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
            <label className="block text-stone-600 text-xs mb-1 font-mono-data">Post Copy</label>
            <textarea
              required
              rows={4}
              placeholder="Paste or write your key mutual fund takeaways with hashtags..."
              value={copyText}
              onChange={(e) => setCopyText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF9F5] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsComposing(false)}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1A1A1A] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-black"
            >
              Schedule Post
            </button>
          </div>
        </form>
      )}

      {/* Scheduled Queue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.length === 0 ? (
          <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500 italic">
            No scheduled social posts yet. Generate an article or compose one above!
          </div>
        ) : (
          schedules.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-[#EAE8E0] space-y-3 shadow-xs relative"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono-data font-semibold text-stone-800 uppercase px-2 py-0.5 rounded bg-stone-100">
                  {item.platform}
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
                      <span className="text-emerald-700">Copied to clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-stone-400 hover:text-rose-600 p-1"
                  title="Remove from queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
