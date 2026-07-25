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

export async function publicarSacola(
  _prev: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const quantidade = Math.floor(Number(formData.get("quantidade") ?? 0));
  const preco = parsePreco(formData.get("preco"));
  const precoOriginal = parsePreco(formData.get("precoOriginal"));
  const janelaInicio = String(formData.get("janelaInicio") ?? "");
  const janelaFim = String(formData.get("janelaFim") ?? "");

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
    .maybeSingle();
  if (!est) return { error: "Não encontramos o seu estabelecimento." };

  const categoria = est.categoria ?? "padaria";

  // 1. The bag (recurring template).
  const { data: bag, error: bagErr } = await supabase
    .from("bags")
    .insert({
      establishment_id: est.id,
      nome,
      descricao: descricao || null,
      categoria,
      preco,
      preco_original: precoOriginal || null,
      emoji: emojiPorCategoria[categoria] ?? "🛍️",
      cor_thumb: "#E4EDE3",
      conteudos: [],
    })
    .select("id")
    .single();
  if (bagErr || !bag)
    return { error: "Falha ao criar a sacola: " + (bagErr?.message ?? "") };

  // 2. The listing (today's offer of that bag).
  const { error: listErr } = await supabase.from("listings").insert({
    bag_id: bag.id,
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
