"use client";

import { useState } from "react";

const periodos = ["7 dias", "30 dias", "Total"];

export function PeriodChips() {
  const [ativo, setAtivo] = useState("7 dias");

  return (
    <div className="flex gap-2 px-5 pb-1.5 pt-3">
      {periodos.map((p) => (
        <button
          key={p}
          onClick={() => setAtivo(p)}
          className={`flex-1 rounded-full border-[1.5px] py-2 text-xs font-bold ${
            ativo === p
              ? "border-brand bg-brand text-white"
              : "border-sage-line bg-white text-muted"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
