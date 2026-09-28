import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  Sparkles,
  BarChart2,
  Copy,
  Share2,
} from "lucide-react";
import { ArticlePost } from "../../types";
import { SocialPostsModal } from "./SocialPostsModal";

interface PostManagerProps {
  posts: ArticlePost[];
  onEditPost: (post: ArticlePost) => void;
  onNewPost: () => void;
  onDeletePost: (id: string, slug?: string) => Promise<void> | void;
  onViewPost: (post: ArticlePost) => void;
  onToggleStatus: (post: ArticlePost, newStatus: ArticlePost["status"]) => void;
  onSavePost?: (post: ArticlePost) => Promise<void>;
}

export function PostManager({
  posts,
  onEditPost,
  onNewPost,
  onDeletePost,
  onViewPost,
  onToggleStatus,
  onSavePost,
}: PostManagerProps) {
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "scheduled">("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSocialPost, setSelectedSocialPost] = useState<ArticlePost | null>(null);

  const filteredPosts = posts.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyUrl = (slug: string, id: string) => {
    const url = `https://yieldnest.online/article/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: ArticlePost["status"]) => {
    switch (status) {
      case "published":
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">Published</span>;
      case "draft":
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">Draft</span>;
      case "scheduled":
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">Scheduled</span>;
      case "archived":
        return <span className="bg-stone-200 text-stone-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">Archived</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif-editorial text-stone-900 font-semibold">
            Mutual Fund Research Articles
          </h2>
          <p className="text-xs text-stone-500 font-mono-data">
            Manage drafts, published reports, and Google Search Console indexable slugs.
          </p>
        </div>

        <button
          onClick={onNewPost}
          className="bg-[#1A1A1A] hover:bg-black text-white text-xs px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>New Research Article</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#EAE8E0]">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
          {(["all", "published", "draft", "scheduled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filter === tab
                  ? "bg-[#1A1A1A] text-white"
                  : "text-stone-600 hover:bg-[#FAF9F5]"
              }`}
            >
              {tab === "all" ? `All Articles (${posts.length})` : `${tab} (${posts.filter((p) => p.status === tab).length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by title, AMFI or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-800 bg-[#FAF9F5]"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-[#EAE8E0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#EAE8E0] text-stone-600 font-mono-data">
              <tr>
                <th className="py-3 px-4 font-medium">Article Title & Slug</th>
                <th className="py-3 px-3 font-medium">Category</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium">AMFI Data</th>
                <th className="py-3 px-3 font-medium">Reads</th>
                <th className="py-3 px-3 font-medium">Last Updated</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE6]">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 italic">
                    No articles found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                      <div className="font-semibold text-stone-900 line-clamp-1 text-sm font-serif-editorial">
                        {post.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono-data text-stone-400">
                        <span>/article/{post.slug}</span>
                        <button
                          onClick={() => handleCopyUrl(post.slug, post.id)}
                          className="hover:text-stone-800"
                          title="Copy canonical index URL"
                        >
                          {copiedId === post.id ? (
                            <span className="text-emerald-600 font-semibold">Copied!</span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono-data text-[11px] text-stone-700 bg-[#FAF9F5] border border-stone-200 px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {getStatusBadge(post.status)}
                    </td>

                    <td className="py-3.5 px-3">
                      {post.amfiDataSnapshot && post.amfiDataSnapshot.length > 0 ? (
                        <span className="text-[11px] font-mono text-emerald-700 font-medium flex items-center gap-1">
                          <BarChart2 className="w-3 h-3" />
                          {post.amfiDataSnapshot.length} Schemes
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400 font-mono">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono-data text-stone-600">
                      {post.viewsCount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 text-stone-500 font-mono-data text-[11px]">
                      {new Date(post.updatedAt || post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSocialPost(post)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center gap-1.5 border border-stone-200"
                          title="View, copy & manage social posts for X, Instagram, Facebook"
                        >
                          <Share2 className="w-3 h-3 text-pink-600" />
                          <span>Social Posts</span>
                        </button>
                        <button
                          onClick={() => onViewPost(post)}
                          className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded-lg transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditPost(post)}
                          className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit in CMS"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            setDeletingId(post.id);
                            try {
                              await onDeletePost(post.id, post.slug);
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                          disabled={deletingId === post.id}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Social Posts Modal */}
      {selectedSocialPost && (
        <SocialPostsModal
          post={selectedSocialPost}
          onClose={() => setSelectedSocialPost(null)}
          onUpdatePostSocial={async (postId, updatedSocial) => {
            const target = posts.find((p) => p.id === postId);
            if (target && onSavePost) {
              const updated = {
                ...target,
                socialSnippets: updatedSocial,
                updatedAt: new Date().toISOString(),
              };
              await onSavePost(updated);
              setSelectedSocialPost(updated);
            }
          }}
        />
      )}
    </div>
  );
}
