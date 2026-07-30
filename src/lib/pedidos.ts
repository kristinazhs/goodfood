import { horaMinutoSP } from "./datas";
import { distanciaAte, type Origem } from "./distancia";
import { createSupabaseServerClient } from "./supabase-server";

export type PedidoStatus = "reservado" | "retirado" | "nao_retirado" | "cancelado";

export interface PedidoDetalhe {
  id: string;
  codigo: string;
  status: PedidoStatus;
  qtd: number;
  total: number;
  bagId: string;
  lojaId: string;
  nomeSacola: string;
  emoji: string;
  corThumb: string;
  fotoUrl: string | null;
  loja: string;
  endereco: string;
  janela: string;
  /** ISO, for the live countdown and the cancellation window. */
  janelaInicio: string;
  janelaFim: string;
  reservadoEm: string;
  metodo: "pix" | "cartao" | null;
  lat: number | null;
  lng: number | null;
}

export interface PedidoResumo {
  id: string;
  codigo: string;
  status: PedidoStatus;
  qtd: number;
  total: number;
  bagId: string;
  lojaId: string;
  nomeSacola: string;
  emoji: string;
  loja: string;
  distancia: string;
  janela: string;
  /** ISO start/end of the pickup window, for the countdown. */
  janelaInicio: string;
  janelaFim: string;
  /** ISO reservation timestamp — groups the history by month. */
  reservadoEm: string;
  /** What this order saved against the shop-window price. */
  economia: number;
  /** Estimated kg of food this order rescued. */
  pesoKg: number;
}

interface OrderRow {
  id: string;
  codigo: string;
  status: PedidoStatus;
  quantidade: number;
  total: string | number;
  reserved_at: string;
  metodo_pagamento: "pix" | "cartao" | null;
  listing: {
    bag_id: string;
    janela_inicio: string;
    janela_fim: string;
    bag: {
      nome: string;
      emoji: string | null;
      cor_thumb: string | null;
      foto_url: string | null;
      preco: string | number;
      preco_original: string | number | null;
      peso_kg: string | number | null;
    };
    establishment: {
      id: string;
      nome: string;
      endereco: string | null;
      bairro: string | null;
      lat: number | null;
      lng: number | null;
    };
  };
}

const SELECT = `id, codigo, status, quantidade, total, reserved_at, metodo_pagamento,
  listing:listings!inner ( bag_id, janela_inicio, janela_fim,
    bag:bags!inner ( nome, emoji, cor_thumb, foto_url, preco, preco_original, peso_kg ),
    establishment:establishments!inner ( id, nome, endereco, bairro, lat, lng ) )`;

// One order (RLS lets the buyer — or the listing's establishment — read it).
export async function getPedidoDetalhe(
  id: string,
): Promise<PedidoDetalhe | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const o = data as unknown as OrderRow;
  return {
    id: o.id,
    codigo: o.codigo,
    status: o.status,
    qtd: o.quantidade,
    total: Number(o.total),
    bagId: o.listing.bag_id,
    lojaId: o.listing.establishment.id,
    nomeSacola: o.listing.bag.nome,
    emoji: o.listing.bag.emoji ?? "🛍️",
    corThumb: o.listing.bag.cor_thumb ?? "#E4EDE3",
    fotoUrl: o.listing.bag.foto_url,
    loja: o.listing.establishment.nome,
    endereco: [o.listing.establishment.endereco, o.listing.establishment.bairro]
      .filter(Boolean)
      .join(" — "),
    janela: `${horaMinutoSP(o.listing.janela_inicio)} – ${horaMinutoSP(o.listing.janela_fim)}`,
    janelaInicio: o.listing.janela_inicio,
    janelaFim: o.listing.janela_fim,
    reservadoEm: o.reserved_at,
    metodo: o.metodo_pagamento,
    lat: o.listing.establishment.lat,
    lng: o.listing.establishment.lng,
  };
}

// The logged-in consumer's own orders, newest first.
export async function getMeusPedidos(
  origem: Origem | null = null,
): Promise<PedidoResumo[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("orders")
    .select(SELECT)
    .eq("consumer_id", user.id)
    .order("reserved_at", { ascending: false });

  const rows = (data ?? []) as unknown as OrderRow[];
  return rows.map((o) => {
    const preco = Number(o.listing.bag.preco);
    const original =
      o.listing.bag.preco_original != null
        ? Number(o.listing.bag.preco_original)
        : preco;
    return {
      id: o.id,
      codigo: o.codigo,
      status: o.status,
      qtd: o.quantidade,
      total: Number(o.total),
      bagId: o.listing.bag_id,
      lojaId: o.listing.establishment.id,
      nomeSacola: o.listing.bag.nome,
      emoji: o.listing.bag.emoji ?? "🛍️",
      loja: o.listing.establishment.nome,
      distancia: distanciaAte(
        o.listing.establishment.lat,
        o.listing.establishment.lng,
        origem,
      ),
      janela: `${horaMinutoSP(o.listing.janela_inicio)} – ${horaMinutoSP(o.listing.janela_fim)}`,
      janelaInicio: o.listing.janela_inicio,
      janelaFim: o.listing.janela_fim,
      reservadoEm: o.reserved_at,
      economia: Math.max(0, original - preco) * o.quantidade,
      pesoKg: Number(o.listing.bag.peso_kg ?? 0) * o.quantidade,
    };
  });
}

export interface Impacto {
  kg: number;
  economizado: number;
  ano: number;
}

/**
 * What the person actually rescued. Only collected orders count — a no-show
 * saved nothing, and counting it would flatter the number into meaninglessness.
 */
export function calcularImpacto(
  pedidos: PedidoResumo[],
  ano: number = new Date().getFullYear(),
): Impacto {
  const doAno = pedidos.filter(
    (p) =>
      p.status === "retirado" &&
      new Date(p.reservadoEm).getFullYear() === ano,
  );
  return {
    kg: doAno.reduce((t, p) => t + p.pesoKg, 0),
    economizado: doAno.reduce((t, p) => t + p.economia, 0),
    ano,
  };
}
