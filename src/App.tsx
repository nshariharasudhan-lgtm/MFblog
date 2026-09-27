import React, { useState, useEffect } from "react";
import { ArticleCategory, ArticlePost, Comment, SiteSettings, AdminUser } from "./types";
import {
  getAllPosts,
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

export default function App() {
  const [posts, setPosts] = useState<ArticlePost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings());
  const [currentCategory, setCurrentCategory] = useState<ArticleCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<ArticlePost | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string>("posts");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(getCurrentAdminSession());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    const loadedPosts = await getAllPosts();
    const loadedComments = await getAllComments();
    const loadedSettings = getSiteSettings();
    setPosts(loadedPosts);
    setComments(loadedComments);
    setSettings(loadedSettings);
    setAdminUser(getCurrentAdminSession());
    setLoading(false);
  };

  const handleRouteFromUrl = async () => {
    const path = window.location.pathname;
    const loadedPosts = await getAllPosts();

    if (path.startsWith("/article/")) {
      const slug = path.replace("/article/", "");
      const matched = loadedPosts.find((p) => p.slug === slug);
      if (matched) {
        setSelectedArticle(matched);
        setIsAdminView(false);
        incrementPostViews(matched.id);
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
  };

  // Navigate to article (updates URL with pushState for indexable URL)
  const handleOpenArticle = (post: ArticlePost) => {
    setSelectedArticle(post);
    setIsAdminView(false);
    incrementPostViews(post.id);
    window.history.pushState({}, "", `/article/${post.slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Back to Blog Home
  const handleBackToHome = () => {
    setSelectedArticle(null);
    setIsAdminView(false);
    setShowAuthModal(false);
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
  const handleDeletePost = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this research article?")) {
      await deletePost(id);
      await loadData();
    }
  };

  // Update Settings Handler
  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSiteSettings(newSettings);
  };

  // Filter published posts for public view
  const publishedPosts = posts.filter((p) => p.status === "published");
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

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#1A1A1A] font-serif-editorial">
      {/* SEO & Structured Data Head */}
      <SEOHead
        post={selectedArticle}
        settings={settings}
        urlPath={selectedArticle ? `/article/${selectedArticle.slug}` : "/"}
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
            setCurrentCategory(cat);
            handleBackToHome();
          }}
          allPosts={posts}
          onNavigateArticle={handleOpenArticle}
        />
      ) : (
        /* Blog Main Homepage */
        <>
          <Navbar
            currentCategory={currentCategory}
            onSelectCategory={setCurrentCategory}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
            settings={settings}
            onNavigateHome={handleBackToHome}
          />

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 space-y-12">
            {/* Minimalist Editorial Hero Header */}
            <div className="border-b border-[#EAE8E0] pb-8 pt-2 space-y-3">
              <div className="text-xs font-mono-data text-stone-500 uppercase tracking-widest">
                Mutual Fund Research & Analytics
              </div>
              <h1 className="font-display-title text-4xl sm:text-5xl md:text-6xl text-[#1A1A1A] font-normal leading-[1.08] tracking-tight max-w-3xl">
                Independent Mutual Fund Analytics
              </h1>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans max-w-2xl">
                Unbiased rolling return audits, portfolio overlap teardowns, and factor exposure analytics across Indian mutual funds.
              </p>
            </div>

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
                {/* Featured Headline Article */}
                {featuredPost && (
                  <section>
                    <div className="text-[11px] font-mono-data uppercase tracking-wider text-stone-500 mb-3">
                      Featured Research Note
                    </div>
                    <ArticleCard
                      post={featuredPost}
                      onOpen={handleOpenArticle}
                      featured={true}
                    />
                  </section>
                )}

                {/* Remaining Articles Grid */}
                {remainingPosts.length > 0 && (
                  <section className="space-y-4 pt-4">
                    <div className="pb-2 border-b border-[#EAE8E0] text-xs font-mono-data text-stone-500 uppercase tracking-wider">
                      Recent Audits & Comparisons ({remainingPosts.length})
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {remainingPosts.map((post) => (
                        <ArticleCard
                          key={post.id}
                          post={post}
                          onOpen={handleOpenArticle}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Newsletter Subscription Block */}
                <NewsletterSignup />
              </div>
            )}
          </main>

          <Footer
            settings={settings}
            onSelectCategory={setCurrentCategory}
          />
        </>
      )}
    </div>
  );
}
