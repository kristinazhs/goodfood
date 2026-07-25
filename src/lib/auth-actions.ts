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

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
