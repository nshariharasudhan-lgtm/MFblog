import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Share2,
  MessageSquare,
  Settings,
  Plus,
  ArrowLeft,
  Eye,
  CheckCircle,
  Database,
  BarChart3,
  TrendingUp,
  Users,
  LogOut,
  Key,
} from "lucide-react";
import { ArticlePost, Comment, ContentSuggestion, SiteSettings, AdminUser } from "../../types";
import { PostManager } from "./PostManager";
import { ArticleEditor } from "./ArticleEditor";
import { ContentSuggestions } from "./ContentSuggestions";
import { SocialScheduler } from "./SocialScheduler";
import { CommentModerator } from "./CommentModerator";
import { SiteSettingsManager } from "./SiteSettingsManager";
import { SubscribersManager } from "./SubscribersManager";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { logoutAdmin } from "../../lib/storage";

interface AdminDashboardProps {
  posts: ArticlePost[];
  comments: Comment[];
  settings: SiteSettings;
  adminUser: AdminUser | null;
  onSavePost: (post: ArticlePost) => Promise<void>;
  onDeletePost: (id: string, slug?: string) => Promise<void>;
  onViewPost: (post: ArticlePost) => void;
  onCloseAdmin: () => void;
  onLogoutAdmin: () => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  initialTab?: string;
}

