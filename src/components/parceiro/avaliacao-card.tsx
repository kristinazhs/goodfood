"use client";

import { useActionState, useState } from "react";
import type { AvaliacaoLoja } from "@/lib/parceiro";
import {
  responderAvaliacao,
  type PublishState,
} from "@/lib/parceiro-actions";

// A poor rating is actionable, not just readable: it carries its own colour
// and leads with the reply. The reply opens in place — a shop answering a
// review at the counter shouldn't lose the list it was reading.

function Estrelas({ nota, critica }: { nota: number; critica?: boolean }) {
  return (
    <div
      className={`mt-[5px] text-[13px] font-bold leading-none ${
        critica ? "text-alert" : "text-terracotta"
      }`}
      aria-label={`${nota} de 5 estrelas`}
    >
      {"★".repeat(nota)}
      {"☆".repeat(5 - nota)}
    </div>
  );
}

export function AvaliacaoCard({ a }: { a: AvaliacaoLoja }) {
  const [aberto, setAberto] = useState(false);
  const [state, action, pending] = useActionState<PublishState, FormData>(
    async (prev, formData) => {
      const r = await responderAvaliacao(prev, formData);
      if (!r.error) setAberto(false);
      return r;
    },
    {},
  );

  return (
    <div
      className={`rounded-2xl border-[1.5px] p-[13px] ${
        a.critica ? "border-[#f3d2ce] bg-alert-bg" : "border-sage-line bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] font-bold leading-none">{a.autor}</span>
        <span className="text-[12.5px] font-medium leading-none text-muted">
          {a.quando}
        </span>
      </div>

      <Estrelas nota={a.nota} critica={a.critica} />

      {a.texto ? (
        <p className="mt-2 text-[13.5px] leading-[1.55] text-[#4a4a44]">
          {a.texto}
        </p>
      ) : (
        <p className="mt-2 text-[13.5px] italic leading-[1.55] text-muted">
          Sem comentário — só a nota.
        </p>
      )}

      {/* The reply as the customer sees it, so the shop can check its own
          words before deciding to change them. */}
      {a.resposta && !aberto && (
        <div className="mt-2.5 rounded-xl bg-sage px-3 py-2.5">
          <div className="text-[11.5px] font-extrabold uppercase leading-none tracking-[0.5px] text-brand-dark">
            Sua resposta
          </div>
          <p className="mt-1.5 text-[13px] leading-[1.5] text-brand-dark">
            {a.resposta}
          </p>
        </div>
      )}

      {aberto ? (
        <form action={action} className="mt-2.5">
          <input type="hidden" name="reviewId" value={a.id} />
          <textarea
            name="resposta"
            rows={3}
            maxLength={600}
            defaultValue={a.resposta ?? ""}
            placeholder="Responda ao cliente. Sua resposta aparece junto da avaliação."
            className="w-full rounded-xl border-[1.5px] border-sage-line bg-white p-3 text-[13.5px] leading-[1.5] outline-none focus:border-brand"
          />

          {state.error && (
            <p className="mt-2 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
              {state.error}
            </p>
          )}

          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="h-10 flex-1 rounded-xl border-[1.5px] border-sage-line bg-white text-[13px] font-bold text-[#4a4a44]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-10 flex-1 rounded-xl bg-brand text-[13px] font-bold text-white disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Publicar resposta"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-2.5 flex items-center justify-between gap-2.5">
          {a.sacola ? (
            <span className="inline-flex h-6 items-center rounded-[7px] bg-sage px-2 text-xs font-bold leading-none text-brand-dark">
              {a.sacola}
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => setAberto(true)}
            className={`h-9 shrink-0 rounded-full px-[13px] text-[12.5px] font-bold ${
              a.critica
                ? "bg-alert text-white"
                : "border-[1.5px] border-sage-line bg-white text-brand-dark"
            }`}
          >
            {a.resposta ? "Editar resposta" : "Responder"}
          </button>
        </div>
      )}
    </div>
  );
}
