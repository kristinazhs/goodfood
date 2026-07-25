"use client";

import { useActionState } from "react";
import { Field, TextArea } from "@/components/ui/field";
import { publicarSacola, type PublishState } from "@/lib/parceiro-actions";

export function CriarSacolaForm() {
  const [state, action, pending] = useActionState<PublishState, FormData>(
    publicarSacola,
    {},
  );

  return (
    <form action={action}>
      <div className="mt-4 flex flex-col gap-3.5">
        <button
          type="button"
          className="flex h-[110px] w-full flex-col items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed border-sage-line bg-white text-muted"
        >
          <span className="text-2xl">📷</span>
          <span className="text-xs font-bold">Adicionar foto (em breve)</span>
        </button>

        <Field label="Nome da sacola" name="nome" placeholder="Ex.: Sacola Surpresa Doce" required />
        <TextArea
          label="Descrição"
          name="descricao"
          placeholder="O que costuma vir nesta sacola?"
        />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantidade" name="quantidade" type="number" placeholder="5" required />
          <Field label="Preço (R$)" name="preco" placeholder="27,90" required />
        </div>
        <Field label="Preço original (R$)" name="precoOriginal" placeholder="45,00" />

        <div>
          <span className="mb-1.5 block text-xs font-bold text-muted">
            Janela de retirada
          </span>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              name="janelaInicio"
              defaultValue="18:40"
              className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
            />
            <input
              type="time"
              name="janelaFim"
              defaultValue="19:00"
              className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="flex items-start gap-[9px] rounded-[14px] bg-sage px-[13px] py-3 text-[11.5px] leading-[1.5] text-brand-dark">
          ⏰{" "}
          <span>
            Reservas ficam abertas até <b>30 minutos</b> antes do fim da janela
            de retirada.
          </span>
        </div>
      </div>

      {state.error && (
        <p className="mt-3 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-[14px] bg-brand p-4 text-center text-[15px] font-bold text-white disabled:opacity-60"
      >
        {pending ? "Publicando…" : "Publicar sacola"}
      </button>
    </form>
  );
}
