import { horaMinutoSP } from "./datas";
import { createSupabaseServerClient } from "./supabase-server";

export type PedidoStatus = "reservado" | "retirado" | "nao_retirado" | "cancelado";

export interface PedidoDetalhe {
  id: string;
  codigo: string;
  status: PedidoStatus;
  qtd: number;
  total: number;
  bagId: string;
  nomeSacola: string;
  emoji: string;
  corThumb: string;
  loja: string;
  endereco: string;
  janela: string;
}

export interface PedidoResumo {
  id: string;
  status: PedidoStatus;
  total: number;
  bagId: string;
  nomeSacola: string;
  emoji: string;
  loja: string;
  janela: string;
}

interface OrderRow {
  id: string;
  codigo: string;
  status: PedidoStatus;
  quantidade: number;
  total: string | number;
  listing: {
    bag_id: string;
    janela_inicio: string;
    janela_fim: string;
    bag: { nome: string; emoji: string | null; cor_thumb: string | null };
    establishment: { nome: string; endereco: string | null; bairro: string | null };
  };
}

const SELECT = `id, codigo, status, quantidade, total,
  listing:listings!inner ( bag_id, janela_inicio, janela_fim,
    bag:bags!inner ( nome, emoji, cor_thumb ),
    establishment:establishments!inner ( nome, endereco, bairro ) )`;

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
    nomeSacola: o.listing.bag.nome,
    emoji: o.listing.bag.emoji ?? "🛍️",
    corThumb: o.listing.bag.cor_thumb ?? "#E4EDE3",
    loja: o.listing.establishment.nome,
    endereco: [o.listing.establishment.endereco, o.listing.establishment.bairro]
      .filter(Boolean)
      .join(" — "),
    janela: `${horaMinutoSP(o.listing.janela_inicio)} – ${horaMinutoSP(o.listing.janela_fim)}`,
  };
}

// The logged-in consumer's own orders, newest first.
export async function getMeusPedidos(): Promise<PedidoResumo[]> {
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
  return rows.map((o) => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    bagId: o.listing.bag_id,
    nomeSacola: o.listing.bag.nome,
    emoji: o.listing.bag.emoji ?? "🛍️",
    loja: o.listing.establishment.nome,
    janela: `${horaMinutoSP(o.listing.janela_inicio)} – ${horaMinutoSP(o.listing.janela_fim)}`,
  }));
}
