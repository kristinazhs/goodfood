"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { formatarCPF, formatarTelefone } from "@/lib/cpf";
import {
  signInWithGoogle,
  signUpConsumer,
  type AuthState,
} from "@/lib/auth-actions";

// C0b — three fields only. Address, phone and preferences don't belong here:
// the address is asked for on the map, and the phone only if a shop needs to
// warn you about a specific order.

function Campo({
  label,
  name,
  type = "text",
  placeholder,
  ajuda,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  ajuda?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-[13px] font-bold leading-none text-[#4a4a44]">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-[52px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] font-medium outline-none placeholder:font-medium placeholder:text-[#8d8d84] focus:border-brand"
      />
      {ajuda && (
        <span className="mt-1.5 block text-xs font-medium leading-[1.4] text-muted">
          {ajuda}
        </span>
      )}
    </label>
  );
}

// Digits typed, punctuation added: a CPF field that fights the person is the
// fastest way to lose them at the last step of signup.
function CampoMascarado({
  label,
  name,
  placeholder,
  mascara,
  ajuda,
}: {
  label: string;
  name: string;
  placeholder: string;
  mascara: (v: string) => string;
  ajuda?: string;
}) {
  const [valor, setValor] = useState("");
  return (
    <label className="block">
      <span className="mb-[7px] block text-[13px] font-bold leading-none text-[#4a4a44]">
        {label}
      </span>
      <input
        name={name}
        required
        inputMode="numeric"
        value={valor}
        onChange={(e) => setValor(mascara(e.target.value))}
        placeholder={placeholder}
        className="h-[50px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] font-medium outline-none focus:border-brand"
      />
      {ajuda && (
        <span className="mt-[5px] block text-[12px] font-medium leading-[1.35] text-muted">
          {ajuda}
        </span>
      )}
    </label>
  );
}

export function SignupForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUpConsumer,
    {},
  );
  const [google, googleAction, googlePending] = useActionState<
    AuthState,
    FormData
  >(signInWithGoogle, {});
  const [aceite, setAceite] = useState(false);

  const erro = state.error || google.error;

  return (
    <>
      {/* Social first: one tap for most people. The e-mail path below stays
          complete for anyone who prefers it. */}
      <form action={googleAction} className="mt-5">
        <button
          type="submit"
          disabled={googlePending}
          className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] border-[1.5px] border-sage-line bg-white text-[14.5px] font-bold text-charcoal disabled:opacity-60"
        >
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-sage text-xs font-extrabold leading-none text-brand-dark">
            G
          </span>
          {googlePending ? "Abrindo…" : "Continuar com Google"}
        </button>
      </form>

      <div className="mt-[18px] flex items-center gap-2.5">
        <span className="h-px flex-1 bg-[#e0dbd0]" />
        <span className="text-xs font-semibold leading-none text-[#8d8d84]">
          ou com e-mail
        </span>
        <span className="h-px flex-1 bg-[#e0dbd0]" />
      </div>

      <form action={action} className="flex flex-1 flex-col">
        {next && <input type="hidden" name="next" value={next} />}
        <div className="mt-[18px] flex flex-col gap-3.5">
          <Campo
            label="Nome"
            name="nome"
            placeholder="ex. Kristina Z."
            autoComplete="name"
          />
          <CampoMascarado
            label="CPF"
            name="cpf"
            placeholder="000.000.000-00"
            mascara={formatarCPF}
            ajuda="Necessário para emitir a nota da sua compra"
          />
          <CampoMascarado
            label="Telefone"
            name="telefone"
            placeholder="(51) 99999-9999"
            mascara={formatarTelefone}
            ajuda="A loja usa se precisar avisar algo sobre a sua sacola"
          />
          <Campo
            label="E-mail"
            name="email"
            type="email"
            placeholder="ex. kristina@email.com"
            autoComplete="email"
          />
          <Campo
            label="Senha"
            name="senha"
            type="password"
            placeholder="••••••••"
            ajuda="Mínimo de 8 caracteres"
            autoComplete="new-password"
          />
        </div>

        {/* Explicit, readable consent with real links — not a line of small
            print hidden under the button. */}
        <label className="mt-4 flex cursor-pointer items-start gap-[11px]">
          <input
            type="checkbox"
            name="aceite"
            checked={aceite}
            onChange={(e) => setAceite(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={`mt-px flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 ${
              aceite ? "border-brand bg-brand" : "border-sage-line bg-white"
            }`}
          >
            {aceite && (
              <svg width="14" height="14" viewBox="0 0 22 22">
                <path
                  d="M5.5 11.4 9.2 15l7.3-8"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="text-[12.5px] leading-[1.5] text-[#4a4a44]">
            Aceito os{" "}
            <Link href="/termos" className="font-bold text-brand-dark">
              termos de uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" className="font-bold text-brand-dark">
              política de privacidade
            </Link>
            .
          </span>
        </label>

        {erro && (
          <p className="mt-3 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
            {erro}
          </p>
        )}

        <div className="mt-auto pt-[18px]">
          <button
            type="submit"
            disabled={pending}
            className="h-[54px] w-full rounded-2xl bg-brand text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {pending ? "Criando conta…" : "Criar conta"}
          </button>
          <p className="mt-3 text-center text-[13px] font-medium leading-none text-muted">
            Já tem conta?{" "}
            <Link
              href={
                next
                  ? `/consumidor/entrar?next=${encodeURIComponent(next)}`
                  : "/consumidor/entrar"
              }
              className="font-bold text-brand-dark"
            >
              Entrar
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}
