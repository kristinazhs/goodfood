import { haQuanto, horaMinutoSP, hojeSP } from "./datas";
import { janelaForaDoHorario, type Horarios } from "./horarios";
import type { PedidoStatus } from "./pedidos";
import { createSupabaseServerClient } from "./supabase-server";
import type { SacolaLoja } from "./types";

interface BagLite {
  nome: string;
  preco: string | number;
  emoji: string | null;
  cor_thumb: string | null;
}

interface ListingRow {
  id: string;
  janela_inicio: string;
  janela_fim: string;
  quantidade_total: number;
  quantidade_disponivel: number;
  status: string;
  bag: BagLite;
}

interface OrderAgg {
  listing_id: string;
  status: PedidoStatus;
  quantidade: number;
  total: string | number;
}

export interface PainelParceiro {
  establishment: {
    id: string;
    nome: string;
    emoji: string;
    horarios: Horarios;
  } | null;
  sacolas: SacolaLoja[];
  stats: { faturado: number; vendidas: number; resgatada: number };
}

export interface ReservaLoja {
  id: string;
  codigo: string;
  status: PedidoStatus;
  qtd: number;
  total: number;
}

export interface ListingDetalhe {
  id: string;
  nome: string;
  emoji: string;
  janela: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  reservas: ReservaLoja[];
}

const emojiPorCategoria: Record<string, string> = {
  padaria: "🥖",
  refeicao: "🥗",
  mercado: "🧀",
};

const vazio: PainelParceiro = {
  establishment: null,
  sacolas: [],
  stats: { faturado: 0, vendidas: 0, resgatada: 0 },
};

// The owner's establishment, today's listings with real reservation/pickup
// counts, and headline stats — all derived from orders.
export async function getPainelParceiro(): Promise<PainelParceiro> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return vazio;

  const { data: est } = await supabase
    .from("establishments")
    .select("id, nome, categoria, horarios")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) return vazio;
  const horarios = (est.horarios ?? {}) as Horarios;

  const { data: listingsData } = await supabase
    .from("listings")
    .select(
      `id, janela_inicio, janela_fim, quantidade_total, quantidade_disponivel, status,
       bag:bags!inner ( nome, preco, emoji, cor_thumb )`,
    )
    .eq("establishment_id", est.id)
    .eq("data", hojeSP())
    .order("janela_fim", { ascending: true });
  const listings = (listingsData ?? []) as unknown as ListingRow[];
  const ids = listings.map((l) => l.id);

  let orders: OrderAgg[] = [];
  if (ids.length > 0) {
    const { data } = await supabase
      .from("orders")
      .select("listing_id, status, quantidade, total")
      .in("listing_id", ids);
    orders = (data ?? []) as unknown as OrderAgg[];
  }

  // Per-listing counts (all in bags).
  const agg = new Map<
    string,
    { reservada: number; retirada: number; naoRetirada: number; receita: number }
  >();
  ids.forEach((id) =>
    agg.set(id, { reservada: 0, retirada: 0, naoRetirada: 0, receita: 0 }),
  );
  let faturado = 0;
  let vendidas = 0;
  let resgatada = 0;
  for (const o of orders) {
    const a = agg.get(o.listing_id);
    if (!a) continue;
    const q = o.quantidade;
    const t = Number(o.total);
    if (o.status === "reservado") a.reservada += q;
    else if (o.status === "retirado") {
      a.retirada += q;
      a.receita += t;
      faturado += t;
      vendidas += q;
      resgatada += q;
    } else if (o.status === "nao_retirado") {
      a.naoRetirada += q;
      a.receita += t;
      faturado += t;
      vendidas += q;
    }
  }

  const sacolas: SacolaLoja[] = listings.map((l) => {
    const a = agg.get(l.id)!;
    return {
      id: l.id,
      nome: l.bag.nome,
      emoji: l.bag.emoji ?? "🛍️",
      corThumb: l.bag.cor_thumb ?? "#E4EDE3",
      preco: Number(l.bag.preco),
      retiradaLabel: `Retirada ${horaMinutoSP(l.janela_inicio)} – ${horaMinutoSP(l.janela_fim)}`,
      ativa: l.quantidade_disponivel,
      reservada: a.reservada,
      retirada: a.retirada,
      naoRetirada: a.naoRetirada,
      receita: a.receita,
      alerta: a.naoRetirada > 0,
      foraDoHorario: janelaForaDoHorario(
        horarios,
        l.janela_inicio,
        l.janela_fim,
      ),
    };
  });

  return {
    establishment: {
      id: est.id,
      nome: est.nome,
      emoji: emojiPorCategoria[est.categoria ?? ""] ?? "🏪",
      horarios,
    },
    sacolas,
    stats: { faturado, vendidas, resgatada },
  };
}

