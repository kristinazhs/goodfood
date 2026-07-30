"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { amanhaSP, hojeSP, timestampSP } from "./datas";
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

  // Today or tomorrow — nothing further out. Surplus food is unpredictable,
  // and a shop promising a bag four days ahead will cancel; cancellations are
  // what destroy trust in this category.
  const paraAmanha = String(formData.get("dia") ?? "hoje") === "amanha";
  const data = paraAmanha ? amanhaSP() : hojeSP();

  const inicio = timestampSP(janelaInicio, data);
  const fim = timestampSP(janelaFim, data);
  if (new Date(fim) <= new Date(inicio))
    return { error: "O fim da janela deve ser depois do início." };

  // The form disables "Hoje" once the window has passed, but the check lives
  // here too: this is the bug that let a 22h publish create an 07h00 window
  // in the past, and a form can be bypassed.
  if (!paraAmanha && new Date(fim).getTime() <= Date.now())
    return {
      error: "Essa janela já passou hoje. Publique para amanhã.",
    };

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

  // 1. The bag (recurring template).
  //
  // Publishing NEVER rewrites an existing bag. It used to: picking a model
  // and then changing anything ran an UPDATE on the shared template, so the
  // listing ALREADY published from that model silently changed too — its
  // name and its price, under customers who had already reserved — and the
  // two listings then rendered identically because they were the same bag.
  //
  // So: reuse the model only when the form still matches it exactly.
  // Otherwise this is a different sacola that merely started from one, and
  // it gets its own bag. Editing a model is a separate, explicit act.
  let bagIdFinal = bagId;
  if (bagIdFinal) {
    const { data: modelo } = await supabase
      .from("bags")
      .select("nome, descricao, categoria, preco, preco_original, conteudos, alergenos, foto_url")
      .eq("id", bagIdFinal)
      .eq("establishment_id", est.id) // never read another shop's model
      .maybeSingle();

    const igual =
      modelo != null &&
      modelo.nome === campos.nome &&
      (modelo.descricao ?? null) === campos.descricao &&
      modelo.categoria === campos.categoria &&
      Number(modelo.preco) === campos.preco &&
      (modelo.preco_original == null ? null : Number(modelo.preco_original)) ===
        campos.preco_original &&
      (modelo.foto_url ?? null) === campos.foto_url &&
      JSON.stringify(modelo.conteudos ?? []) === JSON.stringify(campos.conteudos) &&
      JSON.stringify(modelo.alergenos ?? []) === JSON.stringify(campos.alergenos);

    if (!igual) bagIdFinal = ""; // falls through to "create a new bag"
  }

  if (bagIdFinal) {
    // Unchanged: publish another window of the very same sacola.
  } else {
    const { data: bag, error: bagErr } = await supabase
      .from("bags")
      .insert({
        establishment_id: est.id,
        ...campos,
        // Not a model: this row exists because a listing needs something to
        // point at, not because anyone asked to keep it. "Salvar modelo" is
        // what makes one, and it looked like it did nothing while publishing
        // quietly did the same thing.
        modelo: false,
        emoji: emojiPorCategoria[categoria] ?? "🛍️",
        cor_thumb: "#E4EDE3",
      })
      .select("id")
      .single();
    if (bagErr || !bag)
      return { error: "Falha ao criar a sacola: " + (bagErr?.message ?? "") };
    bagIdFinal = bag.id;
  }

  // 2. The listing — the OFFER, carrying its own terms (0024).
  //
  // The terms are copied, not referenced: an offer is a promise made at a
  // moment, so editing the model afterwards must never change what someone
  // already saw, filtered by, or paid.
  const { error: listErr } = await supabase.from("listings").insert({
    bag_id: bagIdFinal,
    establishment_id: est.id,
    data,
    janela_inicio: inicio,
    janela_fim: fim,
    quantidade_total: quantidade,
    quantidade_disponivel: quantidade,
    status: "ativa",
    ...campos,
  });
  if (listErr) {
    // 23505 is the unique index from 0022: this bag is already on sale for
    // this exact window. Naming it beats a raw Postgres message, and it tells
    // the shop the useful thing — change the window, or add stock to the one
    // already published.
    return {
      error:
        listErr.code === "23505"
          ? "Essa sacola já está publicada para essa janela. Escolha outro horário, ou edite a que já está no ar."
          : "Falha ao publicar a oferta: " + listErr.message,
    };
  }

  redirect("/parceiro?publicada=1");
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
    // The explicit "edit this model" path. NOTE: a listing reads its name and
    // price from the bag, so editing a model still changes what an offer
    // already on sale displays. Deliberate here (you asked to change it) but
    // worth knowing — logged in PENDENCIAS.
    const { error } = await supabase
      .from("bags")
      .update({ ...campos, modelo: true })
      .eq("id", bagId)
      .eq("establishment_id", est.id);
    if (error) return { error: "Falha ao salvar o modelo: " + error.message };
  } else {
    const { error } = await supabase.from("bags").insert({
      establishment_id: est.id,
      ...campos,
      modelo: true, // this is the act that makes a model
      emoji: emojiPorCategoria[categoria] ?? "🛍️",
      cor_thumb: "#E4EDE3",
    });
    if (error) return { error: "Falha ao salvar o modelo: " + error.message };
  }

  // Saving a template is finishing something, not staying put: the model now
  // lives in Loja, so that is where it lands, with the confirmation there.
  redirect("/parceiro/perfil?salvo=1");
}

