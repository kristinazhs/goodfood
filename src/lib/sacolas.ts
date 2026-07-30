import { getNotasPorLoja, type NotaLoja } from "@/lib/avaliacoes";
import { diaRelativoSP, ehHojeSP } from "@/lib/datas";
import { distanciaAte, ORIGEM_PADRAO, type Origem } from "@/lib/distancia";
import type { Horarios } from "@/lib/horarios";
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
  alergenos: string[] | null;
  foto_url: string | null;
}

interface EstablishmentRow {
  id: string;
  nome: string;
  endereco: string | null;
  bairro: string | null;
  lat: number | null;
  lng: number | null;
  foto_url: string | null;
}

interface ListingRow {
  id: string;
  bag_id: string;
  janela_inicio: string;
  janela_fim: string;
  quantidade_disponivel: number;
  quantidade_total: number;
  status: string;
  // The offer's own terms, frozen when it was published (0024).
  nome: string;
  descricao: string | null;
  categoria: string | null;
  preco: string | number;
  preco_original: string | number | null;
  conteudos: ConteudoSacola[] | null;
  alergenos: string[] | null;
  foto_url: string | null;
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
/**
 * Sacola shape the UI already knows how to render.
 *
 * Everything a customer is shown comes from the LISTING, not the bag: the
 * offer keeps the terms it was published with (0024), so editing the model
 * afterwards cannot change a price someone has already paid or an allergen
 * list someone relied on. `bag` is left for decoration only.
 */
function toSacola(
  bag: BagRow,
  est: EstablishmentRow,
  listing: ListingRow,
  nota?: NotaLoja,
  origem: Origem = ORIGEM_PADRAO,
): Sacola {
  const preco = Number(listing.preco);
  const precoOriginal =
    listing.preco_original != null ? Number(listing.preco_original) : preco;
  const pct =
    precoOriginal > preco ? Math.round((1 - preco / precoOriginal) * 100) : 0;
  const disp = listing.quantidade_disponivel ?? 0;

  return {
    // The OFFER is what the customer is looking at, so it is what the URL
    // and the reservation key on. Keying on the bag meant two live windows
    // of the same sacola resolved to whichever one the lookup picked —
    // invisible while they were identical, wrong as soon as they aren't.
    id: listing.id,
    bagId: listing.bag_id,
    nome: listing.nome,
    loja: est.nome,
    lojaId: est.id,
    lojaFotoUrl: est.foto_url ?? null,
    distancia: distanciaAte(est.lat, est.lng, origem),
    emoji: bag.emoji ?? "🛍️",
    corThumb: bag.cor_thumb ?? "#E4EDE3",
    fotoUrl: listing.foto_url,
    precoOriginal,
    preco,
    desconto: pct > 0 ? `${pct}% off` : "Oferta",
    janela: `${horaMinuto(listing.janela_inicio)} – ${horaMinuto(listing.janela_fim)}`,
    dia: diaRelativoSP(listing.janela_inicio),
    ehHoje: ehHojeSP(listing.janela_inicio),
    janelaNota: `Restam ${disp} ${disp === 1 ? "unidade" : "unidades"}`,
    timer: `até ${hora(listing.janela_fim)}h`,
    disponivel: disp,
    total: listing.quantidade_total,
    janelaInicio: listing.janela_inicio,
    janelaFim: listing.janela_fim,
    // Real average, or null when the shop has no reviews yet — the UI shows
    // no star rather than inventing one.
    avaliacao: nota ? nota.media : null,
    avaliacoesTotal: nota ? nota.total : 0,
    endereco: [est.endereco, est.bairro].filter(Boolean).join(" — "),
    descricao: listing.descricao ?? "",
    conteudos: listing.conteudos ?? [],
    alergenos: listing.alergenos ?? [],
    categoria:
      (listing.categoria as Exclude<CategoriaId, "tudo">) ?? "padaria",
    lat: est.lat ?? null,
    lng: est.lng ?? null,
  };
}

// The consumer feed: every bag with stock available right now.
export async function getSacolasDisponiveis(
  origem: Origem = ORIGEM_PADRAO,
): Promise<Sacola[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      `id, bag_id, janela_inicio, janela_fim, quantidade_disponivel, quantidade_total, status,
       nome, descricao, categoria, preco, preco_original, conteudos, alergenos, foto_url,
       bag:bags!inner ( id, nome, emoji, cor_thumb ),
       establishment:establishments!inner ( id, nome, endereco, bairro, lat, lng, foto_url )`,
    )
    .eq("status", "ativa")
    .gt("quantidade_disponivel", 0)
    .gt("janela_fim", new Date().toISOString()) // hide sacolas past their pickup window
    .order("janela_fim", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as unknown as ListingWithRelations[];
  const notas = await getNotasPorLoja([
    ...new Set(rows.map((r) => r.establishment.id)),
  ]);
  return rows.map((row) =>
    toSacola(
      row.bag,
      row.establishment,
      row,
      notas.get(row.establishment.id),
      origem,
    ),
  );
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
    // Today only: "última unidade" on something you collect tomorrow is a
    // false alarm, and it would take the most prominent slot on the feed.
    if (!s.ehHoje) return false;
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
/**
 * One published offer, by its own id.
 *
 * This used to take a BAG id and then guess which of that bag's listings the
 * customer meant — "the active one closing soonest". While two listings of a
 * bag were identical that guess was harmless. Now that each offer carries its
 * own price and window, guessing would show one offer and sell another.
 */
export async function getSacolaPorId(
  id: string,
  origem: Origem = ORIGEM_PADRAO,
): Promise<Sacola | undefined> {
  if (!UUID_RE.test(id)) return undefined; // stale/non-uuid url -> not found

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      `id, bag_id, janela_inicio, janela_fim, quantidade_disponivel, quantidade_total, status,
       nome, descricao, categoria, preco, preco_original, conteudos, alergenos, foto_url,
       bag:bags!inner ( id, nome, emoji, cor_thumb ),
       establishment:establishments!inner ( id, nome, endereco, bairro, lat, lng, foto_url )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  const l = data as unknown as ListingWithRelations;
  const notas = await getNotasPorLoja([l.establishment.id]);
  return toSacola(l.bag, l.establishment, l, notas.get(l.establishment.id), origem);
}

// ---- H: the public page of one shop -------------------------------------
// PENDENCIAS listed this as missing and it showed: search results for "Lojas"
// opened a *sacola* because there was nowhere else to go.

export interface LojaPublica {
  id: string;
  nome: string;
  descricao: string | null;
  fotoUrl: string | null;
  endereco: string;
  horarios: Horarios;
  avaliacao: number | null;
  avaliacoesTotal: number;
  sacolas: Sacola[];
}

export async function getLojaPublica(
  id: string,
  origem: Origem = ORIGEM_PADRAO,
): Promise<LojaPublica | null> {
  const supabase = createSupabaseClient();

  const { data: est, error } = await supabase
    .from("establishments")
    .select("id, nome, descricao, foto_url, endereco, bairro, lat, lng, horarios")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar a loja.");
  if (!est) return null;

  const notas = await getNotasPorLoja([est.id]);
  const nota = notas.get(est.id);

  // Its sacolas on sale right now — same rules as the feed, so a shop page
  // can never advertise something the feed would refuse to sell.
  const todas = await getSacolasDisponiveis(origem);

  return {
    id: est.id,
    nome: est.nome,
    descricao: est.descricao,
    fotoUrl: est.foto_url,
    endereco: [est.endereco, est.bairro].filter(Boolean).join(" — "),
    horarios: (est.horarios ?? {}) as Horarios,
    avaliacao: nota?.media ?? null,
    avaliacoesTotal: nota?.total ?? 0,
    sacolas: todas.filter((s) => s.lojaId === est.id),
  };
}
