"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { apenasDigitos, cpfValido, telefoneValido } from "./cpf";
import { GOOGLE_ATIVO } from "./flags";
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

/**
 * Where to go after signing in. Someone who picked a sacola and pressed Pagar
 * used to be dropped back on the feed with their choice gone; now the login
 * carries the destination.
 *
 * Only same-site paths are honoured. Anything else — an absolute URL, a
 * protocol-relative "//evil.com", a backslash Chrome would normalise into one
 * — falls back to the feed, so this parameter can never send someone off the
 * site while wearing our login page.
 */
function destinoSeguro(bruto: FormDataEntryValue | null): string {
  const destino = String(bruto ?? "");
  if (!destino.startsWith("/")) return "/consumidor";
  if (destino.startsWith("//") || destino.startsWith("/\\")) return "/consumidor";
  return destino;
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

  redirect(destinoSeguro(formData.get("next")));
}

export async function signUpConsumer(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const cpf = apenasDigitos(String(formData.get("cpf") ?? ""));
  const telefone = apenasDigitos(String(formData.get("telefone") ?? ""));
  const aceite = formData.get("aceite") === "on";

  if (!nome) return { error: "Informe seu nome." };
  if (!email) return { error: "Informe seu e-mail." };
  if (!cpfValido(cpf)) return { error: "CPF inválido. Confira os números." };
  if (!telefoneValido(telefone))
    return { error: "Telefone inválido. Inclua o DDD." };
  if (senha.length < 8)
    return { error: "A senha precisa ter ao menos 8 caracteres." };
  if (!aceite)
    return { error: "Aceite os termos de uso para criar sua conta." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    // role/nome/telefone are read by the profile-creation trigger (0002).
    options: { data: { role: "consumer", nome, telefone } },
  });
  if (error) return { error: traduzErro(error.message) };

  // The trigger predates the CPF column, so it doesn't copy it. Written here
  // instead of changing the trigger, which would mean another migration.
  if (data.user?.id) {
    const { error: cpfErr } = await supabase
      .from("profiles")
      .update({ cpf })
      .eq("id", data.user.id);
    // A duplicate CPF is the one worth naming: the unique index in 0021 means
    // somebody already has an account with it.
    if (cpfErr) {
      return {
        error: cpfErr.code === "23505"
          ? "Já existe uma conta com esse CPF. Tente entrar."
          : "Conta criada, mas não conseguimos salvar seu CPF. Complete em Perfil › Dados pessoais.",
      };
    }
  }

  redirect(destinoSeguro(formData.get("next")));
}

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
  const descricao = String(formData.get("descricao") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefone = String(formData.get("whatsapp") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const aceite = formData.get("aceite") === "on";

  // Opening hours arrive as JSON from the client (one entry per weekday).
  let horarios: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(String(formData.get("horarios") ?? "{}"));
    if (parsed && typeof parsed === "object") horarios = parsed;
  } catch {
    horarios = {};
  }

  if (!nome) return { error: "Informe o nome do negócio." };
  if (!endereco) return { error: "Informe o endereço da retirada." };
  if (!email) return { error: "Informe o e-mail." };
  if (senha.length < 8)
    return { error: "A senha precisa ter ao menos 8 caracteres." };
  if (!aceite)
    return { error: "Aceite o contrato de parceria para continuar." };

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
      descricao: descricao || null,
      // No category on the shop: the consumer filter reads the SACOLA's type,
      // which P3 asks for per bag. A shop-level type only duplicated it.
      categoria: null,
      endereco: endereco || null,
      whatsapp: telefone || null,
      horarios,
      lat: geo?.lat ?? null,
      lng: geo?.lng ?? null,
    });
    if (estErr) {
      return { error: "Conta criada, mas falhou ao salvar os dados do negócio: " + estErr.message };
    }
  }

  redirect("/parceiro?cadastrado=1");
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
  const telefone = apenasDigitos(String(formData.get("telefone") ?? ""));
  const cpf = apenasDigitos(String(formData.get("cpf") ?? ""));
  if (!nome) return { error: "Informe seu nome." };
  if (!cpfValido(cpf)) return { error: "CPF inválido. Confira os números." };
  if (!telefoneValido(telefone))
    return { error: "Telefone inválido. Inclua o DDD." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/consumidor/entrar");

  const { error } = await supabase
    .from("profiles")
    .update({ nome, telefone, cpf })
    .eq("id", user.id);
  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Já existe uma conta com esse CPF."
          : "Não foi possível salvar. Tente novamente.",
    };
  }

  redirect("/consumidor/perfil");
}
