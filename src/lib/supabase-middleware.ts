import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, getSupabaseAnonKey } from "./supabase-config";

// Keeps the user's auth session fresh on every request by refreshing the
// token cookie. It does NOT block or redirect anything yet — that (route
// protection) comes in a later sub-step. Public pages keep working.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: don't run code between creating the client and this call.
  await supabase.auth.getUser();

  return response;
}
