export type ArticleCategory =
  | "Fund Comparison"
  | "Performance Analysis"
  | "Market Trends"
  | "Category Deep-Dive"
  | "SIP Strategies";

export interface AMFISchemeData {
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
  category: string;
  nav: number;
  date: string;
  cagr1Y?: number;
  cagr3Y?: number;
  cagr5Y?: number;
  expenseRatio?: number;
  aumCr?: number;
  riskRating?: string;
  benchmark?: string;
}

export interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  targetQueries?: string[];
  eeatScore?: number;
  riskRating?: string;
  canonicalUrl?: string;
}

export interface SocialSnippet {
  platform: "twitter" | "instagram" | "facebook";
  copy: string;
  scheduledTime?: string;
  status?: "draft" | "scheduled" | "published";
}

export interface DataFreshnessStatus {
  isValid: boolean;
  isOlderThan30Days: boolean;
  staleDatesDetected?: string[];
  warningTriggered?: boolean;
  refetchTriggered?: boolean;
  refetchAttempts?: number;
  message?: string;
  checkedAt?: string;
  verifiedMonth?: string;
}

export interface ArticlePost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  tags: string[];
  status: "published" | "draft" | "scheduled" | "archived";
  authorName: string;
  authorTitle: string;
  authorAvatar?: string;
  coverImage?: string;
  readTimeMinutes: number;
  viewsCount: number;
  amfiSchemeCodes?: string[];
  amfiDataSnapshot?: AMFISchemeData[];
  seoMetadata: SEOMetadata;
  dataFreshness?: DataFreshnessStatus;
  socialSnippets?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: "approved" | "pending" | "spam";
  adminReply?: string;
  createdAt: string;
}

export interface KeywordMetric {
  keyword: string;
  volume: string;
  difficulty: "Low" | "Medium" | "High";
  intent: "Informational" | "Commercial" | "Transactional";
}

export interface KeywordResearchResult {
  seedKeyword: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywordMetrics: KeywordMetric[];
  lsiKeywords: string[];
  faqs: Array<{ question: string; answer: string }>;
  searchIntent: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  authorName: string;
  authorTitle: string;
  authorBio: string;
  authorCredentials: string;
  sebiRegistrationNumber: string;
  contactEmail: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableAutoSocialScheduling: boolean;
  googleSearchConsoleVerification: string;
}

export interface ContentSuggestion {
  title: string;
  category: ArticleCategory;
  hook: string;
  estimatedTraffic: string;
  amfiSchemeCodes?: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: "super_admin" | "editor" | "analyst";
  mustChangePassword?: boolean;
  lastLogin?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  categoryPreferences?: string[];
  status: "active" | "unsubscribed" | "pending";
  subscribedAt: string;
}

