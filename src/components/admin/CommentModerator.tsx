import React, { useState, useEffect } from "react";
import { MessageSquare, Check, X, ShieldAlert, CornerDownRight, Trash2, Send } from "lucide-react";
import { Comment } from "../../types";
import { getAllComments, saveComment, deleteComment } from "../../lib/storage";

export function CommentModerator() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    const list = await getAllComments();
    setComments(list);
  };

  const handleUpdateStatus = async (comment: Comment, newStatus: Comment["status"]) => {
    await saveComment({ ...comment, status: newStatus });
    loadComments();
  };

  const handleDelete = async (id: string) => {
    await deleteComment(id);
    loadComments();
  };

  const handleSendAdminReply = async (comment: Comment) => {
    const text = replyText[comment.id];
    if (!text?.trim()) return;

    await saveComment({
      ...comment,
      adminReply: text.trim(),
    });

    setActiveReplyId(null);
    setReplyText({ ...replyText, [comment.id]: "" });
    loadComments();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif-editorial text-stone-900 font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-stone-700" />
            <span>Reader Comments & Moderation</span>
          </h2>
          <p className="text-xs text-stone-500 font-mono-data">
            Manage public discussions, answer investor inquiries, and verify compliance.
          </p>
        </div>
        <span className="text-xs font-mono-data bg-stone-100 text-stone-700 px-3 py-1 rounded-full">
          Total: {comments.length} comments
        </span>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500 italic">
            No reader comments recorded yet.
          </div>
        ) : (
          comments.map((comm) => (
            <div
              key={comm.id}
              className="bg-white p-5 rounded-2xl border border-[#EAE8E0] space-y-3 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900">{comm.authorName}</span>
                  <span className="text-stone-400 font-mono-data text-[11px]">&lt;{comm.authorEmail}&gt;</span>
                </div>

                <div className="flex items-center gap-2 font-mono-data text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold ${
                      comm.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : comm.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {comm.status.toUpperCase()}
                  </span>
                  <span className="text-stone-400">
                    {new Date(comm.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-800 bg-[#FAF9F5] p-3 rounded-xl border border-stone-200 leading-relaxed">
                {comm.content}
              </p>

              {/* Existing admin reply */}
              {comm.adminReply && (
                <div className="pl-4 py-2 border-l-2 border-amber-600 bg-amber-50/50 rounded-r-xl text-xs space-y-1">
                  <div className="font-semibold text-amber-900 text-[11px]">Your Published Response:</div>
                  <p className="text-stone-800">{comm.adminReply}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-[#F0EEE6]">
                <div className="flex items-center gap-2">
                  {comm.status !== "approved" && (
                    <button
                      onClick={() => handleUpdateStatus(comm, "approved")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Approve
                    </button>
                  )}
                  {comm.status !== "spam" && (
                    <button
                      onClick={() => handleUpdateStatus(comm, "spam")}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      Mark Spam
                    </button>
                  )}
                  <button
                    onClick={() => setActiveReplyId(activeReplyId === comm.id ? null : comm.id)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium flex items-center gap-1"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    {comm.adminReply ? "Edit Reply" : "Reply as Admin"}
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(comm.id)}
                  className="p-1 text-stone-400 hover:text-rose-600"
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reply Box */}
              {activeReplyId === comm.id && (
                <div className="pt-3 border-t border-stone-200 space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Write editorial response from the research team..."
                    value={replyText[comm.id] ?? comm.adminReply ?? ""}
                    onChange={(e) => setReplyText({ ...replyText, [comm.id]: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-800"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="px-3 py-1 rounded-lg border border-stone-200 text-stone-600 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendAdminReply(comm)}
                      className="px-3 py-1 rounded-lg bg-[#1A1A1A] text-white text-xs font-medium flex items-center gap-1 hover:bg-black"
                    >
                      <Send className="w-3 h-3" />
                      Save Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
