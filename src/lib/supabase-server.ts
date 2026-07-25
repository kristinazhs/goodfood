import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, getSupabaseAnonKey } from "./supabase-config";

// Auth-aware Supabase client for use in Server Components, Server Actions and
// Route Handlers. It reads the logged-in user's session from cookies, so
// queries run as that user (and Row Level Security applies to them).
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, where cookies can't be set.
          // The middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}
