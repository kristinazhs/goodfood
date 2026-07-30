"use client";

import { useActionState, useState } from "react";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import { brl } from "@/lib/format";
import { reservar, type ReservaState } from "@/lib/pedido-actions";
import type { Sacola } from "@/lib/types";

// C4 — one screen. Before, /checkout showed the summary and /pagamento chose
// the method, so a person confirmed a total before knowing how they'd pay.

const METODOS = [
  {
    id: "cartao" as const,
    nome: "Cartão de crédito",
    nota: "Cobrança ao confirmar a reserva",
  },
  {
    id: "pix" as const,
    nome: "Pix",
    nota: "A reserva vale depois do pagamento",
    selo: "Sem taxa",
  },
];

export function CheckoutClient({
  sacola,
  qtd,
}: {
  sacola: Sacola;
  qtd: number;
}) {
  const [metodo, setMetodo] = useState<"pix" | "cartao">("cartao");
  const [state, action, pending] = useActionState<ReservaState, FormData>(
    reservar,
    {},
  );

  const total = sacola.preco * qtd;
  const cheio = sacola.precoOriginal * qtd;
  const economia = Math.max(0, cheio - total);

  return (
    <form action={action} className="flex flex-1 flex-col">
      <input type="hidden" name="bagId" value={sacola.id} />
      <input type="hidden" name="qtd" value={qtd} />
      <input type="hidden" name="metodo" value={metodo} />

      <div className="px-5">
        <div className="flex gap-[13px] rounded-[18px] border-[1.5px] border-sage-line bg-white p-[11px]">
          <FotoSacola src={sacola.fotoUrl} size={72} alt={sacola.nome} />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="truncate font-display text-base font-semibold leading-[1.3]">
              {sacola.nome}
            </div>
            <div className="mt-0.5 truncate text-[13px] font-medium leading-[1.3] text-muted">
              {sacola.loja}
            </div>
            <div className="mt-auto flex items-end justify-between gap-2 pt-[9px]">
              <span className="inline-flex h-[26px] items-center rounded-lg bg-sage px-[9px] text-xs font-bold leading-none text-brand-dark">
                {qtd} {qtd > 1 ? "unidades" : "unidade"}
              </span>
              <span className="shrink-0 font-display text-base font-bold">
                {brl(total)}
              </span>
            </div>
          </div>
        </div>

        <div className="pb-2.5 pt-[22px] text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
          Retirada
        </div>
        <div className="rounded-2xl border-[1.5px] border-sage-line bg-white p-[13px]">
          <div className="text-sm font-bold leading-[1.3]">
            <span className="capitalize">{sacola.dia}</span>, {sacola.janela}
          </div>
          <div className="mt-0.5 text-[12.5px] font-medium leading-[1.35] text-muted">
            {sacola.endereco}
          </div>
        </div>

        <div className="pb-2.5 pt-[22px] text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
          Pagamento
        </div>
        <div className="flex flex-col gap-2.5">
          {METODOS.map((m) => {
            const ativo = metodo === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetodo(m.id)}
                aria-pressed={ativo}
                className={`flex items-center gap-3 rounded-2xl bg-white p-[13px] text-left ${
                  ativo
                    ? "border-2 border-brand"
                    : "border-[1.5px] border-sage-line"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                    ativo ? "border-brand" : "border-sage-line"
                  }`}
                >
                  {ativo && (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-[1.3]">
                    {m.nome}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] font-medium leading-[1.35] text-muted">
                    {m.nota}
                  </span>
                </span>
                {m.selo && (
                  <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-sage px-2 text-[11px] font-bold leading-none text-brand-dark">
                    {m.selo}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Says plainly that no money moves yet — the prototype banner is at
            the top of the app, but this is the screen where it matters. */}
        <p className="mt-2.5 rounded-xl bg-amber-bg px-3.5 py-3 text-[12.5px] font-semibold leading-[1.4] text-amber-ink">
          Pagamento simulado nesta versão — nenhuma cobrança real é feita.
        </p>

        {/* The discount is the reason for the purchase and never appeared in
            any summary; "Taxa de serviço R$ 0,00" spent a line saying nothing. */}
        <div className="mt-[22px] rounded-2xl border-[1.5px] border-sage-line bg-white p-[13px]">
          {economia > 0 && (
            <>
              <div className="flex justify-between text-[13px] text-muted">
                <span>Valor cheio na loja</span>
                <span className="line-through">{brl(cheio)}</span>
              </div>
              <div className="mt-1.5 flex justify-between text-[13px] text-muted">
                <span>Preço da sacola</span>
                <span>{brl(total)}</span>
              </div>
              <div className="mt-1.5 flex justify-between text-[13px] font-bold text-brand-dark">
                <span>Você economiza</span>
                <span>{brl(economia)}</span>
              </div>
            </>
          )}
          <div className="mt-2.5 flex items-baseline justify-between border-t border-sage-line pt-2.5">
            <span className="text-sm font-bold">Total a pagar agora</span>
            <span className="font-display text-lg font-bold">{brl(total)}</span>
          </div>
        </div>

        {state.error && (
          <p className="mt-3 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
            {state.error}
          </p>
        )}

        <div className="h-[18px]" />
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-sage-line bg-white px-5 pb-5 pt-3.5">
        {/* The button says what happens and how much leaves — money moves at
            reservation, so hiding that behind "continuar" would be a trap. */}
        <button
          type="submit"
          disabled={pending}
          className="h-[54px] w-full rounded-2xl bg-brand text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Reservando…" : `Pagar ${brl(total)} e reservar`}
        </button>
        <p className="mt-2 text-center text-[12.5px] font-medium leading-none text-muted">
          Reembolso total se você cancelar em até 15 min.
        </p>
      </div>
    </form>
  );
}
