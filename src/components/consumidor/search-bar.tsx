"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CategoriaId } from "@/lib/types";

// Tapping "Buscar" in the category row swaps the address line for this field,
// on the same line — the design deliberately doesn't spend a whole row on a
// search box that is used occasionally.

export function SearchBar({
  q = "",
  cat,
}: {
  q?: string;
  cat: CategoriaId;
}) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  return (
    <form
      action="/consumidor"
      method="get"
      role="search"
      className="mt-[7px] flex items-center gap-2"
    >
      {cat !== "tudo" && <input type="hidden" name="cat" value={cat} />}
      <input type="hidden" name="busca" value="1" />

      <span className="flex flex-1 items-center gap-2 rounded-xl border-[1.5px] border-sage-line bg-white px-3 py-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 22 22"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle cx="10" cy="10" r="6" fill="none" stroke="#6b6b62" strokeWidth="1.9" />
          <path
            d="M14.5 14.5 19 19"
            stroke="#6b6b62"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
        <input
          ref={input}
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar sacola ou loja"
          aria-label="Buscar sacola ou loja"
          className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-muted"
        />
      </span>

      <Link
        href={cat === "tudo" ? "/consumidor" : `/consumidor?cat=${cat}`}
        className="flex h-9 shrink-0 items-center px-1 text-[13px] font-semibold text-muted"
      >
        Cancelar
      </Link>
    </form>
  );
}
