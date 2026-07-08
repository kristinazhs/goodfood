"use client";

import Link from "next/link";
import { useState } from "react";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

export function ReserveBar({ sacola }: { sacola: Sacola }) {
  const [qtd, setQtd] = useState(1);

  return (
    <div className="sticky bottom-0 z-10 flex items-center gap-3.5 border-t border-sage-line bg-white px-5 pb-[22px] pt-4">
      <div className="flex items-center gap-3 rounded-xl bg-sage px-[11px] py-2">
        <button
          onClick={() => setQtd((q) => Math.max(1, q - 1))}
          aria-label="Diminuir quantidade"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-base font-bold text-brand-dark"
        >
          −
        </button>
        <span className="min-w-[14px] text-center text-[15px] font-extrabold">
          {qtd}
        </span>
        <button
          onClick={() => setQtd((q) => Math.min(5, q + 1))}
          aria-label="Aumentar quantidade"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-base font-bold text-brand-dark"
        >
          +
        </button>
      </div>
      <Link
        href={`/consumidor/checkout?sacola=${sacola.id}&qtd=${qtd}`}
        className="flex flex-1 items-center justify-between gap-2 whitespace-nowrap rounded-[14px] bg-brand px-4 py-4 text-sm font-bold text-white"
      >
        <span>Reservar sacola</span>
        <span className="font-display text-[15px]">{brl(sacola.preco * qtd)}</span>
      </Link>
    </div>
  );
}
