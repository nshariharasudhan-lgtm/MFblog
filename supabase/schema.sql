-- ==============================================================================
-- NIVESHEDITORIAL - COMPLETE SUPABASE SQL SCHEMA
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. ADMIN PROFILES & AUTH TABLE (Admin Dashboard Authentication)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- References auth.users(id) if Supabase Auth is linked
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'editor', 'analyst')),
    full_name TEXT NOT NULL DEFAULT 'Admin Analyst',
    password_hash TEXT, -- Stored hashed pass for local/custom admin authentication
    must_change_password BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Initial Super Admin Profile with ns.hariharasudhan@gmail.com
-- Initial dummy password: AdminNivesh2026! (can be changed immediately after login)
INSERT INTO public.admin_profiles (email, role, full_name, password_hash, must_change_password)
VALUES (
    'ns.hariharasudhan@gmail.com',
    'super_admin',
    'Hari Hara Sudhan',
    'AdminNivesh2026!',
    true
)
ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    updated_at = now();

-- ==============================================================================
-- 2. SUBSCRIBERS TABLE (Newsletter & Investment Reports)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    category_preferences TEXT[] DEFAULT '{"Fund Comparison", "Market Trends"}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'pending')),
    source TEXT DEFAULT 'website_modal',
    ip_address TEXT,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);

-- ==============================================================================
-- 3. SAVING ARTICLES / POSTS TABLE (Content Management & EEAT Research)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Fund Comparison', 'Performance Analysis', 'Market Trends', 'Category Deep-Dive', 'SIP Strategies')),
    tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    author_name TEXT NOT NULL DEFAULT 'Dr. Arindam Sen, CFA',
    author_title TEXT NOT NULL DEFAULT 'Senior Research Analyst & SEBI NISM Certified Advisor',
    author_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    cover_image TEXT,
    read_time_minutes INTEGER DEFAULT 5,
    views_count INTEGER DEFAULT 0,
    amfi_scheme_codes TEXT[] DEFAULT '{}',
    amfi_data_snapshot JSONB DEFAULT '[]'::jsonb,
    seo_metadata JSONB DEFAULT '{
      "meta_title": "",
      "meta_description": "",
      "primary_keyword": "",
      "secondary_keywords": [],
      "target_queries": [],
      "eeat_score": 95,
      "risk_rating": "Very High (Equity)"
    }'::jsonb,
    social_shares JSONB DEFAULT '{"linkedin": null, "twitter": null, "threads": null}'::jsonb,
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for Google Search Console rapid crawler resolution
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- ==============================================================================
-- 4. READER COMMENTS TABLE (Moderated Discussions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'spam')),
    reply_to UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    admin_reply TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);

-- ==============================================================================
-- 5. SOCIAL MEDIA SCHEDULES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.social_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'threads')),
    copy_text TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 6. SITE SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. Posts Policies
CREATE POLICY "Public read published posts" ON public.posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Allow anon/authenticated insert and update posts" ON public.posts
    FOR ALL USING (true) WITH CHECK (true);

-- 2. Subscribers Policies
CREATE POLICY "Anyone can subscribe" ON public.subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select subscribers" ON public.subscribers
    FOR SELECT USING (true);

CREATE POLICY "Allow update subscribers" ON public.subscribers
    FOR UPDATE USING (true);

-- 3. Comments Policies
CREATE POLICY "Public can view approved comments" ON public.comments
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Anyone can submit comments" ON public.comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow comment management" ON public.comments
    FOR ALL USING (true);

-- 4. Admin Profiles Policies
CREATE POLICY "Admin profiles select" ON public.admin_profiles
    FOR SELECT USING (true);

CREATE POLICY "Admin profiles update" ON public.admin_profiles
    FOR UPDATE USING (true);

-- 5. Site Settings & Social Schedules Policies
CREATE POLICY "Full access to site_settings" ON public.site_settings
    FOR ALL USING (true);

CREATE POLICY "Full access to social_schedules" ON public.social_schedules
    FOR ALL USING (true);
