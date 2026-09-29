import React, { useState, useEffect } from "react";
import { ArticleCategory, ArticlePost, Comment, SiteSettings, AdminUser } from "./types";
import {
  getAllPosts,
  getInitialPosts,
  savePost,
  deletePost,
  incrementPostViews,
  getAllComments,
  getSiteSettings,
  saveSiteSettings,
  getCurrentAdminSession,
  logoutAdmin,
} from "./lib/storage";
import { SEOHead } from "./components/SEOHead";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ArticleCard } from "./components/ArticleCard";
import { ArticleReader } from "./components/ArticleReader";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminAuthModal } from "./components/admin/AdminAuthModal";
import { NewsletterSignup } from "./components/NewsletterSignup";

const CATEGORY_SLUG_MAP: Record<string, ArticleCategory> = {
  "fund-comparison": "Fund Comparison",
  "performance-analysis": "Performance Analysis",
  "market-trends": "Market Trends",
  "category-deep-dive": "Category Deep-Dive",
  "sip-strategies": "SIP Strategies",
};

const CATEGORY_TO_SLUG: Record<ArticleCategory, string> = {
  "Fund Comparison": "fund-comparison",
  "Performance Analysis": "performance-analysis",
  "Market Trends": "market-trends",
  "Category Deep-Dive": "category-deep-dive",
  "SIP Strategies": "sip-strategies",
};

