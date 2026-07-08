"use client";

import { useEffect, useState } from "react";

export function StatsRow() {
  const [infoAberto, setInfoAberto] = useState(false);

  useEffect(() => {
    if (!infoAberto) return;
    const fechar = () => setInfoAberto(false);
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [infoAberto]);

  return (
    <div className="flex gap-3">
      <div className="relative flex-1 rounded-2xl bg-brand px-3.5 pb-[13px] pt-3.5">
        <span className="absolute -right-5 -top-5 h-[60px] w-[60px] rounded-full bg-white/[0.06]" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setInfoAberto((v) => !v);
          }}
          aria-label="O que conta como faturado"
          className="absolute left-2.5 top-2.5 z-[4] flex h-[17px] w-[17px] items-center justify-center rounded-full bg-white/[0.22] font-display text-[10px] font-extrabold italic text-white"
        >
          i
        </button>
        <div
          className={`absolute left-2.5 top-8 z-50 w-[200px] rounded-xl bg-charcoal px-3 py-2.5 text-[11px] font-medium leading-[1.5] text-white transition-all duration-150 ${
            infoAberto
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0"
          }`}
        >
          💡 Conta apenas sacolas <b>retiradas</b> ou <b>não retiradas</b>{" "}
          (cobradas). Reservas em andamento aparecem só depois da retirada.
        </div>
        <div className="relative z-[2] font-display text-[21px] font-bold text-white">
          R$ 124
        </div>
        <div className="relative z-[2] mt-0.5 text-[10.5px] text-mint">
          faturado hoje
        </div>
      </div>

      <div className="flex-1 rounded-2xl border-[1.5px] border-sage-line bg-white px-3.5 pb-[13px] pt-3.5">
        <div className="font-display text-[21px] font-bold">5</div>
        <div className="mt-0.5 text-[10.5px] text-muted">sacolas vendidas</div>
      </div>

      <div className="flex-1 rounded-2xl border-[1.5px] border-sage-line bg-white px-3.5 pb-[13px] pt-3.5">
        <div className="font-display text-[21px] font-bold">7kg</div>
        <div className="mt-0.5 text-[10.5px] text-muted">comida resgatada</div>
      </div>
    </div>
  );
}
