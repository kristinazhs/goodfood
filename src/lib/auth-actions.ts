"use server";

import { redirect } from "next/navigation";
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
  const telefone = String(formData.get("telefone") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!nome) return { error: "Informe seu nome." };
  if (!email) return { error: "Informe seu e-mail." };
  if (senha.length < 8)
    return { error: "A senha precisa ter ao menos 8 caracteres." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    // Passed to the profile-creation trigger as user metadata.
    options: { data: { role: "consumer", nome, telefone } },
  });
  if (error) return { error: traduzErro(error.message) };

  redirect("/consumidor");
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
    const { error: estErr } = await supabase.from("establishments").insert({
      owner_id: userId,
      nome,
      cnpj: cnpj || null,
      categoria: categoria || null,
      endereco: endereco || null,
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