export default function App() {
  const [posts, setPosts] = useState<ArticlePost[]>(() => getInitialPosts());
  const [comments, setComments] = useState<Comment[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings());
  const [currentCategory, setCurrentCategory] = useState<ArticleCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<ArticlePost | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string>("posts");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(getCurrentAdminSession());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize and handle URL routing (History API)
  useEffect(() => {
    loadData();
    handleRouteFromUrl();

    const handlePopState = () => {
      handleRouteFromUrl();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const loadData = async () => {
    const loadedPosts = await getAllPosts();
    const loadedComments = await getAllComments();
    const loadedSettings = getSiteSettings();
    setPosts(loadedPosts);
    setComments(loadedComments);
    setSettings(loadedSettings);
    setAdminUser(getCurrentAdminSession());
  };

  const handleRouteFromUrl = async () => {
    const rawPath = window.location.pathname;
    const path = rawPath.replace(/\/+$/, "") || "/";
    const loadedPosts = await getAllPosts();

    if (path.startsWith("/article/")) {
      const slug = path.replace(/^\/article\//, "").replace(/\/+$/, "");
      const matched = loadedPosts.find((p) => p.slug === slug);
      if (matched) {
        setSelectedArticle(matched);
        setIsAdminView(false);
        incrementPostViews(matched.id);
        return;
      }
    } else if (path.startsWith("/category/")) {
      const catSlug = path.replace(/^\/category\//, "").replace(/\/+$/, "");
      if (CATEGORY_SLUG_MAP[catSlug]) {
        setCurrentCategory(CATEGORY_SLUG_MAP[catSlug]);
        setSelectedArticle(null);
        setIsAdminView(false);
        return;
      }
    } else if (path === "/admin") {
      const session = getCurrentAdminSession();
      if (session) {
        setIsAdminView(true);
        setSelectedArticle(null);
      } else {
        setShowAuthModal(true);
      }
      return;
    }

    // Default view
    setSelectedArticle(null);
    setIsAdminView(false);
    if (path === "/") {
      setCurrentCategory("all");
    }
  };

  // Navigate to article (updates URL with pushState for indexable URL)
  const handleOpenArticle = (post: ArticlePost) => {
    setSelectedArticle(post);
    setIsAdminView(false);
    incrementPostViews(post.id);
    window.history.pushState({}, "", `/article/${post.slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Switch category with clean indexable URL
  const handleSelectCategory = (cat: ArticleCategory | "all") => {
    setCurrentCategory(cat);
    setSelectedArticle(null);
    setIsAdminView(false);
    if (cat === "all") {
      window.history.pushState({}, "", "/");
    } else {
      window.history.pushState({}, "", `/category/${CATEGORY_TO_SLUG[cat]}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Back to Blog Home
  const handleBackToHome = () => {
    setSelectedArticle(null);
    setIsAdminView(false);
    setShowAuthModal(false);
    setCurrentCategory("all");
    window.history.pushState({}, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setShowAuthModal(false);
    setAdminInitialTab("posts");
    setIsAdminView(true);
    setSelectedArticle(null);
    window.history.pushState({}, "", "/admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logoutAdmin();
    setAdminUser(null);
    setIsAdminView(false);
    handleBackToHome();
  };

  // Save Post Handler
  const handleSavePost = async (post: ArticlePost) => {
    await savePost(post);
    await loadData();
  };

  // Delete Post Handler
  const handleDeletePost = async (id: string, slug?: string) => {
    if (confirm("Are you sure you want to permanently delete this research article?")) {
      // Optimistic instant UI update
      setPosts((prev) =>
        prev.filter(
          (p) => String(p.id) !== String(id) && (!slug || String(p.slug) !== String(slug))
        )
      );
      await deletePost(id, slug);
      await loadData();
    }
  };

  // Update Settings Handler
  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSiteSettings(newSettings);
  };

  // Filter published posts for public view and sort date-wise descending (latest first)
  const publishedPosts = posts
    .filter((p) => p.status === "published")
    .sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

  const filteredPosts = publishedPosts.filter((p) => {
    if (currentCategory !== "all" && p.category !== currentCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.amfiSchemeCodes?.some((c) => c.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#1A1A1A] font-serif-editorial">
      {/* SEO & Structured Data Head */}
      <SEOHead
        post={selectedArticle}
        settings={settings}
        urlPath={
          selectedArticle
            ? `/article/${selectedArticle.slug}`
            : currentCategory !== "all"
            ? `/category/${CATEGORY_TO_SLUG[currentCategory]}`
            : "/"
        }
        customTitle={
          !selectedArticle && currentCategory !== "all"
            ? `${currentCategory} Mutual Fund Research & Analysis | YieldNest.online`
            : undefined
        }
        customDescription={
          !selectedArticle && currentCategory !== "all"
            ? `Explore data-driven ${currentCategory} mutual fund research, rolling returns, and performance analysis on YieldNest.online.`
            : undefined
        }
      />

      {/* Admin Authentication Login Modal (shown only when visiting /admin without active session) */}
      {showAuthModal && (
        <AdminAuthModal
          onSuccess={handleAuthSuccess}
          onCancel={() => {
            setShowAuthModal(false);
            handleBackToHome();
          }}
        />
      )}

      {/* Admin View (strictly URL /admin accessible) */}
      {isAdminView && adminUser ? (
        <AdminDashboard
          posts={posts}
          comments={comments}
          settings={settings}
          adminUser={adminUser}
          onSavePost={handleSavePost}
          onDeletePost={handleDeletePost}
          onViewPost={handleOpenArticle}
          onCloseAdmin={handleBackToHome}
          onLogoutAdmin={handleLogout}
          onUpdateSettings={handleUpdateSettings}
          initialTab={adminInitialTab}
        />
      ) : selectedArticle ? (
        /* Single Article View */
        <ArticleReader
          post={selectedArticle}
          onBack={handleBackToHome}
          settings={settings}
          onOpenCategory={(cat) => {
            handleSelectCategory(cat);
          }}
          allPosts={posts}
          onNavigateArticle={handleOpenArticle}
        />
      ) : (
        /* Blog Main Homepage */
        <>
          <Navbar
            currentCategory={currentCategory}
            onSelectCategory={handleSelectCategory}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
            settings={settings}
            onNavigateHome={handleBackToHome}
          />

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-10">
            {/* Loading State */}
            {loading ? (
              <div className="py-20 text-center text-xs font-mono-data text-stone-500">
                Loading research index...
              </div>
            ) : filteredPosts.length === 0 ? (
              /* No Search Results */
              <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
                <p className="text-sm font-serif-editorial text-stone-700">
                  No mutual fund reports found matching "{searchQuery}".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentCategory("all");
                  }}
                  className="text-xs text-stone-900 underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              /* Articles Listing */
              <div className="space-y-12">
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredPosts.map((post) => (
                      <ArticleCard
                        key={post.id}
                        post={post}
                        onOpen={handleOpenArticle}
                      />
                    ))}
                  </div>
                </section>

                {/* Newsletter Subscription Block */}
                <NewsletterSignup />
              </div>
            )}
          </main>

          <Footer
            settings={settings}
            onSelectCategory={handleSelectCategory}
          />
        </>
      )}
    </div>
  );
}
