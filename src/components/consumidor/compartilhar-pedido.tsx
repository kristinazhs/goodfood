"use client";

import { useState } from "react";

// "Peça pra um amigo" is an invitation, not a grey button. Under payment at
// reservation it's the only path that still saves the money when the person
// can't collect — so it gets weight.

export function CompartilharPedido({
  codigo,
  nomeSacola,
  dia,
  loja,
  endereco,
  janela,
}: {
  codigo: string;
  nomeSacola: string;
  /** "hoje" | "amanhã" | "02 ago" — this message lands on someone else's
      phone, so the wrong day sends them on the wrong evening. */
  dia: string;
  loja: string;
  endereco: string;
  janela: string;
}) {
  const [copiado, setCopiado] = useState(false);

  const mensagem = [
    `Pode retirar minha sacola do GoodFood?`,
    ``,
    `${nomeSacola} — ${loja}`,
    `Retirada ${dia} entre ${janela}`,
    `${endereco}`,
    ``,
    `Código para mostrar no balcão: ${codigo}`,
  ].join("\n");

  async function compartilhar() {
    // The phone's own share sheet when it exists (WhatsApp, Messages…),
    // clipboard as the fallback on desktop.
    if (navigator.share) {
      try {
        await navigator.share({ text: mensagem });
        return;
      } catch {
        // dismissed — fall through to copying
      }
    }
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={compartilhar}
      className="mx-5 mt-3 flex w-[calc(100%-40px)] items-center gap-3 rounded-2xl bg-sage p-[13px] text-left transition-transform active:scale-[0.98]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-[1.3] text-brand-dark">
          Não vai dar? Peça pra um amigo
        </span>
        <span className="mt-0.5 block text-[12.5px] font-medium leading-[1.35] text-[#4a4a44]">
          {copiado
            ? "Mensagem copiada — é só colar no WhatsApp"
            : "Manda o código e o endereço numa mensagem"}
        </span>
      </span>
      <span className="shrink-0 text-base font-bold leading-none text-brand-dark">
        ›
      </span>
    </button>
  );
}