/**
 * P5 — "Publicar hoje" straight from a saved model. Re-publishing what
 * already exists is the most common act of the day, so it should cost one
 * tap. Quantity and window are read from the model's last outing rather
 * than trusted from the form.
 */
export async function publicarModeloHoje(formData: FormData) {
  const bagId = String(formData.get("bagId") ?? "");
  if (!bagId) redirect("/parceiro/perfil?erro=1");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/parceiro/entrar");

  const { data: est } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) redirect("/parceiro/perfil?erro=1");

  // The bag must belong to this shop. Its fields come along as the offer's
  // own terms (0024) — the model is a starting point, not a live reference.
  const { data: bag } = await supabase
    .from("bags")
    .select(
      "id, nome, descricao, categoria, preco, preco_original, conteudos, alergenos, foto_url, peso_kg",
    )
    .eq("id", bagId)
    .eq("establishment_id", est.id)
    .maybeSingle();
  if (!bag) redirect("/parceiro/perfil?erro=1");

  // Already on sale today? Publishing again would put the same sacola on the
  // consumer feed twice — one tap makes that far too easy to do by accident.
  const { data: jaHoje } = await supabase
    .from("listings")
    .select("id")
    .eq("bag_id", bagId)
    .eq("data", hojeSP())
    .eq("status", "ativa")
    .limit(1)
    .maybeSingle();
  if (jaHoje) redirect("/parceiro/perfil?erro=duplicada");

  const { data: ultima } = await supabase
    .from("listings")
    .select("quantidade_total, janela_inicio, janela_fim")
    .eq("bag_id", bagId)
    .order("janela_inicio", { ascending: false })
    .limit(1)
    .maybeSingle();

  const quantidade = ultima?.quantidade_total ?? 5;
  // Same clock times as last time, today.
  const hhmm = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));

  const inicio = ultima ? timestampSP(hhmm(ultima.janela_inicio)) : timestampSP("18:00");
  const fim = ultima ? timestampSP(hhmm(ultima.janela_fim)) : timestampSP("19:00");

  const { error } = await supabase.from("listings").insert({
    bag_id: bagId,
    establishment_id: est.id,
    data: hojeSP(),
    janela_inicio: inicio,
    janela_fim: fim,
    quantidade_total: quantidade,
    quantidade_disponivel: quantidade,
    status: "ativa",
    nome: bag.nome,
    descricao: bag.descricao,
    categoria: bag.categoria,
    preco: bag.preco,
    preco_original: bag.preco_original,
    conteudos: bag.conteudos,
    alergenos: bag.alergenos,
    foto_url: bag.foto_url,
    peso_kg: bag.peso_kg,
  });
  // Same unique index: the one-tap path lands on the existing "duplicada"
  // message, which already says to use the full form for a second batch.
  if (error) {
    redirect(
      error.code === "23505"
        ? "/parceiro/perfil?erro=duplicada"
        : "/parceiro/perfil?erro=1",
    );
  }

  redirect("/parceiro?publicado=1");
}

/**
 * G — the shop's public reply to a review.
 *
 * Goes through responder_avaliacao() rather than a plain update: RLS grants
 * whole rows, so an update policy on reviews would also let a shop rewrite
 * the customer's rating and comment. The function writes the reply and
 * nothing else, and checks ownership itself. Passing an empty string clears
 * a reply that was sent by mistake.
 */
export async function responderAvaliacao(
  _prev: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const reviewId = String(formData.get("reviewId") ?? "");
  const resposta = String(formData.get("resposta") ?? "").trim();
  if (!reviewId) return { error: "Avaliação não encontrada." };
  if (resposta.length > 600)
    return { error: "A resposta ficou longa demais (máx. 600 caracteres)." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("responder_avaliacao", {
    p_review_id: reviewId,
    p_resposta: resposta,
  });
  if (error) return { error: "Não foi possível salvar a resposta." };

  revalidatePath("/parceiro/avaliacoes");
  return {};
}

/**
 * H — the shop's public profile: photo, description and opening hours.
 *
 * Categoria is deliberately absent: the bag type lives on the sacola, and a
 * shop-level type only duplicated it (decided 2026-07-27).
 */
export async function salvarPerfilPublico(
  _prev: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const descricao = String(formData.get("descricao") ?? "").trim();
  const fotoUrl = String(formData.get("fotoUrl") ?? "").trim();

  if (descricao.length > 400)
    return { error: "A descrição ficou longa demais (máx. 400 caracteres)." };

  let horarios: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(String(formData.get("horarios") ?? "{}"));
    if (parsed && typeof parsed === "object") horarios = parsed;
  } catch {
    horarios = {};
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { data: est } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) return { error: "Não encontramos o seu estabelecimento." };

  const { error } = await supabase
    .from("establishments")
    .update({
      descricao: descricao || null,
      foto_url: fotoUrl || null,
      horarios,
    })
    .eq("id", est.id);
  if (error) return { error: "Não foi possível salvar: " + error.message };

  redirect("/parceiro/perfil?perfil=1");
}

