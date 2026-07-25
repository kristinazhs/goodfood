"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { atualizarPerfil, type AuthState } from "@/lib/auth-actions";

export function PerfilEditForm({
  nome,
  telefone,
  email,
}: {
  nome: string;
  telefone: string;
  email: string;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    atualizarPerfil,
    {},
  );

  return (
    <form action={action}>
      <div className="mt-6 flex flex-col gap-3.5">
        <Field label="Nome" name="nome" defaultValue={nome} required />
        <Field
          label="Telefone"
          name="telefone"
          type="tel"
          defaultValue={telefone}
          placeholder="(51) 99999-9999"
        />
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-muted">
            E-mail
          </span>
          <input
            value={email}
            disabled
            className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-sage px-4 py-3 text-sm text-muted"
          />
          <span className="mt-1 block text-[11px] text-muted">
            O e-mail de acesso não pode ser alterado por aqui.
          </span>
        </label>
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
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
