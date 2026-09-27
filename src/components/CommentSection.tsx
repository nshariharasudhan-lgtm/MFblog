import React, { useState, useEffect } from "react";
import { MessageSquare, Send, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Comment } from "../types";
import { getCommentsForPost, saveComment } from "../lib/storage";

interface CommentSectionProps {
  postId: string;
  postTitle: string;
}

export function CommentSection({ postId, postTitle }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    const list = await getCommentsForPost(postId);
    setComments(list.filter((c) => c.status === "approved"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim() || !content.trim()) return;

    setLoading(true);
    const newComment: Comment = {
      id: "comm-" + Date.now(),
      postId,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      content: content.trim(),
      status: "approved", // auto-approve standard comments, or can be moderated
      createdAt: new Date().toISOString(),
    };

    await saveComment(newComment);
    setSubmitted(true);
    setContent("");
    setLoading(false);
    loadComments();

    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif-editorial text-2xl text-[#1A1A1A] font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-stone-600" />
          Reader Discussion ({comments.length})
        </h3>
        <span className="text-xs text-stone-500 font-mono-data">Moderated & Fact-Checked</span>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-[#EAE8E0] space-y-4 shadow-xs">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 font-mono-data">
          Join the Analysis
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-stone-600 mb-1">Your Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. S. Narayanan"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-800 bg-[#FAF9F5]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-stone-600 mb-1">Your Email (Private) *</label>
            <input
              type="email"
              required
              placeholder="e.g. investor@gmail.com"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-800 bg-[#FAF9F5]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1">Comment / Fund Observation *</label>
          <textarea
            required
            rows={3}
            placeholder="Share your perspective, question on rolling returns, or allocation query..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-800 bg-[#FAF9F5]"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {submitted ? (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Comment published successfully!
            </span>
          ) : (
            <span className="text-[11px] text-stone-400">Respectful financial discourse encouraged.</span>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#1A1A1A] hover:bg-black text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? "Posting..." : "Post Comment"}</span>
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-4">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((comm) => (
            <div key={comm.id} className="p-4 rounded-xl bg-white border border-[#EAE8E0] space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-stone-900">{comm.authorName}</span>
                <span className="text-[11px] font-mono-data text-stone-400">
                  {new Date(comm.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{comm.content}</p>

              {/* Admin reply badge */}
              {comm.adminReply && (
                <div className="mt-3 pl-3 py-2 border-l-2 border-amber-600 bg-[#FAF7ED] rounded-r-lg space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-900">
                    <span>Editorial Desk Response</span>
                  </div>
                  <p className="text-xs text-stone-800 leading-relaxed">{comm.adminReply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
