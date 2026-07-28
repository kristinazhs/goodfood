import { diaMes } from "./datas";
import { createSupabaseClient } from "./supabase";
import { createSupabaseServerClient } from "./supabase-server";

// Ratings. The reviews table has existed since 0001 with its RLS policies,
// but nothing ever wrote to it — so every ★ in the app was hardcoded to 4.8.
// C7 is where a consumer rates a collected order, which is what makes the
// rating real on C3 and on the partner side.

export interface AvaliacaoPendente {
  orderId: string;
  nomeSacola: string;
  loja: string;
  quando: string;
  fotoUrl: string | null;
}

export interface MinhaAvaliacao {
  id: string;
  loja: string;
  nota: number;
  comentario: string | null;
  quando: string;
}

interface PendenteRow {
  id: string;
  reserved_at: string;
  listing: {
    bag: { nome: string; foto_url: string | null };
    establishment: { nome: string };
  };
}

/**
 * The oldest collected order that hasn't been rated. Asking right after a
 * pickup is the only moment the memory is fresh — today the app never asks.
 */
export async function getAvaliacaoPendente(): Promise<AvaliacaoPendente | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: jaAvaliados } = await supabase
    .from("reviews")
    .select("order_id")
    .eq("consumer_id", user.id);
  const avaliados = new Set(
    (jaAvaliados ?? []).map((r) => (r as { order_id: string }).order_id),
  );

  const { data } = await supabase
    .from("orders")
    .select(
      `id, reserved_at,
       listing:listings!inner (
         bag:bags!inner ( nome, foto_url ),
         establishment:establishments!inner ( nome ) )`,
    )
    .eq("consumer_id", user.id)
    .eq("status", "retirado")
    .order("reserved_at", { ascending: false });

  const rows = (data ?? []) as unknown as PendenteRow[];
  const pendente = rows.find((o) => !avaliados.has(o.id));
  if (!pendente) return null;

  return {
    orderId: pendente.id,
    nomeSacola: pendente.listing.bag.nome,
    loja: pendente.listing.establishment.nome,
    quando: diaMes(pendente.reserved_at),
    fotoUrl: pendente.listing.bag.foto_url,
  };
}

interface MinhaRow {
  id: string;
  nota: number;
  comentario: string | null;
  created_at: string;
  establishment: { nome: string };
}

/** The person's own reviews, newest first — by shop, as the partner sees them. */
export async function getMinhasAvaliacoes(): Promise<MinhaAvaliacao[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("reviews")
    .select(
      `id, nota, comentario, created_at,
       establishment:establishments!inner ( nome )`,
    )
    .eq("consumer_id", user.id)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as MinhaRow[]).map((r) => ({
    id: r.id,
    loja: r.establishment.nome,
    nota: r.nota,
    comentario: r.comentario,
    quando: diaMes(r.created_at),
  }));
}

export interface NotaLoja {
  media: number;
  total: number;
}

/**
 * Average rating per establishment, for the ids given. Reviews are publicly
 * readable, so this works for logged-out visitors too. A shop with no
 * reviews is simply absent from the map — the UI shows no star rather than
 * inventing one.
 */
export async function getNotasPorLoja(
  establishmentIds: string[],
): Promise<Map<string, NotaLoja>> {
  const notas = new Map<string, NotaLoja>();
  if (establishmentIds.length === 0) return notas;

  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("reviews")
    .select("establishment_id, nota")
    .in("establishment_id", establishmentIds);

  const somas = new Map<string, { soma: number; n: number }>();
  for (const r of (data ?? []) as { establishment_id: string; nota: number }[]) {
    const atual = somas.get(r.establishment_id) ?? { soma: 0, n: 0 };
    atual.soma += r.nota;
    atual.n += 1;
    somas.set(r.establishment_id, atual);
  }
  for (const [id, { soma, n }] of somas) {
    notas.set(id, { media: soma / n, total: n });
  }
  return notas;
}
