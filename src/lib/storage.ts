import { ArticlePost, Comment, SiteSettings, SocialSnippet, AdminUser, Subscriber } from "../types";
import { DEFAULT_SITE_SETTINGS, INITIAL_ARTICLES, INITIAL_COMMENTS } from "./seedData";
import { getSupabaseClient, sanitizeSupabaseUrl, getSupabaseAnonKey } from "./supabaseClient";

const POSTS_KEY = "nivesh_articles_v1";
const COMMENTS_KEY = "nivesh_comments_v1";
const SETTINGS_KEY = "nivesh_settings_v1";
const SOCIAL_KEY = "nivesh_social_v1";
const SUBSCRIBERS_KEY = "nivesh_subscribers_v1";
const ADMIN_SESSION_KEY = "nivesh_admin_session_v1";
const ADMIN_CREDENTIALS_KEY = "nivesh_admin_creds_v1";

// Default admin credentials requested by user
export const DEFAULT_ADMIN_EMAIL = "ns.hariharasudhan@gmail.com";
export const DEFAULT_ADMIN_TEMP_PASSWORD = "AdminNivesh2026!";

interface AdminAuthStore {
  email: string;
  passwordHash: string;
  mustChangePassword: boolean;
  fullName: string;
}

function getStoredAdminCreds(): AdminAuthStore {
  try {
    const raw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (!raw) {
      const initial: AdminAuthStore = {
        email: DEFAULT_ADMIN_EMAIL,
        passwordHash: DEFAULT_ADMIN_TEMP_PASSWORD,
        mustChangePassword: true,
        fullName: "Hari Hara Sudhan",
      };
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: DEFAULT_ADMIN_TEMP_PASSWORD,
      mustChangePassword: true,
      fullName: "Hari Hara Sudhan",
    };
  }
}

// -------------------------------------------------------------
// Admin Authentication Management
// -------------------------------------------------------------
export function getCurrentAdminSession(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const creds = getStoredAdminCreds();

  // Try Supabase auth if user configured Supabase
  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!error && data.user) {
        const adminUser: AdminUser = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          fullName: data.user.user_metadata?.full_name || "Super Admin",
          role: "super_admin",
          mustChangePassword: false,
          lastLogin: new Date().toISOString(),
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }
    } catch {
      // Fallback
    }

    // Also check custom admin_profiles in database
    try {
      const { data } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (data && data.password_hash === password) {
        const adminUser: AdminUser = {
          id: data.id,
          email: data.email,
          fullName: data.full_name || "Super Admin",
          role: data.role || "super_admin",
          mustChangePassword: data.must_change_password ?? false,
          lastLogin: new Date().toISOString(),
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }
    } catch {}
  }

  // Local Admin Profile Validation (Default ns.hariharasudhan@gmail.com / AdminNivesh2026!)
  if (cleanEmail === creds.email.toLowerCase() && password === creds.passwordHash) {
    const adminUser: AdminUser = {
      id: "admin-master",
      email: creds.email,
      fullName: creds.fullName,
      role: "super_admin",
      mustChangePassword: creds.mustChangePassword,
      lastLogin: new Date().toISOString(),
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
    return { success: true, user: adminUser };
  }

  return {
    success: false,
    message: "Invalid credentials. Use ns.hariharasudhan@gmail.com and your password.",
  };
}

export async function changeAdminPassword(
  oldPass: string,
  newPass: string
): Promise<{ success: boolean; message: string }> {
  const creds = getStoredAdminCreds();
  if (creds.passwordHash !== oldPass) {
    return { success: false, message: "Current password does not match." };
  }

  if (newPass.length < 8) {
    return { success: false, message: "New password must be at least 8 characters long." };
  }

  creds.passwordHash = newPass;
  creds.mustChangePassword = false;
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));

  // Sync to Supabase admin_profiles
  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
  if (supabase) {
    try {
      await supabase.from("admin_profiles").upsert(
        {
          email: creds.email,
          password_hash: newPass,
          must_change_password: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
    } catch (err) {
      console.warn("Supabase admin_profiles update warning:", err);
    }
  }

  const active = getCurrentAdminSession();
  if (active) {
    active.mustChangePassword = false;
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(active));
  }

  return { success: true, message: "Password updated successfully!" };
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
  if (supabase) {
    try {
      supabase.auth.signOut();
    } catch {}
  }
}

