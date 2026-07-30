"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { geocodarEndereco } from "./geocode";
import { createSupabaseServerClient } from "./supabase-server";

export type EnderecoState = { error?: string };

/**
 * Only one address can be the principal one. The partial unique index in 0019
 * enforces that at the database level, so the old principal has to be cleared
 * before the new one is set — otherwise the write fails.
 */
async function limparPrincipal(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  profileId: string,
) {
  await supabase
    .from("enderecos")
    .update({ principal: false })
    .eq("profile_id", profileId)
    .eq("principal", true);
}

export async function salvarEndereco(
  _prev: EnderecoState,
  formData: FormData,
): Promise<EnderecoState> {
  const id = String(formData.get("id") ?? "").trim();
  const rotulo = String(formData.get("rotulo") ?? "").trim() || "Casa";
  const endereco = String(formData.get("endereco") ?? "").trim();
  const complemento = String(formData.get("complemento") ?? "").trim();
  const principal = formData.get("principal") === "on";

  if (!endereco) return { error: "Informe o endereço." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  // Coordinates are what make the distances real. Best-effort: a street the
  // geocoder doesn't know still saves, it just can't drive distances yet.
  const geo = await geocodarEndereco(endereco);

  const { count } = await supabase
    .from("enderecos")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);
  // The first address a person saves is their principal one by definition.
  const seraPrincipal = principal || (count ?? 0) === 0;

  if (seraPrincipal) await limparPrincipal(supabase, user.id);

  const campos = {
    rotulo,
    endereco,
    complemento: complemento || null,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    principal: seraPrincipal,
  };

  const { error } = id
    ? await supabase
        .from("enderecos")
        .update(campos)
        .eq("id", id)
        .eq("profile_id", user.id) // never touch someone else's address
    : await supabase
        .from("enderecos")
        .insert({ profile_id: user.id, ...campos });

  if (error) return { error: "Não foi possível salvar: " + error.message };

  revalidatePath("/consumidor");
  redirect("/consumidor/perfil/enderecos?salvo=1");
}

export async function definirPrincipal(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  // Called from the addresses screen AND from the feed's address button, so
  // it returns to whichever one asked. Same-site paths only.
  const bruto = String(formData.get("voltar") ?? "");
  const voltar =
    bruto.startsWith("/") && !bruto.startsWith("//")
      ? bruto
      : "/consumidor/perfil/enderecos?principal=1";
  if (!id) redirect(voltar);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/consumidor/entrar");

  await limparPrincipal(supabase, user.id);
  await supabase
    .from("enderecos")
    .update({ principal: true })
    .eq("id", id)
    .eq("profile_id", user.id);

  // Every distance in the app is measured from here, so the feed has to go.
  revalidatePath("/consumidor");
  redirect(voltar);
}

export async function removerEndereco(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/consumidor/perfil/enderecos");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/consumidor/entrar");

  await supabase
    .from("enderecos")
    .delete()
    .eq("id", id)
    .eq("profile_id", user.id);

  // Deleting the principal one leaves nobody in charge: promote the oldest
  // survivor rather than silently falling back to the default address.
  const { data: restantes } = await supabase
    .from("enderecos")
    .select("id, principal")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true });

  if (restantes?.length && !restantes.some((e) => e.principal)) {
    await supabase
      .from("enderecos")
      .update({ principal: true })
      .eq("id", restantes[0].id)
      .eq("profile_id", user.id);
  }

  revalidatePath("/consumidor");
  redirect("/consumidor/perfil/enderecos?removido=1");
}
