"use client";

import Link from "next/link";
import { useState } from "react";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

// Quantity and payment on the same bar, with the charging rule repeated at
// the point of decision — money leaves at reservation, so the button says so.

export function ReserveBar({
  sacola,
  bloqueada = false,
}: {
  sacola: Sacola;
  bloqueada?: boolean;
}) {
  const [qtd, setQtd] = useState(1);
  const max = Math.max(1, Math.min(5, sacola.disponivel));

  if (bloqueada) {
    return (
      <div className="sticky bottom-0 z-10 border-t border-sage-line bg-white px-5 pb-5 pt-3.5">
        <div className="flex h-[52px] items-center justify-center rounded-[14px] bg-sage text-base font-bold text-muted">
          Reservas encerradas
        </div>
        <p className="mt-2 text-center text-[12.5px] font-medium leading-none text-muted">
          Veja outras sacolas disponíveis agora
        </p>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 z-10 border-t border-sage-line bg-white px-5 pb-5 pt-3.5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5 overflow-hidden rounded-[14px] border-[1.5px] border-sage-line">
          <button
            type="button"
            onClick={() => setQtd((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="h-12 w-11 text-xl font-bold leading-none text-muted disabled:opacity-40"
            disabled={qtd <= 1}
          >
            −
          </button>
          <span className="min-w-[26px] text-center text-base font-bold">
            {qtd}
          </span>
          <button
            type="button"
            onClick={() => setQtd((q) => Math.min(max, q + 1))}
            aria-label="Aumentar quantidade"
            className="h-12 w-11 text-xl font-bold leading-none text-brand-dark disabled:opacity-40"
            disabled={qtd >= max}
          >
            +
          </button>
        </div>

        <Link
          href={`/consumidor/checkout?sacola=${sacola.id}&qtd=${qtd}`}
          className="flex h-[52px] flex-1 items-center justify-center rounded-[14px] bg-brand text-base font-bold text-white transition-transform active:scale-[0.98]"
        >
          Pagar · {brl(sacola.preco * qtd)}
        </Link>
      </div>

      <p className="mt-2 text-center text-[12.5px] font-medium leading-none text-muted">
        Pagamento na reserva · reembolso em até 15 min
      </p>
    </div>
  );
}
