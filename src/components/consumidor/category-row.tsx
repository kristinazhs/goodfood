"use client";

import { useState } from "react";
import type { CategoriaId } from "@/lib/types";

const categorias: { id: CategoriaId; emoji: string; label: string }[] = [
  { id: "tudo", emoji: "✨", label: "Tudo" },
  { id: "padaria", emoji: "🥖", label: "Padaria" },
  { id: "refeicao", emoji: "🍽️", label: "Refeição" },
  { id: "mercado", emoji: "🥦", label: "Mercado" },
];

export function CategoryRow() {
  const [ativa, setAtiva] = useState<CategoriaId>("tudo");

  return (
    <div className="flex gap-4 overflow-x-auto px-5 pb-[18px] pt-1.5">
      {categorias.map((cat) => {
        const active = cat.id === ativa;
        return (
          <button
            key={cat.id}
            onClick={() => setAtiva(cat.id)}
            className="flex shrink-0 cursor-pointer flex-col items-center gap-1.5"
          >
            <span
              className={`flex h-[58px] w-[58px] items-center justify-center text-[25px] ${
                active ? "blob-a-active bg-brand text-white" : "blob-a bg-sage"
              }`}
            >
              {cat.emoji}
            </span>
            <span
              className={
                active
                  ? "text-[11px] font-bold text-brand-dark"
                  : "text-[11px] font-semibold text-muted"
              }
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