interface ListingDetalheRow {
  id: string;
  janela_inicio: string;
  janela_fim: string;
  quantidade_total: number;
  quantidade_disponivel: number;
  bag: { nome: string; emoji: string | null };
  establishment: { owner_id: string | null };
}

// One listing plus its reservations, for the owner to fulfill.
export async function getListingDetalhe(
  listingId: string,
): Promise<ListingDetalhe | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("listings")
    .select(
      `id, janela_inicio, janela_fim, quantidade_total, quantidade_disponivel,
       bag:bags!inner ( nome, emoji ),
       establishment:establishments!inner ( owner_id )`,
    )
    .eq("id", listingId)
    .maybeSingle();
  if (!data) return null;

  const l = data as unknown as ListingDetalheRow;
  if (l.establishment.owner_id !== user.id) return null; // not the owner

  const { data: ordersData } = await supabase
    .from("orders")
    .select("id, codigo, status, quantidade, total")
    .eq("listing_id", listingId)
    .order("reserved_at", { ascending: false });

  const reservas: ReservaLoja[] = (
    (ordersData ?? []) as unknown as {
      id: string;
      codigo: string;
      status: PedidoStatus;
      quantidade: number;
      total: string | number;
    }[]
  ).map((o) => ({
    id: o.id,
    codigo: o.codigo,
    status: o.status,
    qtd: o.quantidade,
    total: Number(o.total),
  }));

  return {
    id: l.id,
    nome: l.bag.nome,
    emoji: l.bag.emoji ?? "🛍️",
    janela: `${horaMinutoSP(l.janela_inicio)} – ${horaMinutoSP(l.janela_fim)}`,
    quantidadeTotal: l.quantidade_total,
    quantidadeDisponivel: l.quantidade_disponivel,
    reservas,
  };
}

// ---- P1: today's pickup queue -------------------------------------------
// The counter's number-one job. It used to live inside each listing, two
// navigations deep with a customer waiting.

export interface ItemFila {
  id: string;
  codigo: string;
  cliente: string;
  nomeSacola: string;
  qtd: number;
  status: PedidoStatus;
  /** "18h44" — when it was collected; null while still waiting. */
  retiradoAs: string | null;
}

export interface FilaHoje {
  itens: ItemFila[];
  aguardando: number;
  total: number;
  /** End of the last pickup window still open today. */
  ateAs: string | null;
}

interface FilaRow {
  id: string;
  codigo: string;
  cliente_nome: string | null;
  status: PedidoStatus;
  quantidade: number;
  picked_up_at: string | null;
  reserved_at: string;
  listing: { janela_fim: string; bag: { nome: string } };
}

