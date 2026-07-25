"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { signUpEstablishment, type AuthState } from "@/lib/auth-actions";

export function ParceiroSignupForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUpEstablishment,
    {},
  );

  return (
    <form action={action}>
      <div className="mt-6 flex flex-col gap-3.5">
        <Field label="Nome do negócio" name="nome" placeholder="Ex.: Domenica Casa de Pães" required />
        <Field label="CNPJ" name="cnpj" placeholder="00.000.000/0001-00" />
        <Field label="Endereço" name="endereco" placeholder="Rua, número — bairro" />
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-muted">
            Categoria
          </span>
          <select
            name="categoria"
            defaultValue="padaria"
            className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
          >
            <option value="padaria">Padaria</option>
            <option value="refeicao">Restaurante</option>
            <option value="mercado">Supermercado</option>
          </select>
        </label>
        <Field label="E-mail" name="email" type="email" placeholder="loja@email.com" required />
        <Field label="Telefone" name="telefone" type="tel" placeholder="(51) 3333-3333" />
        <Field label="Senha" name="senha" type="password" placeholder="Mínimo 8 caracteres" required />
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
        {pending ? "Cadastrando…" : "Cadastrar negócio"}
      </button>
    </form>
  );
}
