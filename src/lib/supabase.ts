import { createClient } from "@supabase/supabase-js";

// The Supabase project URL is public — it appears in every browser request
// to the database — so we keep it as a constant, with an optional env
// override. The KEY still comes from the environment (it's the credential).
// Row Level Security is what actually decides what each request may see.
const SUPABASE_URL = "https://kvfwnzhajqlbypozdadg.supabase.co";

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      "Falta a variável NEXT_PUBLIC_SUPABASE_ANON_KEY. Defina-a no arquivo " +
        ".env.local (local) e nas Environment Variables da Vercel (produção).",
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
