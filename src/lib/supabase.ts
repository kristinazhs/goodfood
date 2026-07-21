import { createClient } from "@supabase/supabase-js";

// Creates a Supabase client for reading public catalog data on the server.
// Uses the public ("anon"/publishable) key from .env.local — safe to use
// because Row Level Security decides what each request is allowed to see.
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltam as variáveis do Supabase. Verifique NEXT_PUBLIC_SUPABASE_URL e " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local (local) ou nas " +
        "Environment Variables da Vercel (produção).",
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