export function AdminDashboard({
  posts,
  comments,
  settings,
  adminUser,
  onSavePost,
  onDeletePost,
  onViewPost,
  onCloseAdmin,
  onLogoutAdmin,
  onUpdateSettings,
  initialTab = "posts",
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [editingPost, setEditingPost] = useState<ArticlePost | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(
    adminUser?.mustChangePassword ?? false
  );

  // Statistics
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const totalViews = posts.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const totalComments = comments.length;

  const handleEditPost = (post: ArticlePost) => {
    setEditingPost(post);
    setActiveTab("editor");
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setActiveTab("editor");
  };

  const handleDraftSuggestion = (suggestion: ContentSuggestion) => {
    const newPostDraft: ArticlePost = {
      id: "post-" + Date.now(),
      title: suggestion.title,
      slug: suggestion.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-"),
      excerpt: suggestion.hook,
      content: `# ${suggestion.title}\n\n*YieldNest.online Research Desk | Verified with AMFI India Data*\n\n## Executive Summary\n${suggestion.hook}\n\n## Official AMFI Data & Metrics\n\n| Metric | Primary Observation | Benchmark |\n| :--- | :--- | :--- |\n| **Current NAV** | ₹0.00 | - |\n| **3Y Rolling CAGR** | +0.0% | - |\n\n## In-Depth Analysis\n\n## Frequently Asked Questions\n\n## Regulatory Compliance & Statutory Disclaimer\n*Mutual fund investments are subject to market risks; read all scheme related documents carefully before investing.*`,
      category: suggestion.category,
      tags: [suggestion.category],
      status: "draft",
      authorName: "Research Desk",
      authorTitle: "YieldNest Research Desk",
      readTimeMinutes: 5,
      viewsCount: 0,
      amfiSchemeCodes: suggestion.amfiSchemeCodes || [],
      seoMetadata: {
        metaTitle: suggestion.title.slice(0, 60),
        metaDescription: suggestion.hook.slice(0, 160),
        primaryKeyword: suggestion.title,
        secondaryKeywords: [],
        eeatScore: 95,
      },
      socialSnippets: {
        twitter: `📈 New Research: ${suggestion.title}\n\n${suggestion.hook.slice(0, 130)}\n\nKey analysis inside 🧵👇\nhttps://yieldnest.online/article/${suggestion.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}\n#MutualFundsIndia #YieldNest`,
        instagram: `Swipe to analyze 📊 ${suggestion.title}!\n\n💡 ${suggestion.hook}\n\n📌 Slide 1: 5-year rolling returns vs benchmark\n📌 Slide 2: Downside capture in market sell-offs\n📌 Slide 3: Direct plan compounding difference\n\n💬 Are you investing in this scheme? Tell us below!\n🔗 Full data breakdown link in bio 👉 yieldnest.online\n\n#MutualFunds #InvestingIndia #FinancialLiteracy #WealthBuilding #SIP #StockMarket #YieldNest`,
        facebook: `Are you evaluating ${suggestion.title} for your portfolio?\n\n${suggestion.hook}\n\nKey Highlights:\n- Long-term rolling return consistency\n- Downside protection during market corrections\n- Direct plan expense ratio advantages\n\nRead the full report on YieldNest.online:\n👉 https://yieldnest.online/article/${suggestion.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}\n\nWhat is your allocation strategy? Join the discussion below! 👇`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingPost(newPostDraft);
    setActiveTab("editor");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24">
      {/* First time / Manual Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          onSuccess={() => setShowChangePassword(false)}
          onDismiss={() => setShowChangePassword(false)}
        />
      )}

      {/* Top Admin Header Bar */}
      <div className="bg-[#1A1A1A] text-white border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onCloseAdmin}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center gap-1.5 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Blog View</span>
            </button>
            <div className="h-4 w-px bg-stone-700 hidden sm:block" />
            <div className="hidden sm:block">
              <span className="text-xs sm:text-sm font-semibold text-stone-100 font-mono-data">
                YieldNest.online CMS
              </span>
              {adminUser && (
                <span className="text-[11px] text-stone-400 font-mono-data ml-2">
                  ({adminUser.email})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChangePassword(true)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono-data flex items-center gap-1 transition-colors"
              title="Change Password"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Change Password</span>
            </button>

            <button
              onClick={handleNewPost}
              className="bg-amber-400 hover:bg-amber-300 text-black px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Article</span>
            </button>

            <button
              onClick={onLogoutAdmin}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-900/60 text-stone-300 hover:text-rose-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* KPI Analytics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#EAE8E0] shadow-xs">
            <div className="text-[11px] font-mono-data text-stone-500 uppercase tracking-wider">
              Published Reports
            </div>
            <div className="text-2xl font-bold text-stone-900 mt-1 font-serif-editorial">
              {publishedCount}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              Live & GSC Indexable
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EAE8E0] shadow-xs">
            <div className="text-[11px] font-mono-data text-stone-500 uppercase tracking-wider">
              Active Drafts
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-1 font-serif-editorial">
              {draftCount}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              In Editorial Review
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EAE8E0] shadow-xs">
            <div className="text-[11px] font-mono-data text-stone-500 uppercase tracking-wider">
              Total Readership
            </div>
            <div className="text-2xl font-bold text-stone-900 mt-1 font-serif-editorial">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              Cumulative Article Reads
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EAE8E0] shadow-xs">
            <div className="text-[11px] font-mono-data text-stone-500 uppercase tracking-wider">
              Comments Moderated
            </div>
            <div className="text-2xl font-bold text-stone-900 mt-1 font-serif-editorial">
              {totalComments}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              Investor Inquiries
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[#EAE8E0] pb-2 overflow-x-auto text-xs font-medium">
          {[
            { id: "posts", label: "Articles Library", icon: FileText },
            { id: "editor", label: editingPost ? "Edit Article" : "Article Studio", icon: Plus },
            { id: "subscribers", label: "Subscribers", icon: Users },
            { id: "suggestions", label: "AI Topic Ideas", icon: Sparkles },
            { id: "social", label: "Social Scheduler", icon: Share2 },
            { id: "comments", label: "Comments", icon: MessageSquare },
            { id: "settings", label: "Settings & Supabase", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "editor" && !editingPost) {
                    handleNewPost();
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-[#F0EEE6]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        <div>
          {activeTab === "posts" && (
            <PostManager
              posts={posts}
              onEditPost={handleEditPost}
              onNewPost={handleNewPost}
              onDeletePost={onDeletePost}
              onViewPost={onViewPost}
              onToggleStatus={async (post, status) => {
                await onSavePost({ ...post, status });
              }}
              onSavePost={onSavePost}
            />
          )}

          {activeTab === "editor" && (
            <ArticleEditor
              post={editingPost}
              settings={settings}
              allPosts={posts}
              onSave={async (post) => {
                await onSavePost(post);
                setActiveTab("posts");
                setEditingPost(null);
              }}
              onCancel={() => {
                setActiveTab("posts");
                setEditingPost(null);
              }}
              onViewOnSite={onViewPost}
            />
          )}

          {activeTab === "subscribers" && <SubscribersManager />}

          {activeTab === "suggestions" && (
            <ContentSuggestions onDraftSuggestion={handleDraftSuggestion} />
          )}

          {activeTab === "social" && <SocialScheduler posts={posts} />}

          {activeTab === "comments" && <CommentModerator />}

          {activeTab === "settings" && (
            <SiteSettingsManager
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              articlesCount={posts.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
