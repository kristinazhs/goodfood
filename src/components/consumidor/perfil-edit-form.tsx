"use client";

import { useActionState, useState } from "react";
import { Field } from "@/components/ui/field";
import { atualizarPerfil, type AuthState } from "@/lib/auth-actions";
import { formatarCPF, formatarTelefone } from "@/lib/cpf";

// Digits typed, punctuation added — the same masked field as signup, so the
// two screens behave identically on the two fields people mistype most.
function CampoMascarado({
  label,
  name,
  placeholder,
  mascara,
  inicial,
  ajuda,
}: {
  label: string;
  name: string;
  placeholder: string;
  mascara: (v: string) => string;
  inicial: string;
  ajuda?: string;
}) {
  const [valor, setValor] = useState(mascara(inicial));
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <input
        name={name}
        required
        inputMode="numeric"
        value={valor}
        onChange={(e) => setValor(mascara(e.target.value))}
        placeholder={placeholder}
        className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
      />
      {ajuda && (
        <span className="mt-1 block text-[11px] leading-[1.35] text-muted">
          {ajuda}
        </span>
      )}
    </label>
  );
}

export function PerfilEditForm({
  nome,
  telefone,
  cpf,
  email,
}: {
  nome: string;
  telefone: string;
  cpf: string;
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
        <CampoMascarado
          label="CPF"
          name="cpf"
          placeholder="000.000.000-00"
          mascara={formatarCPF}
          inicial={cpf}
          ajuda="Necessário para emitir a nota das suas compras."
        />
        <CampoMascarado
          label="Telefone"
          name="telefone"
          placeholder="(51) 99999-9999"
          mascara={formatarTelefone}
          inicial={telefone}
          ajuda="A loja usa se precisar avisar algo sobre uma sacola."
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