/**
 * B — payout details. One row per shop, upserted.
 *
 * Nothing is paid out on this yet: the provider (Mercado Pago vs Pagar.me)
 * is undecided and will dictate the final field list. The screen says so.
 */
export async function salvarDadosBancarios(
  _prev: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const campo = (n: string) => String(formData.get(n) ?? "").trim();
  const tipoConta = campo("tipoConta") === "poupanca" ? "poupanca" : "corrente";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { data: est } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) return { error: "Não encontramos o seu estabelecimento." };

  const { error } = await supabase.from("dados_bancarios").upsert(
    {
      establishment_id: est.id,
      titular: campo("titular") || null,
      documento: campo("documento") || null,
      banco: campo("banco") || null,
      agencia: campo("agencia") || null,
      conta: campo("conta") || null,
      tipo_conta: tipoConta,
      chave_pix: campo("chavePix") || null,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "establishment_id" },
  );
  if (error) return { error: "Não foi possível salvar: " + error.message };

  redirect("/parceiro/perfil?repasse=1");
}

/**
 * E/I — remove a published sacola, or stop selling it.
 *
 * Deleting is only allowed while nobody has reserved. orders.listing_id is
 * ON DELETE RESTRICT (0001), so Postgres refuses it anyway — but we check
 * first, because a foreign-key error is not something to show a shop owner.
 *
 * Once there is a reservation the honest action is "encerrar": stop new
 * sales and take it off the feed, while the people who already paid keep
 * their bags and their codes. Deleting under them would take food someone
 * paid for, with no refund path wired up.
 */
export async function encerrarOuApagarListing(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  if (!listingId) redirect("/parceiro");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/parceiro/entrar");

  // Ownership is checked here rather than trusted from the form.
  const { data: listing } = await supabase
    .from("listings")
    .select("id, establishment:establishments!inner ( owner_id )")
    .eq("id", listingId)
    .maybeSingle();

  const dono = (
    listing as unknown as { establishment: { owner_id: string | null } } | null
  )?.establishment?.owner_id;
  if (!listing || dono !== user.id) redirect("/parceiro");

  // Only orders that still HOLD a bag can block removal. A cancelled one was
  // refunded and nobody is waiting on it — counting it was why a listing with
  // a single cancelled order got closed instead of deleted.
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId)
    .neq("status", "cancelado");

  if ((count ?? 0) > 0) {
    // Someone is holding one: close it instead of deleting it.
    const { error } = await supabase
      .from("listings")
      .update({ status: "encerrada", quantidade_disponivel: 0 })
      .eq("id", listingId);
    redirect(error ? `/parceiro/sacolas/${listingId}?erro=1` : "/parceiro?encerrada=1");
  }

  const { error } = await supabase.from("listings").delete().eq("id", listingId);

  // A cancelled order still references the row, and orders.listing_id is ON
  // DELETE RESTRICT — deliberately, because an order is the record that money
  // moved. So the delete can fail even though nobody is holding a bag. Close
  // it instead: the offer leaves the app either way, and the record survives.
  if (error?.code === "23503") {
    const { error: fecharErr } = await supabase
      .from("listings")
      .update({ status: "encerrada", quantidade_disponivel: 0 })
      .eq("id", listingId);
    redirect(
      fecharErr
        ? `/parceiro/sacolas/${listingId}?erro=1`
        : "/parceiro?encerrada=1",
    );
  }

  redirect(error ? `/parceiro/sacolas/${listingId}?erro=1` : "/parceiro?apagada=1");
}

/**
 * "Remover dos modelos" — takes a bag out of Loja's list without deleting it.
 *
 * Deleting the bag is never right: bags -> listings is ON DELETE CASCADE, so
 * it would silently remove the offers published from that model, and fail
 * outright once any of those had an order. Clearing the flag touches nothing
 * else — published offers, their reservations and the history all stand.
 */
export async function removerModelo(formData: FormData) {
  const bagId = String(formData.get("bagId") ?? "");
  if (!bagId) redirect("/parceiro/perfil");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/parceiro/entrar");

  const { data: est } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) redirect("/parceiro/perfil?erro=1");

  const { error } = await supabase
    .from("bags")
    .update({ modelo: false })
    .eq("id", bagId)
    .eq("establishment_id", est.id); // never touch another shop's model

  redirect(error ? "/parceiro/perfil?erro=1" : "/parceiro/perfil?removido=1");
}
