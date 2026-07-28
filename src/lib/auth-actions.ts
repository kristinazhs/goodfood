"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { geocodarEndereco } from "./geocode";
import { createSupabaseServerClient } from "./supabase-server";

export type AuthState = { error?: string };

// Translate the most common Supabase auth errors into friendly pt-BR.
function traduzErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já tem uma conta. Tente entrar.";
  if (m.includes("email") && m.includes("invalid")) return "E-mail inválido.";
  if (m.includes("password") && m.includes("short"))
    return "A senha é muito curta.";
  return "Não foi possível concluir. Tente novamente.";
}

export async function signInConsumer(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { error: "Preencha e-mail e senha." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) return { error: traduzErro(error.message) };

  redirect("/consumidor");
}

export async function signUpConsumer(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const aceite = formData.get("aceite") === "on";

  if (!nome) return { error: "Informe seu nome." };
  if (!email) return { error: "Informe seu e-mail." };
  if (senha.length < 8)
    return { error: "A senha precisa ter ao menos 8 caracteres." };
  if (!aceite)
    return { error: "Aceite os termos de uso para criar sua conta." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    // Passed to the profile-creation trigger as user metadata. Phone is no
    // longer asked for at signup — the shop only needs it to warn about a
    // specific order, so it's collected then, not upfront.
    options: { data: { role: "consumer", nome } },
  });
  if (error) return { error: traduzErro(error.message) };

  redirect("/consumidor");
}

/**
 * Is the Google provider configured in Supabase?
 *
 * Flip to true ONLY after enabling it in Supabase → Authentication →
 * Providers → Google, with a client ID/secret from Google Cloud.
 *
 * This flag is needed because signInWithOAuth() happily builds an authorize
 * URL even when the provider is off — the failure only happens after the
 * browser has already left the app, and Supabase answers with raw JSON
 * ("Unsupported provider: provider is not enabled"). Sending someone to that
 * is worse than telling them here.
 */
const GOOGLE_ATIVO = false;

export async function signInWithGoogle(
  _prev: AuthState,
  _formData: FormData,
): Promise<AuthState> {
  if (!GOOGLE_ATIVO) {
    return {
      error:
        "Entrar com Google ainda não está disponível. Crie sua conta com e-mail por enquanto.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const origem = (await headers()).get("origin") ?? "";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origem}/auth/callback?next=/consumidor` },
  });

  if (error || !data?.url) {
    return {
      error:
        "Não foi possível entrar com Google agora. Tente com seu e-mail.",
    };
  }

  redirect(data.url);
}

export async function signInEstablishment(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { error: "Preencha e-mail e senha." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) return { error: traduzErro(error.message) };

  if (data.user?.user_metadata?.role !== "establishment") {
    await supabase.auth.signOut();
    return {
      error: "Esta conta não é de um estabelecimento. Use a entrada de consumidor.",
    };
  }

  redirect("/parceiro");
}

export async function signUpEstablishment(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nome = String(formData.get("nome") ?? "").trim(); // nome do negócio
  const cnpj = String(formData.get("cnpj") ?? "").trim();
  const endereco = String(formData.get("endereco") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!nome) return { error: "Informe o nome do negócio." };
  if (!email) return { error: "Informe o e-mail." };
  if (senha.length < 8)
    return { error: "A senha precisa ter ao menos 8 caracteres." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { role: "establishment", nome, telefone } },
  });
  if (error) return { error: traduzErro(error.message) };

  // Create the establishment record, owned by the just-created account.
  // (The signup session is active here, so RLS owner_id = auth.uid() passes.)
  const userId = data.user?.id;
  if (userId) {
    // Turn the address into map coordinates (best-effort; null if it fails).
    const geo = endereco ? await geocodarEndereco(endereco) : null;
    const { error: estErr } = await supabase.from("establishments").insert({
      owner_id: userId,
      nome,
      cnpj: cnpj || null,
      categoria: categoria || null,
      endereco: endereco || null,
      lat: geo?.lat ?? null,
      lng: geo?.lng ?? null,
    });
    if (estErr) {
      return { error: "Conta criada, mas falhou ao salvar os dados do negócio: " + estErr.message };
    }
  }

  redirect("/parceiro");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function atualizarPerfil(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  if (!nome) return { error: "Informe seu nome." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/consumidor/entrar");

  const { error } = await supabase
    .from("profiles")
    .update({ nome, telefone: telefone || null })
    .eq("id", user.id);
  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  redirect("/consumidor/perfil");
}
