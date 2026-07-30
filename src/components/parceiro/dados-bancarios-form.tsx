"use client";

import { useActionState, useState } from "react";
import type { DadosBancarios } from "@/lib/parceiro";
import {
  salvarDadosBancarios,
  type PublishState,
} from "@/lib/parceiro-actions";

const CAMPO =
  "h-[50px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] font-medium outline-none focus:border-brand";
const ROTULO =
  "mb-[7px] block text-[13px] font-bold leading-none text-[#4a4a44]";
const AJUDA = "mt-[5px] block text-[12px] font-medium leading-[1.35] text-muted";

export function DadosBancariosForm({ dados }: { dados: DadosBancarios }) {
  const [state, action, pending] = useActionState<PublishState, FormData>(
    salvarDadosBancarios,
    {},
  );
  const [tipoConta, setTipoConta] = useState(dados.tipoConta);

  return (
    <form action={action} className="flex flex-1 flex-col">
      <input type="hidden" name="tipoConta" value={tipoConta} />

      <div className="flex flex-col gap-3.5">
        <label className="block">
          <span className={ROTULO}>Titular da conta</span>
          <input
            name="titular"
            defaultValue={dados.titular}
            placeholder="Nome como está no banco"
            className={CAMPO}
          />
        </label>

        <label className="block">
          <span className={ROTULO}>CPF ou CNPJ do titular</span>
          <input
            name="documento"
            defaultValue={dados.documento}
            inputMode="numeric"
            placeholder="ex. 000.000.000-00"
            className={CAMPO}
          />
          <span className={AJUDA}>
            Precisa ser o mesmo titular da conta, senão o banco devolve o
            repasse.
          </span>
        </label>

        <label className="block">
          <span className={ROTULO}>Banco</span>
          <input
            name="banco"
            defaultValue={dados.banco}
            placeholder="ex. Banrisul, Nubank, Itaú"
            className={CAMPO}
          />
        </label>

        <div className="flex gap-2.5">
          <label className="block flex-1">
            <span className={ROTULO}>Agência</span>
            <input
              name="agencia"
              defaultValue={dados.agencia}
              inputMode="numeric"
              placeholder="0000"
              className={CAMPO}
            />
          </label>
          <label className="block flex-1">
            <span className={ROTULO}>Conta</span>
            <input
              name="conta"
              defaultValue={dados.conta}
              inputMode="numeric"
              placeholder="00000-0"
              className={CAMPO}
            />
          </label>
        </div>

        <div>
          <span className={ROTULO}>Tipo de conta</span>
          <div className="flex gap-2">
            {[
              { id: "corrente", label: "Corrente" },
              { id: "poupanca", label: "Poupança" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipoConta(t.id)}
                aria-pressed={tipoConta === t.id}
                className={`h-11 flex-1 rounded-xl text-[13.5px] font-bold ${
                  tipoConta === t.id
                    ? "bg-brand text-white"
                    : "border-[1.5px] border-sage-line bg-white text-[#4a4a44]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className={ROTULO}>Chave Pix (opcional)</span>
          <input
            name="chavePix"
            defaultValue={dados.chavePix}
            placeholder="CPF/CNPJ, e-mail, telefone ou chave aleatória"
            className={CAMPO}
          />
          <span className={AJUDA}>
            Se preenchida, o repasse tende a cair no mesmo dia.
          </span>
        </label>
      </div>

      {state.error && (
        <p className="mt-4 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 h-[52px] w-full rounded-[14px] bg-brand text-base font-bold text-white disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar dados de repasse"}
      </button>
    </form>
  );
}
