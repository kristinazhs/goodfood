"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { brl } from "@/lib/format";
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
  const router = useRouter();
  const [metodo, setMetodo] = useState<"pix" | "cartao">("pix");
  const [confirmado, setConfirmado] = useState(false);
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
      </div>

      <div className="sticky bottom-0 z-10 border-t border-sage-line bg-white px-5 pb-[22px] pt-4">
        <button
          onClick={() => setConfirmado(true)}
          className="w-full rounded-[14px] bg-brand p-4 text-[15px] font-bold text-white"
        >
          Confirmar reserva
        </button>
      </div>

      {/* confirmation bottom-sheet (from the mockup) */}
      <div
        className={`fixed inset-0 z-40 mx-auto flex w-full max-w-[430px] items-end bg-charcoal/50 transition-opacity duration-250 ${
          confirmado ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`w-full rounded-t-[26px] bg-white px-[22px] pb-[26px] pt-7 transition-transform duration-250 ${
            confirmado ? "translate-y-0" : "translate-y-5"
          }`}
        >
          <div className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-sage text-2xl">
            ✅
          </div>
          <div className="mb-2 font-display text-[19px] font-bold">
            Sacola reservada!
          </div>
          <div className="mb-4 text-[13px] leading-[1.55] text-muted">
            {sacola.loja} · Retirada entre {sacola.janela}
          </div>

          <div className="mb-2.5 flex items-start gap-[9px] rounded-[14px] bg-sage px-[13px] py-3 text-[12.5px] leading-[1.5] text-brand-dark">
            💳{" "}
            <span>
              Nenhum valor foi cobrado ainda. <b>{brl(total)}</b> serão cobrados
              na retirada, ou ao final da janela se você não comparecer.
            </span>
          </div>
          <div className="mb-2.5 flex items-start gap-[9px] rounded-[14px] bg-sage px-[13px] py-3 text-[12.5px] leading-[1.5] text-brand-dark">
            ⏳{" "}
            <span>
              Você pode cancelar sem custo <b>até 17h00</b>, direto pelo app.
            </span>
          </div>

          <button className="mb-2.5 w-full rounded-[14px] border-[1.5px] border-sage-line bg-white p-[13px] text-[13px] font-bold text-charcoal">
            🤝 Pedir para um amigo retirar
          </button>
          <button
            onClick={() => router.push("/consumidor/pedido/4827")}
            className="w-full rounded-[14px] bg-brand p-3.5 text-sm font-bold text-white"
          >
            Entendi
          </button>
        </div>
      </div>
    </>
  );
}