// -------------------------------------------------------------
// Local Storage Initializers
// -------------------------------------------------------------
function getLocalPosts(): ArticlePost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_ARTICLES));
      return INITIAL_ARTICLES;
    }
    const parsed: ArticlePost[] = JSON.parse(raw);
    
    // Check for any seed articles that don't yet exist in the user's localStorage
    const existingIds = new Set(parsed.map((p) => p.id));
    const missingSeedArticles = INITIAL_ARTICLES.filter((s) => !existingIds.has(s.id));
    const allPosts = [...parsed, ...missingSeedArticles];

    // Keep seed posts content, metadata, and snapshots up-to-date with latest pillar versions
    // Strictly enforce institutional Research Desk attribution; no individual names permitted
    const updated = allPosts.map((p) => {
      const seedMatch = INITIAL_ARTICLES.find((s) => s.id === p.id);
      return {
        ...p,
        authorName: "Research Desk",
        authorTitle: "YieldNest Research Desk",
        ...(seedMatch ? {
          content: seedMatch.content,
          seoMetadata: seedMatch.seoMetadata || p.seoMetadata,
          amfiDataSnapshot: seedMatch.amfiDataSnapshot || p.amfiDataSnapshot,
          tags: seedMatch.tags || p.tags,
          category: seedMatch.category || p.category,
          title: seedMatch.title || p.title,
          excerpt: seedMatch.excerpt || p.excerpt,
        } : {}),
      };
    });

    localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return INITIAL_ARTICLES;
  }
}

function saveLocalPosts(posts: ArticlePost[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

function getLocalComments(): Comment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed: Comment[] = JSON.parse(raw);
    // Filter out dummy comments
    const realComments = parsed.filter((c) => !c.id.startsWith("comm-"));
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(realComments));
    return realComments;
  } catch {
    return [];
  }
}

