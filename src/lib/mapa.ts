import type { Sacola } from "./types";

/**
 * Which sacola the map's bottom card shows, and whether the selected shop is
 * sold out.
 *
 * "Most urgent wins" alone surfaced bags with nothing left — including as the
 * card the map opens on, before anything is tapped. A shop can still be
 * selected when it is sold out (a pin you can see but can't touch reads as a
 * bug, and someone may want the shop for tomorrow), but the card then says so
 * instead of offering a reservation nobody can make.
 */
export function escolherNoMapa(
  visiveis: Sacola[],
  lojaSelecionada: string | null,
): { selecionada: Sacola | null; esgotada: boolean } {
  const candidatas = lojaSelecionada
    ? visiveis.filter((s) => s.loja === lojaSelecionada)
    : visiveis;

  const porUrgencia = [...candidatas].sort((a, b) =>
    (a.janelaFim ?? "").localeCompare(b.janelaFim ?? ""),
  );

  const selecionada =
    porUrgencia.find((s) => s.disponivel > 0) ?? porUrgencia[0] ?? null;
  if (!selecionada) return { selecionada: null, esgotada: false };

  const esgotada = !visiveis.some(
    (s) => s.loja === selecionada.loja && s.disponivel > 0,
  );
  return { selecionada, esgotada };
}
