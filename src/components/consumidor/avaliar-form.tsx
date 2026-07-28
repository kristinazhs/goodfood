"use client";

import { useState } from "react";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import { avaliarPedido } from "@/lib/pedido-actions";
import type { AvaliacaoPendente } from "@/lib/avaliacoes";

// The pending rating, with the stars already on screen. Asking right after a
// pickup is the only moment the memory is fresh — and today the app never
// asks at all, which is why every rating in the product is invented.

export function AvaliarForm({ pendente }: { pendente: AvaliacaoPendente }) {
  const [nota, setNota] = useState(0);
  const [aberto, setAberto] = useState(false);

  return (
    <form
      action={avaliarPedido}
      className="rounded-[18px] border-2 border-brand bg-white p-3.5"
    >
      <input type="hidden" name="orderId" value={pendente.orderId} />
      <input type="hidden" name="nota" value={nota} />

      <div className="flex items-center gap-3">
        <FotoSacola src={pendente.fotoUrl} size={48} radius={12} alt="" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold leading-[1.3]">
            {pendente.nomeSacola}
          </div>
          <div className="mt-0.5 truncate text-[12.5px] font-medium leading-[1.3] text-muted">
            {pendente.loja} · {pendente.quando}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2.5">
        <div className="flex gap-1" role="radiogroup" aria-label="Nota">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={nota === n}
              aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
              onClick={() => {
                setNota(n);
                setAberto(true);
              }}
              className={`text-[22px] leading-none transition-colors ${
                n <= nota ? "text-terracotta" : "text-[#d8d3c8]"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={nota === 0}
          className="h-10 shrink-0 rounded-xl bg-brand px-[15px] text-[13.5px] font-bold text-white disabled:opacity-40"
        >
          Avaliar
        </button>
      </div>

      {/* The comment only appears once a rating is given — it's optional, and
          an empty box before any choice is just noise. */}
      {aberto && (
        <textarea
          name="comentario"
          rows={2}
          maxLength={400}
          placeholder="Conte como foi (opcional)"
          className="mt-3 w-full resize-none rounded-xl border-[1.5px] border-sage-line bg-white px-3 py-2.5 text-[13px] outline-none placeholder:text-muted focus:border-brand"
        />
      )}
    </form>
  );
}
