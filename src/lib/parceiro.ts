import { horaMinutoSP, hojeSP } from "./datas";
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
  establishment: { id: string; nome: string; emoji: string } | null;
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
    .select("id, nome, categoria")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!est) return vazio;

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
    };
  });

  return {
    establishment: {
      id: est.id,
      nome: est.nome,
      emoji: emojiPorCategoria[est.categoria ?? ""] ?? "🏪",
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
