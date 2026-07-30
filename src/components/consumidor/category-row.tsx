"use client";

import Link from "next/link";
import type { CategoriaId } from "@/lib/types";

// The organic blob shapes are kept deliberately: they're the app's signature.
// The magnifier is the first item, as in the design; tapping it switches the
// whole screen into search mode (C1a), so this row is replaced rather than
// reshuffled — nothing shifts sideways.

const categorias: {
  id: CategoriaId;
  emoji: string;
  label: string;
  blob: string;
}[] = [
  { id: "tudo", emoji: "✨", label: "Tudo", blob: "blob-a" },
  { id: "padaria", emoji: "🥖", label: "Padaria", blob: "blob-a" },
  { id: "doceria", emoji: "🍰", label: "Doceria", blob: "blob-b" },
  { id: "refeicao", emoji: "🍽️", label: "Refeição", blob: "blob-a" },
  { id: "mercado", emoji: "🥦", label: "Mercado", blob: "blob-c" },
];

export function CategoryRow({
  active,
  aoBuscar,
}: {
  active: CategoriaId;
  aoBuscar?: () => void;
}) {
  return (
    <div className="flex gap-[13px] overflow-x-auto px-5 pb-[18px] pt-[18px] [scrollbar-width:none]">
      {aoBuscar && (
        <button
          type="button"
          onClick={aoBuscar}
          aria-label="Buscar"
          className="flex shrink-0 flex-col items-center gap-[7px]"
        >
          <span className="blob-b flex h-[58px] w-[58px] items-center justify-center border-[1.5px] border-sage-line bg-white">
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <circle cx="10" cy="10" r="6" fill="none" stroke="#23231f" strokeWidth="1.9" />
              <path
                d="M14.5 14.5 19 19"
                stroke="#23231f"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-xs font-semibold text-muted">Buscar</span>
        </button>
      )}

      {categorias.map((cat) => {
        const isActive = cat.id === active;
        const href =
          cat.id === "tudo" ? "/consumidor" : `/consumidor?cat=${cat.id}`;
        return (
          <Link
            key={cat.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className="flex shrink-0 flex-col items-center gap-[7px]"
          >
            <span
              className={`flex h-[58px] w-[58px] items-center justify-center text-2xl ${
                isActive ? "blob-a-active bg-brand" : `${cat.blob} bg-sage`
              }`}
            >
              {cat.emoji}
            </span>
            <span
              className={
                isActive
                  ? "text-xs font-bold text-brand-dark"
                  : "text-xs font-semibold text-muted"
              }
            >
              {cat.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
