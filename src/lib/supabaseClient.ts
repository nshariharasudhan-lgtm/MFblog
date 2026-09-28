import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Cache client instance
let cachedClient: SupabaseClient | null = null;
let currentUrl: string = "";
let currentKey: string = "";

// Production fallback credentials (Public Anon key for YieldNest publication database)
export const DEFAULT_SUPABASE_URL = "https://iguesvdehoxhsanasrcm.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlndWVzdmRlaG94aHNhbmFzcmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MjQzMDAsImV4cCI6MjEwNjAwMDMwMH0.7fVc5O0r3zXy5ijkUfKperP1AO4LrvRUuNz6xaYvBBc";

// Helper to sanitize Supabase URL (e.g. remove /rest/v1 or trailing slashes)
export function sanitizeSupabaseUrl(url?: string): string {
  let clean = (url || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL || "").trim();
  clean = clean.replace(/\/rest\/v1\/?.*$/i, "");
  clean = clean.replace(/\/+$/, "");
  return clean.trim();
}

export function getSupabaseAnonKey(customKey?: string): string {
  return (customKey || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY || "").trim();
}

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const url = sanitizeSupabaseUrl(customUrl);
  const key = getSupabaseAnonKey(customKey);

  if (!url || !key || url.includes("your-project") || key.includes("your-anon")) {
    return null;
  }

  if (cachedClient && currentUrl === url && currentKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    currentUrl = url;
    currentKey = key;
    return cachedClient;
  } catch (err) {
    console.error("Supabase initialization error:", err);
    return null;
  }
}

export async function testSupabaseConnection(urlInput: string, keyInput: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = sanitizeSupabaseUrl(urlInput);
    const key = getSupabaseAnonKey(keyInput);

    if (!url || !key) {
      return { success: false, message: "URL and Anon Key are required" };
    }
    const client = createClient(url, key);

    // Test pinging tables or auth endpoint
    const { error } = await client.from("posts").select("id").limit(1);
    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      // 42P01 means table does not exist yet (credentials are valid!)
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: error?.code === "42P01" 
        ? "Connected successfully! (Note: run supabase/schema.sql in Supabase SQL Editor to create tables)"
        : "Connected successfully to Supabase database!",
    };
  } catch (err: any) {
    return { success: false, message: err.message || "Connection failed" };
  }
}