function saveLocalComments(comments: Comment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

// -------------------------------------------------------------
// Site Settings
// -------------------------------------------------------------
export function getSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const envUrl = sanitizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
    const envKey = getSupabaseAnonKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

    if (!raw) {
      const merged = {
        ...DEFAULT_SITE_SETTINGS,
        supabaseUrl: envUrl,
        supabaseAnonKey: envKey,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      return merged;
    }
    const parsed: SiteSettings = JSON.parse(raw);
    // Always enforce clean, sanitized URL
    parsed.supabaseUrl = sanitizeSupabaseUrl(parsed.supabaseUrl || envUrl);
    if (!parsed.supabaseAnonKey && envKey) {
      parsed.supabaseAnonKey = envKey;
    }
    // Update site name to YieldNest.online if it has legacy name
    if (!parsed.siteName || parsed.siteName === "NiveshEditorial") {
      parsed.siteName = "YieldNest.online";
      parsed.tagline = "Mutual Fund Research & Analytics";
      parsed.contactEmail = "research@yieldnest.online";
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
    }
    // Clean any lingering personal names; strictly institutional Research Desk only
    parsed.authorName = "Research Desk";
    parsed.authorCredentials = "Mutual Fund Research Team";
    parsed.authorTitle = "YieldNest Research Desk";
    parsed.authorBio = "YieldNest.online Research Desk conducts quantitative rolling return audits, expense drag teardowns, and downside capture analyses of Indian Mutual Funds.";
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
    return parsed;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveSiteSettings(settings: SiteSettings) {
  const cleanSettings = {
    ...settings,
    authorName: "Research Desk",
    authorTitle: "YieldNest Research Desk",
    authorCredentials: "Mutual Fund Research Team",
    supabaseUrl: sanitizeSupabaseUrl(settings.supabaseUrl),
    supabaseAnonKey: getSupabaseAnonKey(settings.supabaseAnonKey),
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(cleanSettings));
}

// -------------------------------------------------------------
// Posts API with Supabase Sync
// -------------------------------------------------------------
export async function getAllPosts(): Promise<ArticlePost[]> {
  // 1. Try unified server-side API proxy first (guarantees cross-device & production sync)
  try {
    const res = await fetch("/api/posts");
    if (res.ok) {
      const serverPosts: ArticlePost[] = await res.json();
      if (Array.isArray(serverPosts) && serverPosts.length > 0) {
        const sanitized = serverPosts.map((p) => ({
          ...p,
          authorName: "Research Desk",
          authorTitle: "YieldNest Research Desk",
        }));
        saveLocalPosts(sanitized);
        return sanitized;
      }
    }
  } catch (apiErr) {
    console.warn("[Storage] /api/posts fetch error, attempting direct client fallback:", apiErr);
  }

  // 2. Direct Supabase Client fallback
  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("published_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          slug: d.slug,
          title: d.title,
          excerpt: d.excerpt,
          content: d.content,
          category: d.category,
          tags: d.tags || [],
          status: d.status,
          authorName: "Research Desk",
          authorTitle: "YieldNest Research Desk",
          authorAvatar: d.author_avatar,
          coverImage: d.cover_image,
          readTimeMinutes: d.read_time_minutes || 5,
          viewsCount: d.views_count || 0,
          amfiSchemeCodes: d.amfi_scheme_codes || [],
          amfiDataSnapshot: d.amfi_data_snapshot || [],
          seoMetadata: d.seo_metadata || {},
          socialSnippets: d.social_shares || {},
          scheduledFor: d.scheduled_for,
          publishedAt: d.published_at,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
        saveLocalPosts(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local store:", err);
    }
  }

  return getLocalPosts();
}

export async function getPostBySlug(slug: string): Promise<ArticlePost | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export async function savePost(post: ArticlePost): Promise<ArticlePost> {
  const posts = getLocalPosts();
  const index = posts.findIndex((p) => p.id === post.id);

  let updatedPost = {
    ...post,
    authorName: "Research Desk",
    authorTitle: "YieldNest Research Desk",
    updatedAt: new Date().toISOString(),
  };
  if (!updatedPost.publishedAt && updatedPost.status === "published") {
    updatedPost.publishedAt = new Date().toISOString();
  }

  if (index >= 0) {
    posts[index] = updatedPost;
  } else {
    posts.unshift(updatedPost);
  }
  saveLocalPosts(posts);

  // 1. Sync via Server API (persists to Supabase reliably across networks)
  try {
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPost),
    });
  } catch (apiErr) {
    console.warn("[Storage] /api/posts POST failed:", apiErr);
  }

  // 2. Direct Supabase Client sync
  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);

  if (supabase) {
    try {
      await supabase.from("posts").upsert(
        {
          slug: updatedPost.slug,
          title: updatedPost.title,
          excerpt: updatedPost.excerpt,
          content: updatedPost.content,
          category: updatedPost.category,
          tags: updatedPost.tags,
          status: updatedPost.status,
          author_name: "Research Desk",
          author_title: "YieldNest Research Desk",
          author_avatar: updatedPost.authorAvatar,
          cover_image: updatedPost.coverImage,
          read_time_minutes: updatedPost.readTimeMinutes,
          views_count: updatedPost.viewsCount,
          amfi_scheme_codes: updatedPost.amfiSchemeCodes,
          amfi_data_snapshot: updatedPost.amfiDataSnapshot,
          seo_metadata: updatedPost.seoMetadata,
          social_shares: updatedPost.socialSnippets,
          scheduled_for: updatedPost.scheduledFor,
          published_at: updatedPost.publishedAt,
          updated_at: updatedPost.updatedAt,
        },
        { onConflict: "slug" }
      );
    } catch (err) {
      console.warn("Supabase post upsert warning:", err);
    }
  }

  return updatedPost;
}

