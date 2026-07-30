import Link from "next/link";
import { IconClock } from "@/components/ui/icons";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

// The one sacola in focus. Structure follows the design exactly: the photo
// band on top, then a single row with name/shop/pickup on the left and the
// prices bottom-aligned on the right.
//
// It only ever renders when `escolherDestaque` found a real reason (see
// sacolas.ts) — this component never decides urgency itself.

export function SpotlightCard({ sacola }: { sacola: Sacola }) {
  const temDesconto = sacola.precoOriginal > sacola.preco;
  const economia = sacola.precoOriginal - sacola.preco;
  const selo = temDesconto
    ? `${sacola.desconto} · economize ${brl(economia)}`
    : sacola.desconto;

  return (
    <Link
      href={`/consumidor/sacola/${sacola.id}`}
      className="relative mx-5 block overflow-hidden rounded-[22px] bg-brand transition-transform active:scale-[0.98]"
    >
      {/* The sacola's own photo. It was showing a striped placeholder even
          when the shop had uploaded one — the small cards had it and the
          biggest card on the screen didn't. */}
      <div className="relative h-[70px]">
        {sacola.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sacola.fotoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(135deg,#2b7c49 0 10px,#25703f 10px 20px)",
            }}
          />
        )}
        <div className="absolute inset-0 flex items-end justify-between px-3 pb-2">
          <span className="inline-flex h-[26px] items-center rounded-full bg-white px-2.5 text-xs font-extrabold leading-none text-brand-dark">
            {selo}
          </span>
          {!sacola.fotoUrl && (
            <span className="font-mono text-[11px] leading-none text-mint">
              foto sacola
            </span>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between gap-2.5 px-4 pb-3.5 pt-3">
        <div className="min-w-0">
          <div className="whitespace-nowrap font-display text-[17px] font-semibold leading-[1.2] text-white">
            {sacola.nome}
          </div>
          <div className="mt-1 whitespace-nowrap text-[12.5px] font-medium leading-[1.3] text-mint">
            {sacola.loja}
            {sacola.distancia ? ` · ${sacola.distancia}` : ""}
          </div>
          <div className="mt-[9px] inline-flex h-[27px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-white/[0.14] px-2.5 text-xs font-bold leading-none text-white">
            <IconClock />
            Retirar {sacola.ehHoje ? sacola.janela : `${sacola.dia} · ${sacola.janela}`}
          </div>
        </div>

        <div className="shrink-0 text-right">
          {temDesconto && (
            <div className="text-xs font-medium leading-none text-[#8fbc9d] line-through">
              {brl(sacola.precoOriginal)}
            </div>
          )}
          <div className="mt-1 font-display text-2xl font-bold leading-[1.1] text-white">
            {brl(sacola.preco)}
          </div>
        </div>
      </div>
    </Link>
  );
}
