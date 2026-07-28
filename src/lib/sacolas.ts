import { distanciaAte } from "@/lib/distancia";
import { createSupabaseClient } from "@/lib/supabase";
import type { CategoriaId, ConteudoSacola, Sacola } from "@/lib/types";

// ---- Shapes as they arrive from Supabase --------------------------------
// Note: numeric columns (preco, preco_original) arrive as strings, so we
// convert them with Number() below.
interface BagRow {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  preco: string | number;
  preco_original: string | number | null;
  emoji: string | null;
  cor_thumb: string | null;
  conteudos: ConteudoSacola[] | null;
}

interface EstablishmentRow {
  nome: string;
  endereco: string | null;
  bairro: string | null;
  lat: number | null;
  lng: number | null;
}

interface ListingRow {
  id: string;
  janela_inicio: string;
  janela_fim: string;
  quantidade_disponivel: number;
  quantidade_total: number;
  status: string;
}

interface ListingWithRelations extends ListingRow {
  bag: BagRow;
  establishment: EstablishmentRow;
}

interface BagWithRelations extends BagRow {
  establishment: EstablishmentRow;
  listings: ListingRow[];
}

const TZ = "America/Sao_Paulo";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "2026-07-21T21:40:00+00:00" -> "18h40" (Porto Alegre time)
function horaMinuto(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(iso))
    .replace(":", "h");
}

// "...T21:00..." -> "21"
function hora(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

// Turn a bag + its establishment + (optional) today's listing into the
// Sacola shape the UI already knows how to render.
function toSacola(
  bag: BagRow,
  est: EstablishmentRow,
  listing: ListingRow | null,
): Sacola {
  const preco = Number(bag.preco);
  const precoOriginal =
    bag.preco_original != null ? Number(bag.preco_original) : preco;
  const pct =
    precoOriginal > preco ? Math.round((1 - preco / precoOriginal) * 100) : 0;
  const disp = listing?.quantidade_disponivel ?? 0;

  return {
    id: bag.id,
    nome: bag.nome,
    loja: est.nome,
    distancia: distanciaAte(est.lat, est.lng),
    emoji: bag.emoji ?? "🛍️",
    corThumb: bag.cor_thumb ?? "#E4EDE3",
    precoOriginal,
    preco,
    desconto: pct > 0 ? `${pct}% off` : "Oferta",
    janela: listing
      ? `${horaMinuto(listing.janela_inicio)} – ${horaMinuto(listing.janela_fim)}`
      : "",
    janelaNota: listing
      ? `Restam ${disp} ${disp === 1 ? "unidade" : "unidades"}`
      : "",
    timer: listing ? `até ${hora(listing.janela_fim)}h` : "hoje",
    disponivel: disp,
    total: listing?.quantidade_total ?? 0,
    janelaFim: listing?.janela_fim ?? null,
    avaliacao: 4.8, // TODO: média real quando houver avaliações (reviews)
    endereco: [est.endereco, est.bairro].filter(Boolean).join(" — "),
    descricao: bag.descricao ?? "",
    conteudos: bag.conteudos ?? [],
    categoria: (bag.categoria as Exclude<CategoriaId, "tudo">) ?? "padaria",
    lat: est.lat ?? null,
    lng: est.lng ?? null,
  };
}

// The consumer feed: every bag with stock available right now.
export async function getSacolasDisponiveis(): Promise<Sacola[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      `id, janela_inicio, janela_fim, quantidade_disponivel, quantidade_total, status,
       bag:bags!inner ( id, nome, descricao, categoria, preco, preco_original, emoji, cor_thumb, conteudos ),
       establishment:establishments!inner ( nome, endereco, bairro, lat, lng )`,
    )
    .eq("status", "ativa")
    .gt("quantidade_disponivel", 0)
    .gt("janela_fim", new Date().toISOString()) // hide sacolas past their pickup window
    .order("janela_fim", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as unknown as ListingWithRelations[];
  return rows.map((row) => toSacola(row.bag, row.establishment, row));
}

// ---- The "Acabando agora" rule -----------------------------------------
// Urgency is the currency of this product: if the banner lies, the whole
// hierarchy stops being believed. So a sacola is only ever highlighted when
// something real is true about it — the window is about to close, or there
// are almost none left. When nothing qualifies, there is NO spotlight and
// "Disponível hoje" takes the top of the feed.

const JANELA_URGENTE_MIN = 90; // window closing within 90 min
const ESTOQUE_URGENTE = 2; // or 2 units or fewer left

export interface Destaque {
  sacola: Sacola;
  /** Says which fact fired, so the banner never overstates it. */
  rotulo: string;
}

function minutosAteFechar(s: Sacola, agora: number): number {
  if (!s.janelaFim) return Infinity;
  return (new Date(s.janelaFim).getTime() - agora) / 60000;
}

export function escolherDestaque(
  sacolas: Sacola[],
  agora: number = Date.now(),
): Destaque | null {
  const candidatas = sacolas.filter((s) => {
    const min = minutosAteFechar(s, agora);
    return min <= JANELA_URGENTE_MIN || s.disponivel <= ESTOQUE_URGENTE;
  });
  if (candidatas.length === 0) return null;

  // Most urgent first: soonest to close, then scarcest.
  const sacola = candidatas.sort((a, b) => {
    const da = minutosAteFechar(a, agora);
    const db = minutosAteFechar(b, agora);
    return da !== db ? da - db : a.disponivel - b.disponivel;
  })[0];

  const min = minutosAteFechar(sacola, agora);
  let rotulo: string;
  if (min <= 60) rotulo = "Fecha em menos de 1h";
  else if (min <= JANELA_URGENTE_MIN) rotulo = "Fecha em menos de 1h30";
  else if (sacola.disponivel === 1) rotulo = "Última unidade";
  else rotulo = `Últimas ${sacola.disponivel} unidades`;

  return { sacola, rotulo };
}

// One sacola for the detail / checkout / payment screens, by bag id.
export async function getSacolaPorId(id: string): Promise<Sacola | undefined> {
  if (!UUID_RE.test(id)) return undefined; // stale/non-uuid url -> not found

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bags")
    .select(
      `id, nome, descricao, categoria, preco, preco_original, emoji, cor_thumb, conteudos,
       establishment:establishments!inner ( nome, endereco, bairro, lat, lng ),
       listings ( id, janela_inicio, janela_fim, quantidade_disponivel, quantidade_total, status )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  const bag = data as unknown as BagWithRelations;
  const ativa =
    (bag.listings ?? [])
      .filter((l) => l.status === "ativa")
      .sort(
        (a, b) =>
          new Date(a.janela_fim).getTime() - new Date(b.janela_fim).getTime(),
      )[0] ??
    (bag.listings ?? [])[0] ??
    null;

  return toSacola(bag, bag.establishment, ativa);
}
