import Link from "next/link";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

// The card. One shape, reused on the feed, the map sheet and the order list —
// same reading order every time: photo (with stock) → name → shop → window +
// price. The name gets a whole line and never wraps; the price is the single
// dominant element in the bottom-right.

export function BagCard({
  sacola,
  mostrarDia = true,
}: {
  sacola: Sacola;
  /**
   * Set false where the list is ALREADY grouped under a day heading — the
   * feed prints "Amanhã · 8" and then every card repeated "amanhã ·" inside
   * its own pill. Saying it twice cost about 61px on a 390px screen, which
   * was enough to push the price off the card on an iPhone 12.
   *
   * Defaults to true because the shop page (/loja/[id]) lists a shop's
   * sacolas with no grouping at all, and there a missing "amanhã" is a wrong
   * promise rather than tidy design.
   */
  mostrarDia?: boolean;
}) {
  const temDesconto = sacola.precoOriginal > sacola.preco;
  const comDia = mostrarDia && !sacola.ehHoje;

  return (
    <Link
      href={`/consumidor/sacola/${sacola.id}`}
      className="flex gap-[13px] rounded-[18px] border-[1.5px] border-sage-line bg-white p-[11px] transition-transform active:scale-[0.98]"
    >
      <FotoSacola
        src={sacola.fotoUrl}
        quantidade={sacola.disponivel}
        alt={sacola.nome}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate font-display text-base font-semibold leading-[1.3]">
          {sacola.nome}
        </div>
        <div className="mt-0.5 text-[13px] font-medium leading-[1.3] text-muted">
          {sacola.loja}
          {sacola.distancia ? ` · ${sacola.distancia}` : ""}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-[9px]">
          {/* The day only when it isn't today: "hoje 18h40" would be noise
              on every card, but a missing "amanhã" is a wrong promise.

              The pill may shrink; the price may not. Both used to be
              shrink-0, so when the two together outgrew the row nothing
              could give and the price simply spilled over the card edge.
              Between the two, the price is the one that must never move —
              it is the whole point of the card. */}
          <span className="flex h-[26px] min-w-0 items-center rounded-lg bg-sage px-[9px] text-xs font-bold leading-none text-brand-dark">
            <span className="truncate">
              {comDia ? `${sacola.dia} · ${sacola.janela}` : sacola.janela}
            </span>
          </span>
          <div className="shrink-0 text-right">
            {temDesconto && (
              <div className="text-[11px] font-medium leading-none text-[#8d8d84] line-through">
                {brl(sacola.precoOriginal)}
              </div>
            )}
            <div className="mt-0.5 font-display text-[17px] font-bold leading-none">
              {brl(sacola.preco)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