export async function deletePost(id: string): Promise<void> {
  const post = getLocalPosts().find((p) => p.id === id);
  const posts = getLocalPosts().filter((p) => p.id !== id);
  saveLocalPosts(posts);

  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
  if (supabase && post) {
    try {
      await supabase.from("posts").delete().eq("slug", post.slug);
    } catch (err) {
      console.warn("Supabase delete failed:", err);
    }
  }
}

export async function incrementPostViews(id: string): Promise<void> {
  const posts = getLocalPosts();
  const p = posts.find((item) => item.id === id);
  if (p) {
    p.viewsCount = (p.viewsCount || 0) + 1;
    saveLocalPosts(posts);
  }
}

// -------------------------------------------------------------
// Comments API
// -------------------------------------------------------------
export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  const comments = getLocalComments();
  return comments.filter((c) => c.postId === postId);
}

export async function getAllComments(): Promise<Comment[]> {
  return getLocalComments();
}

export async function saveComment(comment: Comment): Promise<Comment> {
  const comments = getLocalComments();
  const idx = comments.findIndex((c) => c.id === comment.id);
  if (idx >= 0) {
    comments[idx] = comment;
  } else {
    comments.unshift(comment);
  }
  saveLocalComments(comments);

  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
  if (supabase) {
    try {
      await supabase.from("comments").upsert({
        post_id: comment.postId,
        author_name: comment.authorName,
        author_email: comment.authorEmail,
        content: comment.content,
        status: comment.status,
        admin_reply: comment.adminReply,
        created_at: comment.createdAt,
      });
    } catch (err) {
      console.warn("Supabase comment sync error:", err);
    }
  }

  return comment;
}

export async function deleteComment(id: string): Promise<void> {
  const comments = getLocalComments().filter((c) => c.id !== id);
  saveLocalComments(comments);
}

// -------------------------------------------------------------
// Social Media Schedules Queue
// -------------------------------------------------------------
export function getSocialSchedules(): Array<{
  id: string;
  postId: string;
  postTitle: string;
  platform: "linkedin" | "twitter" | "threads";
  copy: string;
  scheduledTime: string;
  status: "scheduled" | "published" | "draft";
}> {
  try {
    const raw = localStorage.getItem(SOCIAL_KEY);
    if (!raw) {
      const initial = [
        {
          id: "soc-1",
          postId: "post-1",
          postTitle: "Parag Parikh Flexi Cap vs Mirae Asset Large & Midcap",
          platform: "linkedin" as const,
          copy: "📊 Mutual Fund Audit: Parag Parikh Flexi Cap vs Mirae Asset Large & Midcap.\n\nWe evaluated 5-year rolling returns against official AMFI India datasets. Full report on YieldNest.online.\n\n#MutualFunds #InvestingIndia",
          scheduledTime: new Date(Date.now() + 86400000 * 1).toISOString(),
          status: "scheduled" as const,
        },
        {
          id: "soc-2",
          postId: "post-2",
          postTitle: "Small Cap Mutual Funds Stress Test",
          platform: "twitter" as const,
          copy: "🚨 Can your Small Cap Fund survive a liquidity shock? AMFI stress test disclosures for Nippon India vs Quant Small Cap analyzed: 🧵👇",
          scheduledTime: new Date(Date.now() + 86400000 * 2).toISOString(),
          status: "scheduled" as const,
        },
      ];
      localStorage.setItem(SOCIAL_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSocialSchedule(schedule: {
  id: string;
  postId: string;
  postTitle: string;
  platform: "linkedin" | "twitter" | "threads";
  copy: string;
  scheduledTime: string;
  status: "scheduled" | "published" | "draft";
}) {
  const list = getSocialSchedules();
  const idx = list.findIndex((s) => s.id === schedule.id);
  if (idx >= 0) {
    list[idx] = schedule;
  } else {
    list.unshift(schedule);
  }
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(list));
}

export function deleteSocialSchedule(id: string) {
  const list = getSocialSchedules().filter((s) => s.id !== id);
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(list));
}

// -------------------------------------------------------------
// Subscribers Management
// -------------------------------------------------------------
export async function getAllSubscribers(): Promise<Subscriber[]> {
  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          email: d.email,
          name: d.name,
          categoryPreferences: d.category_preferences || [],
          status: d.status || "active",
          subscribedAt: d.subscribed_at || d.created_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase subscribers fetch warning:", err);
    }
  }

  try {
    const raw = localStorage.getItem(SUBSCRIBERS_KEY);
    if (!raw) {
      return [];
    }
    const parsed: Subscriber[] = JSON.parse(raw);
    const realSubscribers = parsed.filter(
      (s) => !s.id.startsWith("sub-1") && !s.id.startsWith("sub-2")
    );
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(realSubscribers));
    return realSubscribers;
  } catch {
    return [];
  }
}

