import Link from "next/link";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

export function SpotlightCard({ sacola }: { sacola: Sacola }) {
  return (
    <Link
      href={`/consumidor/sacola/${sacola.id}`}
      className="relative mx-5 mb-[18px] block h-[180px] overflow-hidden rounded-[22px] bg-brand transition-transform active:scale-[0.98]"
    >
      <span className="absolute -left-5 -top-5 h-[70px] w-[70px] rounded-full bg-white/[0.06]" />
      <span className="absolute -bottom-2.5 right-[110px] h-10 w-10 rounded-full bg-white/[0.06]" />

      <span className="absolute left-4 top-3.5 z-[3] rounded-full bg-white px-[11px] py-[5px] text-[10px] font-extrabold tracking-[0.3px] text-brand-dark">
        {sacola.desconto}
      </span>

      <span
        className="blob-c absolute right-5 top-7 flex h-[114px] w-[114px] items-center justify-center text-[48px]"
        style={{
          background: sacola.corThumb,
          boxShadow: "0 0 0 5px rgba(255,255,255,0.18)",
        }}
      >
        {sacola.emoji}
      </span>

      <span className="absolute bottom-4 left-4 z-[3] block max-w-[160px]">
        <span className="block font-display text-[17.5px] font-bold leading-[1.2] text-white">
          {sacola.nome}
        </span>
        <span className="mt-[3px] block text-[11px] text-mint">
          {sacola.loja}
          {sacola.distancia ? ` · ${sacola.distancia}` : ""}
        </span>
        <span className="mt-[9px] flex items-baseline gap-[7px]">
          <span className="text-[11px] text-[#8FBC9D] line-through">
            R${sacola.precoOriginal}
          </span>
          <span className="font-display text-xl font-bold text-white">
            {brl(sacola.preco)}
          </span>
        </span>
      </span>
    </Link>
  );
}
