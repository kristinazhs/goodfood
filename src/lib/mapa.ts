import type { Sacola } from "./types";

/**
 * The map is a map of SHOPS, not of sacolas — one pin per shop, because a
 * shop can sell several kinds. The card used to show a single sacola, which
 * meant the map quietly picked one for you and hid the rest: a bakery with
 * four kinds looked like a bakery with one. It now describes the shop and
 * lets you go in and choose.
 */
export interface LojaNoMapa {
  id: string;
  nome: string;
  fotoUrl: string | null;
  distancia: string;
  endereco: string;
  avaliacao: number | null;
  avaliacoesTotal: number;
  /** Units on the shelf across every sacola this shop has right now. */
  quantidade: number;
  /** How many different sacolas are actually buyable — "3 tipos". */
  variedades: number;
  /** Cheapest bag on offer, for "a partir de R$ 21,90". */
  precoMin: number;
  /** The soonest pickup window still open at this shop. */
  janela: string;
  esgotada: boolean;
}

function porUrgencia(a: Sacola, b: Sacola): number {
  return (a.janelaFim ?? "").localeCompare(b.janelaFim ?? "");
}

/**
 * Which shop the bottom card describes. With nothing tapped the map still
 * opens on a decision rather than an empty sheet: the shop with the soonest
 * window wins, matching the order the feed uses — but never a sold-out one,
 * which is what used to happen when "most urgent" was applied to sacolas.
 *
 * A sold-out shop can still be selected by tapping its pin — one you can see
 * but can't touch reads as a bug, and the shop may be worth finding for
 * tomorrow — but the card says so instead of offering a reservation.
 */
export function escolherLojaNoMapa(
  visiveis: Sacola[],
  lojaSelecionada: string | null,
): LojaNoMapa | null {
  let nome = lojaSelecionada;
  if (!nome) {
    const ordenadas = [...visiveis].sort(porUrgencia);
    const preferida =
      ordenadas.find((s) => s.disponivel > 0) ?? ordenadas[0] ?? null;
    nome = preferida?.loja ?? null;
  }
  if (!nome) return null;

  const sacolas = visiveis.filter((s) => s.loja === nome);
  if (sacolas.length === 0) return null;

  const comEstoque = sacolas.filter((s) => s.disponivel > 0);
  // Describe the shop from a bag you could actually buy, when there is one.
  const base = [...(comEstoque.length > 0 ? comEstoque : sacolas)].sort(
    porUrgencia,
  )[0];

  return {
    id: base.lojaId,
    nome,
    fotoUrl: base.lojaFotoUrl,
    distancia: base.distancia,
    endereco: base.endereco,
    avaliacao: base.avaliacao,
    avaliacoesTotal: base.avaliacoesTotal,
    quantidade: sacolas.reduce((n, s) => n + s.disponivel, 0),
    variedades: comEstoque.length,
    precoMin:
      comEstoque.length > 0
        ? Math.min(...comEstoque.map((s) => s.preco))
        : base.preco,
    janela: base.janela,
    esgotada: comEstoque.length === 0,
  };
}
