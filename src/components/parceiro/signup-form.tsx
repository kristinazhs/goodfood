"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUpEstablishment, type AuthState } from "@/lib/auth-actions";

// P6 — two steps, with the money in the second. Asking for a bank account
// before a partner has seen the product work is the biggest drop-off point
// in a B2B signup; here they publish first and give payout details before
// the first transfer.

const DIAS = [
  { id: "seg", label: "Seg" },
  { id: "ter", label: "Ter" },
  { id: "qua", label: "Qua" },
  { id: "qui", label: "Qui" },
  { id: "sex", label: "Sex" },
  { id: "sab", label: "Sáb" },
  { id: "dom", label: "Dom" },
];

interface Horario {
  aberto: boolean;
  inicio: string;
  fim: string;
}

const PADRAO: Record<string, Horario> = Object.fromEntries(
  DIAS.map((d) => [
    d.id,
    { aberto: d.id !== "dom", inicio: "07:00", fim: "19:30" },
  ]),
);

const CAMPO =
  "h-[50px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] font-medium outline-none placeholder:font-medium placeholder:text-[#8d8d84] focus:border-brand";
const ROTULO = "mb-[7px] block text-[13px] font-bold leading-none text-[#4a4a44]";
const AJUDA = "mt-1.5 block text-xs font-medium leading-[1.4] text-muted";

export function ParceiroSignupForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUpEstablishment,
    {},
  );
  const [horarios, setHorarios] = useState<Record<string, Horario>>(PADRAO);
  const [aceite, setAceite] = useState(false);

  function alterar(dia: string, mudanca: Partial<Horario>) {
    setHorarios((h) => ({ ...h, [dia]: { ...h[dia], ...mudanca } }));
  }

  function copiarParaTodos() {
    const base = horarios.seg;
    setHorarios((h) =>
      Object.fromEntries(
        Object.entries(h).map(([dia, v]) => [
          dia,
          { ...v, inicio: base.inicio, fim: base.fim },
        ]),
      ),
    );
  }

  return (
    <form action={action} className="flex flex-1 flex-col">
      <input type="hidden" name="horarios" value={JSON.stringify(horarios)} />

      <div className="flex flex-col gap-3.5">
        <label className="block">
          <span className={ROTULO}>Nome do negócio</span>
          <input
            name="nome"
            required
            placeholder="ex. Domenica Casa de Pães"
            className={CAMPO}
          />
        </label>

        <label className="block">
          <span className={ROTULO}>CNPJ</span>
          <input
            name="cnpj"
            inputMode="numeric"
            placeholder="ex. 00.000.000/0001-00"
            className={CAMPO}
          />
          {/* Each field says why it exists — a business form without
              justification reads as suspicion. */}
          <span className={AJUDA}>Usado só para o repasse e a nota fiscal</span>
        </label>

        <label className="block">
          <span className={ROTULO}>Endereço da retirada</span>
          <input
            name="endereco"
            required
            placeholder="ex. Rua Padre Chagas, 314"
            className={CAMPO}
          />
          <span className={AJUDA}>
            Aparece no mapa e no código de retirada do cliente
          </span>
        </label>

        {/* Hours per weekday with a switch: Sunday closed is one tap, and
            "copiar p/ todos" avoids filling seven identical rows. */}
        <div>
          <div className="mb-[7px] flex items-center justify-between">
            <span className="text-[13px] font-bold leading-none text-[#4a4a44]">
              Horário de funcionamento
            </span>
            <button
              type="button"
              onClick={copiarParaTodos}
              className="text-[12.5px] font-bold text-brand-dark"
            >
              Copiar p/ todos
            </button>
          </div>

          <div className="overflow-hidden rounded-[14px] border-[1.5px] border-sage-line bg-white">
            {DIAS.map((d, i) => {
              const h = horarios[d.id];
              return (
                <div
                  key={d.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 ${
                    i > 0 ? "border-t border-sage-line" : ""
                  }`}
                >
                  <span className="w-9 shrink-0 text-[13px] font-bold">
                    {d.label}
                  </span>

                  {h.aberto ? (
                    <span className="flex flex-1 items-center gap-2">
                      <input
                        type="time"
                        value={h.inicio}
                        onChange={(e) => alterar(d.id, { inicio: e.target.value })}
                        aria-label={`Abre ${d.label}`}
                        className="h-9 min-w-0 flex-1 rounded-[10px] border-[1.5px] border-sage-line bg-white px-2 text-[13px] font-semibold outline-none focus:border-brand"
                      />
                      <span className="text-xs text-muted">–</span>
                      <input
                        type="time"
                        value={h.fim}
                        onChange={(e) => alterar(d.id, { fim: e.target.value })}
                        aria-label={`Fecha ${d.label}`}
                        className="h-9 min-w-0 flex-1 rounded-[10px] border-[1.5px] border-sage-line bg-white px-2 text-[13px] font-semibold outline-none focus:border-brand"
                      />
                    </span>
                  ) : (
                    <span className="flex-1 text-[13px] font-semibold text-muted">
                      Fechado
                    </span>
                  )}

                  <button
                    type="button"
                    role="switch"
                    aria-checked={h.aberto}
                    aria-label={`${d.label} aberto`}
                    onClick={() => alterar(d.id, { aberto: !h.aberto })}
                    className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                      h.aberto ? "bg-brand" : "bg-sage-line"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white transition-transform ${
                        h.aberto ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
          <span className={AJUDA}>
            As janelas de retirada das sacolas ficam dentro desse horário.
          </span>
        </div>

        <label className="block">
          <span className={ROTULO}>WhatsApp do balcão</span>
          <input
            name="whatsapp"
            type="tel"
            inputMode="tel"
            placeholder="ex. (51) 99999-0000"
            className={CAMPO}
          />
        </label>

        <label className="block">
          <span className={ROTULO}>E-mail de acesso</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ex. contato@domenica.com.br"
            className={CAMPO}
          />
        </label>

        <label className="block">
          <span className={ROTULO}>Senha</span>
          <input
            name="senha"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className={CAMPO}
          />
          <span className={AJUDA}>Mínimo de 8 caracteres</span>
        </label>
      </div>

      {/* The commission is stated at signup, not in small print later — it's
          the thing a partner most wants to know before deciding. */}
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
          Aceito o{" "}
          <Link href="/contrato-parceria" className="font-bold text-brand-dark">
            contrato de parceria
          </Link>
          .
        </span>
      </label>

      {state.error && (
        <p className="mt-3 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
          {state.error}
        </p>
      )}

      <div className="mt-auto pt-5">
        <button
          type="submit"
          disabled={pending}
          className="h-[54px] w-full rounded-2xl bg-brand text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Criando conta…" : "Continuar"}
        </button>
        <p className="mt-3 text-center text-[13px] font-medium leading-none text-muted">
          Já tem conta?{" "}
          <Link href="/parceiro/entrar" className="font-bold text-brand-dark">
            Entrar
          </Link>
        </p>
      </div>
    </form>
  );
}
