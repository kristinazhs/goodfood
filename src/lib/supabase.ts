import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, getSupabaseAnonKey } from "./supabase-config";

// Simple client for reading public catalog data (no user session).
// Row Level Security decides what each request is allowed to see.
export function createSupabaseClient() {
  return createClient(SUPABASE_URL, getSupabaseAnonKey(), {
    auth: { persistSession: false },
  });
}

// Browser client that CARRIES THE SESSION (reads the auth cookie), which the
// plain client above deliberately doesn't. Needed for uploads: storage
// policies check auth.uid(), so an anonymous client would be rejected.
export function createSupabaseBrowserClient() {
  return createBrowserClient(SUPABASE_URL, getSupabaseAnonKey());
}
