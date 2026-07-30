import { createSupabaseServerClient } from "./supabase-server";

export interface Profile {
  id: string;
  role: "consumer" | "establishment";
  nome: string | null;
  telefone: string | null;
  /** Digits only. Null on accounts created before 0021. */
  cpf: string | null;
}

// Returns the logged-in user's profile (or null if signed out).
// Safe to call from any Server Component.
export async function getCurrentProfile(): Promise<{
  email: string | null;
  profile: Profile | null;
} | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, nome, telefone, cpf")
    .eq("id", user.id)
    .maybeSingle();

  return { email: user.email ?? null, profile: (profile as Profile) ?? null };
}