export async function addSubscriber(email: string, name?: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, message: "Valid email is required." };
  }

  const list = await getAllSubscribers();
  if (list.some((s) => s.email.toLowerCase() === cleanEmail)) {
    return { success: true, message: "You are already subscribed to YieldNest.online!" };
  }

  const newSub: Subscriber = {
    id: "sub-" + Date.now(),
    email: cleanEmail,
    name: name?.trim(),
    categoryPreferences: ["Fund Comparison", "Market Trends"],
    status: "active",
    subscribedAt: new Date().toISOString(),
  };

  list.unshift(newSub);
  localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(list));

  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
  if (supabase) {
    try {
      await supabase.from("subscribers").upsert(
        {
          email: newSub.email,
          name: newSub.name,
          category_preferences: newSub.categoryPreferences,
          status: newSub.status,
          subscribed_at: newSub.subscribedAt,
        },
        { onConflict: "email" }
      );
    } catch (err) {
      console.warn("Supabase subscriber sync error:", err);
    }
  }

  return { success: true, message: "Subscribed successfully to verified AMFI research updates!" };
}

export async function deleteSubscriber(id: string): Promise<void> {
  const list = (await getAllSubscribers()).filter((s) => s.id !== id);
  localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(list));

  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
  if (supabase) {
    try {
      await supabase.from("subscribers").delete().eq("id", id);
    } catch {}
  }
}

// -------------------------------------------------------------
// Sync Local Data to Supabase
// -------------------------------------------------------------
export async function syncAllToSupabase(): Promise<{ success: boolean; count: number; message: string }> {
  const settings = getSiteSettings();
  const supabase = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);

  if (!supabase) {
    return {
      success: false,
      count: 0,
      message: "Please configure valid Supabase URL and Anon Key in Site Settings first.",
    };
  }

  try {
    const posts = getLocalPosts();
    let synced = 0;

    for (const p of posts) {
      const { error } = await supabase.from("posts").upsert(
        {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          category: p.category,
          tags: p.tags,
          status: p.status,
          author_name: "Research Desk",
          author_title: "YieldNest Research Desk",
          author_avatar: p.authorAvatar,
          cover_image: p.coverImage,
          read_time_minutes: p.readTimeMinutes,
          views_count: p.viewsCount,
          amfi_scheme_codes: p.amfiSchemeCodes,
          amfi_data_snapshot: p.amfiDataSnapshot,
          seo_metadata: p.seoMetadata,
          social_shares: p.socialSnippets,
          scheduled_for: p.scheduledFor,
          published_at: p.publishedAt,
        },
        { onConflict: "slug" }
      );
      if (!error) synced++;
    }

    // Seed default admin in Supabase admin_profiles
    const creds = getStoredAdminCreds();
    await supabase.from("admin_profiles").upsert(
      {
        email: creds.email,
        full_name: creds.fullName,
        role: "super_admin",
        password_hash: creds.passwordHash,
        must_change_password: creds.mustChangePassword,
      },
      { onConflict: "email" }
    );

    return {
      success: true,
      count: synced,
      message: `Successfully synchronized ${synced} mutual fund research articles with Supabase PostgreSQL!`,
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: err.message || "Failed to sync with Supabase",
    };
  }
}
