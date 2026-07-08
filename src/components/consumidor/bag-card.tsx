import Link from "next/link";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

export function BagCard({ sacola }: { sacola: Sacola }) {
  return (
    <Link
      href={`/consumidor/sacola/${sacola.id}`}
      className="flex items-center gap-[13px] rounded-2xl border-[1.5px] border-sage-line bg-white p-[11px] transition-transform active:scale-[0.98]"
    >
      <span
        className="blob-b flex h-[66px] w-[66px] shrink-0 items-center justify-center text-[27px]"
        style={{ background: sacola.corThumb }}
      >
        {sacola.emoji}
      </span>
      <span className="block flex-1">
        <span className="block font-display text-sm font-semibold">
          {sacola.nome}
        </span>
        <span className="mt-0.5 block text-[11px] text-muted">
          {sacola.loja}
        </span>
        <span className="mt-2 flex items-end justify-between">
          <span className="rounded-md bg-sage px-[7px] py-[3px] text-[10px] font-bold text-brand-dark">
            {sacola.timer}
          </span>
          <span className="font-display text-[15px] font-bold">
            {brl(sacola.preco)}
          </span>
        </span>
      </span>
    </Link>
  );
}
