"use client";

import { useActionState, useState } from "react";
import { brl } from "@/lib/format";
import { reservar, type ReservaState } from "@/lib/pedido-actions";
import type { Sacola } from "@/lib/types";

const metodos = [
  { id: "pix", emoji: "⚡", nome: "Pix", nota: "Reserva instantânea" },
  { id: "cartao", emoji: "💳", nome: "Cartão de crédito", nota: "Visa, Master, Elo" },
] as const;

export function PagamentoClient({
  sacola,
  qtd,
}: {
  sacola: Sacola;
  qtd: number;
}) {
  const [metodo, setMetodo] = useState<"pix" | "cartao">("pix");
  const [state, action, pending] = useActionState<ReservaState, FormData>(
    reservar,
    {},
  );
  const total = sacola.preco * qtd;

  return (
    <>
      <div className="flex-1 px-5 pb-8">
        <div className="mb-2.5 mt-4 text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
          Forma de pagamento
        </div>

        <div className="flex flex-col gap-2.5">
          {metodos.map((m) => {
            const ativo = metodo === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetodo(m.id)}
                className={`flex items-center gap-3 rounded-[14px] border-[1.5px] bg-white p-3.5 text-left ${
                  ativo ? "border-brand" : "border-sage-line"
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-sage text-base">
                  {m.emoji}
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-bold">{m.nome}</span>
                  <span className="mt-[1px] block text-[11.5px] text-muted">
                    {m.nota}
                  </span>
                </span>
                <span
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] ${
                    ativo ? "border-brand bg-brand" : "border-sage-line bg-white"
                  }`}
                >
                  {ativo && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-start gap-[9px] rounded-[14px] bg-sage px-[13px] py-3 text-[11.5px] leading-[1.5] text-brand-dark">
          💳{" "}
          <span>
            Você não é cobrado agora. O valor fica <b>reservado</b> e só é
            cobrado na retirada — ou ao final da janela, caso não compareça.{" "}
            <b>Cancelamento grátis até 17h00.</b>
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-[14px] border-[1.5px] border-sage-line bg-white p-3.5">
          <span className="text-[13px] font-semibold text-muted">
            Total na retirada
          </span>
          <span className="font-display text-lg font-bold">{brl(total)}</span>
        </div>

        {state.error && (
          <p className="mt-3 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
            {state.error}
          </p>
        )}
      </div>

      <form
        action={action}
        className="sticky bottom-0 z-10 border-t border-sage-line bg-white px-5 pb-[22px] pt-4"
      >
        <input type="hidden" name="bagId" value={sacola.id} />
        <input type="hidden" name="qtd" value={qtd} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[14px] bg-brand p-4 text-[15px] font-bold text-white disabled:opacity-60"
        >
          {pending ? "Reservando…" : "Confirmar reserva"}
        </button>
      </form>
    </>
  );
}
