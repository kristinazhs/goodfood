import { horaMinutoSP, hojeSP } from "./datas";
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

export interface PainelParceiro {
  establishment: { id: string; nome: string; emoji: string } | null;
  sacolas: SacolaLoja[];
  stats: { faturado: number; vendidas: number; resgatada: number };
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

// The logged-in owner's establishment, today's listings, and headline stats.
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

  const { data } = await supabase
    .from("listings")
    .select(
      `id, janela_inicio, janela_fim, quantidade_total, quantidade_disponivel, status,
       bag:bags!inner ( nome, preco, emoji, cor_thumb )`,
    )
    .eq("establishment_id", est.id)
    .eq("data", hojeSP())
    .order("janela_fim", { ascending: true });

  const rows = (data ?? []) as unknown as ListingRow[];
  const sacolas: SacolaLoja[] = rows.map((l) => ({
    id: l.id,
    nome: l.bag.nome,
    emoji: l.bag.emoji ?? "🛍️",
    corThumb: l.bag.cor_thumb ?? "#E4EDE3",
    preco: Number(l.bag.preco),
    retiradaLabel: `Retirada ${horaMinutoSP(l.janela_inicio)} – ${horaMinutoSP(l.janela_fim)}`,
    // Orders don't exist yet (Step B/C). For now: "Ativa" = units still
    // available; the rest fill in once reservations and pickups are real.
    ativa: l.quantidade_disponivel,
    reservada: 0,
    retirada: 0,
    naoRetirada: 0,
    receita: 0,
  }));

  return {
    establishment: {
      id: est.id,
      nome: est.nome,
      emoji: emojiPorCategoria[est.categoria ?? ""] ?? "🏪",
    },
    sacolas,
    stats: { faturado: 0, vendidas: 0, resgatada: 0 },
  };
}
