"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// The four characters after "GF-". Typing is the path that works on any
// phone at the counter; the camera reader comes later.

const TAMANHO = 4;

export function CodigoForm({ valorInicial = "" }: { valorInicial?: string }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState(
    valorInicial.replace(/^GF-/i, "").toUpperCase().slice(0, TAMANHO),
  );
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    campo.current?.focus();
  }, []);

  function buscar(valor: string) {
    const limpo = valor.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, TAMANHO);
    setCodigo(limpo);
    // Look it up as soon as the code is complete — no extra tap with a
    // customer waiting.
    if (limpo.length === TAMANHO) {
      router.push(`/parceiro/retirada?codigo=${limpo}`);
    }
  }

  return (
    <div className="mt-4">
      <label className="block">
        <span className="mb-2 block text-[13px] font-bold leading-none text-[#4a4a44]">
          Código do cliente
        </span>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-xl font-bold text-muted">
            GF-
          </span>
          <input
            ref={campo}
            value={codigo}
            onChange={(e) => buscar(e.target.value)}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            aria-label="Código do cliente, 4 caracteres"
            placeholder="0000"
            className="h-[64px] w-full rounded-[16px] border-[1.5px] border-sage-line bg-white pl-[68px] pr-4 font-display text-2xl font-bold tracking-[6px] outline-none placeholder:font-normal placeholder:tracking-[6px] placeholder:text-[#c9c6bc] focus:border-brand"
          />
        </div>
      </label>
    </div>
  );
}