/** "Kristina Zhirosh" -> "Kristina Z." — enough to call out at a counter. */
export function nomeCurto(nome: string | null): string {
  const limpo = (nome ?? "").trim();
  if (!limpo) return "Cliente";
  const partes = limpo.split(/\s+/);
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`;
}

export async function getFilaHoje(): Promise<FilaHoje> {
  const vaziaFila: FilaHoje = { itens: [], aguardando: 0, total: 0, ateAs: null };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return vaziaFila;

  const { data: est } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) return vaziaFila;

  const { data: listingsData } = await supabase
    .from("listings")
    .select("id, janela_fim")
    .eq("establishment_id", est.id)
    .eq("data", hojeSP());
  const listings = (listingsData ?? []) as { id: string; janela_fim: string }[];
  if (listings.length === 0) return vaziaFila;

  const { data } = await supabase
    .from("orders")
    .select(
      `id, codigo, cliente_nome, status, quantidade, picked_up_at, reserved_at,
       listing:listings!inner ( janela_fim, bag:bags!inner ( nome ) )`,
    )
    .in(
      "listing_id",
      listings.map((l) => l.id),
    )
    .order("reserved_at", { ascending: false });

  const rows = (data ?? []) as unknown as FilaRow[];

  // Waiting first (that's the work), then collected, newest first — the
  // collected ones stay visible for auditing.
  const peso = (s: PedidoStatus) => (s === "reservado" ? 0 : 1);
  const itens: ItemFila[] = rows
    .map((o) => ({
      id: o.id,
      codigo: o.codigo,
      cliente: nomeCurto(o.cliente_nome),
      nomeSacola: o.listing.bag.nome,
      qtd: o.quantidade,
      status: o.status,
      retiradoAs: o.picked_up_at ? horaMinutoSP(o.picked_up_at) : null,
    }))
    .sort((a, b) => peso(a.status) - peso(b.status));

  const abertas = listings
    .map((l) => l.janela_fim)
    .filter((f) => new Date(f).getTime() > Date.now())
    .sort();

  return {
    itens,
    aguardando: itens.filter((i) => i.status === "reservado").length,
    total: itens.length,
    ateAs: abertas.length > 0 ? horaMinutoSP(abertas[abertas.length - 1]) : null,
  };
}

// ---- P2: find an order by its pickup code --------------------------------

export interface PedidoPorCodigo {
  id: string;
  codigo: string;
  cliente: string;
  nomeSacola: string;
  qtd: number;
  total: number;
  janela: string;
  status: PedidoStatus;
  /** Set when the code is valid but can't be delivered right now. */
  impedimento: string | null;
}

interface CodigoRow {
  id: string;
  codigo: string;
  cliente_nome: string | null;
  status: PedidoStatus;
  quantidade: number;
  total: string | number;
  listing: {
    establishment_id: string;
    janela_inicio: string;
    janela_fim: string;
    bag: { nome: string };
  };
}

/**
 * Look up a pickup code for THIS shop. Returns null when the code doesn't
 * belong here at all; returns the order with `impedimento` set when it does
 * exist but shouldn't be handed over — three people arriving at once is
 * exactly when a wrong bag goes out.
 */
export async function getPedidoPorCodigo(
  codigo: string,
): Promise<PedidoPorCodigo | null> {
  const limpo = codigo.trim().toUpperCase();
  if (limpo.length < 4) return null;
  const completo = limpo.startsWith("GF-") ? limpo : `GF-${limpo}`;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: est } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) return null;

  const { data } = await supabase
    .from("orders")
    .select(
      `id, codigo, cliente_nome, status, quantidade, total,
       listing:listings!inner ( establishment_id, janela_inicio, janela_fim,
         bag:bags!inner ( nome ) )`,
    )
    .eq("codigo", completo)
    .maybeSingle();
  if (!data) return null;

  const o = data as unknown as CodigoRow;
  if (o.listing.establishment_id !== est.id) return null; // another shop's code

  let impedimento: string | null = null;
  if (o.status === "retirado") impedimento = "Esta sacola já foi retirada.";
  else if (o.status === "cancelado") impedimento = "Este pedido foi cancelado.";
  else if (o.status === "nao_retirado")
    impedimento = "A janela deste pedido já encerrou (não retirado).";

  return {
    id: o.id,
    codigo: o.codigo,
    cliente: nomeCurto(o.cliente_nome),
    nomeSacola: o.listing.bag.nome,
    qtd: o.quantidade,
    total: Number(o.total),
    janela: `${horaMinutoSP(o.listing.janela_inicio)} – ${horaMinutoSP(o.listing.janela_fim)}`,
    status: o.status,
    impedimento,
  };
}

// ---- P3/P5: saved models -------------------------------------------------
// A `bag` IS the model: the recurring template (name, price, contents,
// allergens, photo). A `listing` is one day's offer of it. Publishing is a
// daily, repetitive chore, so the form's fast path is picking a model rather
// than filling seven fields from scratch.

export interface Modelo {
  bagId: string;
  nome: string;
  categoria: string;
  preco: number;
  precoOriginal: number | null;
  conteudos: { label: string; tag: string }[];
  alergenos: string[];
  fotoUrl: string | null;
  /** Defaults carried over from the last time this model was published. */
  quantidade: number;
  janelaInicio: string; // "18:40"
  janelaFim: string; // "19:00"
  /** How many times it has been published — the design shows "usado 24×". */
  usos: number;
  /** True when it's already on sale today. */
  publicadoHoje: boolean;
}

interface ModeloRow {
  id: string;
  nome: string;
  categoria: string | null;
  preco: string | number;
  preco_original: string | number | null;
  conteudos: { label: string; tag: string }[] | null;
  alergenos: string[] | null;
  foto_url: string | null;
  listings: {
    data: string;
    janela_inicio: string;
    janela_fim: string;
    quantidade_total: number;
  }[];
}

function horaHHMM(iso: string): string {
  return horaMinutoSP(iso).replace("h", ":");
}

export async function getModelos(): Promise<Modelo[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: est } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) return [];

  const { data } = await supabase
    .from("bags")
    .select(
      `id, nome, categoria, preco, preco_original, conteudos, alergenos, foto_url,
       listings ( data, janela_inicio, janela_fim, quantidade_total )`,
    )
    .eq("establishment_id", est.id)
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as ModeloRow[];
  const hoje = hojeSP();

  return rows.map((b) => {
    const listings = [...(b.listings ?? [])].sort((a, c) =>
      c.janela_inicio.localeCompare(a.janela_inicio),
    );
    const ultima = listings[0];
    return {
      bagId: b.id,
      nome: b.nome,
      categoria: b.categoria ?? "padaria",
      preco: Number(b.preco),
      precoOriginal:
        b.preco_original != null ? Number(b.preco_original) : null,
      conteudos: b.conteudos ?? [],
      alergenos: b.alergenos ?? [],
      fotoUrl: b.foto_url,
      quantidade: ultima?.quantidade_total ?? 5,
      janelaInicio: ultima ? horaHHMM(ultima.janela_inicio) : "18:00",
      janelaFim: ultima ? horaHHMM(ultima.janela_fim) : "19:00",
      usos: listings.length,
      publicadoHoje: listings.some((l) => l.data === hoje),
    };
  });
}

// ---- P5: the shop itself -------------------------------------------------

export interface Loja {
  id: string;
  nome: string;
  endereco: string;
  categoria: string | null;
  /** Public profile — what a consumer sees on the shop's page. */
  descricao: string | null;
  fotoUrl: string | null;
  horarios: Horarios;
}

export async function getLoja(): Promise<Loja | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("establishments")
    .select("id, nome, endereco, bairro, categoria, descricao, foto_url, horarios")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    nome: data.nome,
    endereco: [data.endereco, data.bairro].filter(Boolean).join(" — "),
    categoria: data.categoria,
    descricao: data.descricao,
    fotoUrl: data.foto_url,
    horarios: (data.horarios ?? {}) as Horarios,
  };
}

// ---- G: real reviews for the owning shop, with its reply -----------------
// The screen was mock until now, which is why "Responder" did nothing: there
// was no review to answer. The reviewer's name comes from orders.cliente_nome
// (migration 0011) because a shop cannot read profiles.

export interface AvaliacaoLoja {
  id: string;
  autor: string;
  quando: string;
  nota: number;
  texto: string;
  sacola: string | null;
  resposta: string | null;
  /** A poor rating is actionable, not just readable. */
  critica: boolean;
}

export interface AvaliacoesLoja {
  itens: AvaliacaoLoja[];
  media: number | null;
  total: number;
  semResposta: number;
}

interface AvaliacaoRow {
  id: string;
  nota: number;
  comentario: string | null;
  created_at: string;
  resposta: string | null;
  order: {
    cliente_nome: string | null;
    listing: { bag: { nome: string } } | null;
  } | null;
}

export async function getAvaliacoes(): Promise<AvaliacoesLoja> {
  const nenhuma: AvaliacoesLoja = {
    itens: [],
    media: null,
    total: 0,
    semResposta: 0,
  };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return nenhuma;

  const { data: est } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!est) return nenhuma;

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `id, nota, comentario, created_at, resposta,
       order:orders ( cliente_nome, listing:listings ( bag:bags ( nome ) ) )`,
    )
    .eq("establishment_id", est.id)
    .order("created_at", { ascending: false });

  // An unread error here used to look like "no reviews yet", which is a very
  // different thing to tell a shop owner.
  if (error) throw new Error("Não foi possível carregar as avaliações.");

  const linhas = (data ?? []) as unknown as AvaliacaoRow[];
  const itens: AvaliacaoLoja[] = linhas.map((r) => ({
    id: r.id,
    autor: r.order?.cliente_nome ?? "Cliente",
    quando: haQuanto(r.created_at),
    nota: r.nota,
    texto: r.comentario ?? "",
    sacola: r.order?.listing?.bag?.nome ?? null,
    resposta: r.resposta,
    critica: r.nota <= 3,
  }));

  const total = itens.length;
  const media =
    total > 0 ? itens.reduce((s, a) => s + a.nota, 0) / total : null;

  return {
    itens,
    media,
    total,
    semResposta: itens.filter((a) => !a.resposta).length,
  };
}
