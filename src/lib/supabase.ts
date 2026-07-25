import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, getSupabaseAnonKey } from "./supabase-config";

// Simple client for reading public catalog data (no user session).
// Row Level Security decides what each request is allowed to see.
export function createSupabaseClient() {
  return createClient(SUPABASE_URL, getSupabaseAnonKey(), {
    auth: { persistSession: false },
  });
}
