// Shared Supabase connection settings.
// The URL is public (it appears in every browser request), so it's a constant.
// The key is the credential, so it comes from the environment.
export const SUPABASE_URL = "https://kvfwnzhajqlbypozdadg.supabase.co";

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Falta a variável NEXT_PUBLIC_SUPABASE_ANON_KEY. Defina-a no arquivo " +
        ".env.local (local) e nas Environment Variables da Vercel (produção).",
    );
  }
  return key;
}
