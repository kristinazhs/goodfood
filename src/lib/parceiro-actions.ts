"use server";

import { redirect } from "next/navigation";
import { hojeSP, timestampSP } from "./datas";
import { createSupabaseServerClient } from "./supabase-server";

export type PublishState = { error?: string };

const emojiPorCategoria: Record<string, string> = {
  padaria: "🥐",
  refeicao: "🍽️",
  mercado: "🛒",
};

// Accepts "27,90" or "27.90" or "1.500,00" -> number.
function parsePreco(v: FormDataEntryValue | null): number {
  let s = String(v ?? "").trim();
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

const CATEGORIAS_VALIDAS = ["padaria", "doceria", "refeicao", "mercado"];

export async function publicarSacola(
  _prev: PublishState,
  formData: FormData,
): Promise<PublishState> {
  // When a saved model is chosen we reuse its bag instead of creating a new
  // one. Publishing used to insert a fresh bag every single day, which
  // quietly turned the template table into a pile of duplicates.
  const bagId = String(formData.get("bagId") ?? "").trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const quantidade = Math.floor(Number(formData.get("quantidade") ?? 0));
  const preco = parsePreco(formData.get("preco"));
  const precoOriginal = parsePreco(formData.get("precoOriginal"));
  const janelaInicio = String(formData.get("janelaInicio") ?? "");
  const janelaFim = String(formData.get("janelaFim") ?? "");
  const fotoUrl = String(formData.get("fotoUrl") ?? "").trim();

  const categoriaForm = String(formData.get("categoria") ?? "").trim();
  const alergenos = formData.getAll("alergenos").map(String);
  // Contents arrive as JSON from the client (label + Provável/Possível).
  let conteudos: { label: string; tag: string }[] = [];
  try {
    const cru = String(formData.get("conteudos") ?? "[]");
    const parsed = JSON.parse(cru);
    if (Array.isArray(parsed)) conteudos = parsed;
  } catch {
    conteudos = [];
  }

  if (!nome) return { error: "Dê um nome à sacola." };
  if (!preco || preco <= 0) return { error: "Informe um preço válido." };
  if (!quantidade || quantidade < 1)
    return { error: "Informe uma quantidade de ao menos 1." };
  if (!janelaInicio || !janelaFim)
    return { error: "Defina a janela de retirada." };

  const inicio = timestampSP(janelaInicio);
  const fim = timestampSP(janelaFim);
  if (new Date(fim) <= new Date(inicio))
    return { error: "O fim da janela deve ser depois do início." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { data: est } = await supabase
    .from("establishments")
    .select("id, categoria")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) return { error: "Não encontramos o seu estabelecimento." };

  // The form now asks for the type; the bag used to inherit the shop's own
  // category, so a sacola was born untyped and the consumer filter leaked.
  const categoria = CATEGORIAS_VALIDAS.includes(categoriaForm)
    ? categoriaForm
    : (est.categoria ?? "padaria");

  const campos = {
    nome,
    descricao: descricao || null,
    categoria,
    preco,
    preco_original: precoOriginal || null,
    conteudos,
    alergenos,
    foto_url: fotoUrl || null,
  };

  // 1. The bag (recurring template) — reused when publishing a saved model.
  let bagIdFinal = bagId;
  if (bagIdFinal) {
    const { error: upErr } = await supabase
      .from("bags")
      .update(campos)
      .eq("id", bagIdFinal)
      .eq("establishment_id", est.id); // never touch another shop's model
    if (upErr)
      return { error: "Falha ao atualizar o modelo: " + upErr.message };
  } else {
    const { data: bag, error: bagErr } = await supabase
      .from("bags")
      .insert({
        establishment_id: est.id,
        ...campos,
        emoji: emojiPorCategoria[categoria] ?? "🛍️",
        cor_thumb: "#E4EDE3",
      })
      .select("id")
      .single();
    if (bagErr || !bag)
      return { error: "Falha ao criar a sacola: " + (bagErr?.message ?? "") };
    bagIdFinal = bag.id;
  }

  // 2. The listing (today's offer of that bag).
  const { error: listErr } = await supabase.from("listings").insert({
    bag_id: bagIdFinal,
    establishment_id: est.id,
    data: hojeSP(),
    janela_inicio: inicio,
    janela_fim: fim,
    quantidade_total: quantidade,
    quantidade_disponivel: quantidade,
    status: "ativa",
  });
  if (listErr)
    return { error: "Falha ao publicar a oferta: " + listErr.message };

  redirect("/parceiro");
}

// --- Fulfillment (RLS lets the listing's owner update its orders) ----------

export async function marcarRetirada(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("orders")
    .update({ status: "retirado", picked_up_at: new Date().toISOString() })
    .eq("id", orderId);
  redirect(`/parceiro/sacolas/${listingId}`);
}

export async function marcarNaoRetirada(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("orders")
    .update({ status: "nao_retirado" })
    .eq("id", orderId);
  redirect(`/parceiro/sacolas/${listingId}`);
}

/**
 * P2 — hand the bag over. The consequence is stated on the screen before the
 * button, because the money already left the customer at reservation: this
 * records the pickup and releases the payout, it does NOT charge anyone.
 */
export async function entregarSacola(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) redirect("/parceiro/retirada?erro=1");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "retirado", picked_up_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "reservado"); // never re-deliver an order twice

  if (error) redirect("/parceiro/retirada?erro=1");
  redirect("/parceiro?entregue=1");
}

/**
 * "Salvar modelo" — store the template WITHOUT putting it on sale today.
 * Publishing and saving are different intentions: a shop may prepare a bag
 * type in the morning and decide later whether today has surplus.
 */
export async function salvarModelo(
  _prev: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const bagId = String(formData.get("bagId") ?? "").trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const preco = parsePreco(formData.get("preco"));
  const precoOriginal = parsePreco(formData.get("precoOriginal"));
  const fotoUrl = String(formData.get("fotoUrl") ?? "").trim();
  const categoriaForm = String(formData.get("categoria") ?? "").trim();
  const alergenos = formData.getAll("alergenos").map(String);

  let conteudos: { label: string; tag: string }[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("conteudos") ?? "[]"));
    if (Array.isArray(parsed)) conteudos = parsed;
  } catch {
    conteudos = [];
  }

  if (!nome) return { error: "Dê um nome à sacola." };
  if (!preco || preco <= 0) return { error: "Informe um preço válido." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { data: est } = await supabase
    .from("establishments")
    .select("id, categoria")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) return { error: "Não encontramos o seu estabelecimento." };

  const categoria = CATEGORIAS_VALIDAS.includes(categoriaForm)
    ? categoriaForm
    : (est.categoria ?? "padaria");

  const campos = {
    nome,
    categoria,
    preco,
    preco_original: precoOriginal || null,
    conteudos,
    alergenos,
    foto_url: fotoUrl || null,
  };

  if (bagId) {
    const { error } = await supabase
      .from("bags")
      .update(campos)
      .eq("id", bagId)
      .eq("establishment_id", est.id);
    if (error) return { error: "Falha ao salvar o modelo: " + error.message };
  } else {
    const { error } = await supabase.from("bags").insert({
      establishment_id: est.id,
      ...campos,
      emoji: emojiPorCategoria[categoria] ?? "🛍️",
      cor_thumb: "#E4EDE3",
    });
    if (error) return { error: "Falha ao salvar o modelo: " + error.message };
  }

  redirect("/parceiro/sacolas/nova?salvo=1");
}
