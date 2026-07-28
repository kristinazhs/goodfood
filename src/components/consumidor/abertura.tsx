"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// C0 — splash and entry are ONE screen in two states.
//
// The green block doesn't cut to another screen: it shrinks into the rounded
// header the rest of the app already uses, revealing the cream underneath.
// That continuity is what explains where the screen came from.
//
// The splash also carries the promise, not just the brand — half a second of
// full attention is too scarce to spend on a logo alone.

const JA_VISTO = "goodfood:splash-visto";
const DURACAO_SPLASH = 1100;

export function Abertura() {
  // Starts open (no splash) so a return visit never waits; the effect below
  // decides whether this is a first launch.
  const [aberto, setAberto] = useState(true);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    let visto = true;
    try {
      visto = sessionStorage.getItem(JA_VISTO) === "1";
    } catch {
      // storage blocked — just skip the splash
    }
    if (visto) return;

    setAberto(false);
    try {
      sessionStorage.setItem(JA_VISTO, "1");
    } catch {
      // ignore
    }
    const t = setTimeout(() => setAberto(true), DURACAO_SPLASH);
    return () => clearTimeout(t);
  }, []);

  // Before hydration we render the entry state, so the page is usable with
  // no JS and never flashes a splash that can't animate away.
  const splash = montado && !aberto;

  return (
    <main className="flex flex-1 flex-col">
      <div
        className={`relative shrink-0 overflow-hidden bg-brand px-6 transition-all duration-[900ms] ease-[cubic-bezier(.4,0,.2,1)] ${
          splash
            ? "h-[calc(100dvh-42px)] rounded-b-none pb-11 pt-11"
            : "h-auto rounded-b-[32px] pb-[34px] pt-[46px]"
        }`}
      >
        <span className="absolute -left-12 -top-14 h-40 w-40 rounded-full bg-white/[0.05]" />
        <span className="absolute -bottom-8 -right-5 h-[90px] w-[90px] rounded-full bg-white/[0.05]" />

        <div
          className={`relative flex h-full flex-col ${
            splash ? "items-center justify-center text-center" : "justify-end"
          }`}
        >
          <div
            className={`font-display font-bold leading-none text-white transition-all duration-[900ms] ${
              splash ? "text-[40px]" : "text-[32px]"
            }`}
          >
            GoodFood
          </div>
          <div
            className={`text-mint transition-all duration-[900ms] ${
              splash
                ? "mt-3 text-sm font-medium leading-[1.4]"
                : "mt-2.5 font-display text-lg font-medium leading-[1.3]"
            }`}
          >
            Comida boa, preço justo,
            <br />
            menos desperdício.
          </div>

          {/* the sentence that says what the app is for — only in the header */}
          <div
            className={`max-w-[260px] overflow-hidden text-[12.5px] leading-[1.55] text-[#bfe3cc] transition-all duration-[900ms] ${
              splash ? "mt-0 max-h-0 opacity-0" : "mt-3 max-h-24 opacity-100"
            }`}
          >
            Sacolas surpresa de padarias, restaurantes e mercados de Porto
            Alegre com até 50% de desconto.
          </div>
        </div>

        {splash && (
          <div className="absolute inset-x-0 bottom-11 flex justify-center gap-[5px]">
            <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-white/85" />
            <span className="h-[7px] w-[7px] rounded-full bg-white/45" />
            <span className="h-[7px] w-[7px] rounded-full bg-white/45" />
          </div>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col px-5 pb-5 pt-6 transition-opacity duration-500 ${
          splash ? "pointer-events-none opacity-0" : "opacity-100 delay-200"
        }`}
      >
        {/* One decision at a time: the path 95% of people take comes first,
            and without asking them to pick a role. */}
        <div className="flex flex-col gap-2.5">
          <Link
            href="/consumidor/entrar"
            className="flex h-[54px] items-center justify-center rounded-2xl bg-brand text-base font-bold text-white transition-transform active:scale-[0.98]"
          >
            Entrar
          </Link>
          <Link
            href="/consumidor/cadastro"
            className="flex h-[54px] items-center justify-center rounded-2xl bg-sage text-base font-bold text-brand-dark transition-transform active:scale-[0.98]"
          >
            Criar conta
          </Link>
        </div>

        <div className="mt-[18px] flex items-center gap-2.5">
          <span className="h-px flex-1 bg-[#e0dbd0]" />
          <span className="text-xs font-semibold leading-none text-[#8d8d84]">
            ou
          </span>
          <span className="h-px flex-1 bg-[#e0dbd0]" />
        </div>

        {/* Nobody creates an account to find out there's nothing nearby.
            Login appears when they reserve — with a sacola already chosen. */}
        <Link
          href="/consumidor"
          className="mt-[18px] flex items-center gap-[13px] rounded-[18px] border-2 border-brand bg-white p-[15px] transition-transform active:scale-[0.98]"
        >
          <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-sage">
            <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
              <circle cx="10" cy="10" r="6" fill="none" stroke="#134d29" strokeWidth="1.9" />
              <path d="M14.5 14.5 19 19" stroke="#134d29" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold leading-[1.2] text-brand-dark">
              Buscar sacolas
            </span>
            <span className="mt-[3px] block text-[12.5px] font-medium leading-[1.35] text-muted">
              Veja o que tem perto de você sem criar conta
            </span>
          </span>
          <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0">
            <path d="M8.5 4.5 15 11l-6.5 6.5" fill="none" stroke="#1a6b3a" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Present and findable, but not competing with the consumer path —
            it's a handful of users, and almost always on desktop. */}
        <Link
          href="/parceiro/entrar"
          className="mt-auto flex items-center gap-3 rounded-2xl border-[1.5px] border-[#e0dbd0] bg-[#f4f2ec] p-3.5 transition-transform active:scale-[0.98]"
        >
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[#eceae3]">
            <svg width="19" height="19" viewBox="0 0 22 22" aria-hidden="true">
              <path d="M4 9.5 11 4l7 5.5V18H4z" fill="none" stroke="#6b6b62" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M8.5 18v-5h5v5" fill="none" stroke="#6b6b62" strokeWidth="1.7" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold leading-[1.2] text-[#4a4a44]">
              Sou estabelecimento
            </span>
            <span className="mt-0.5 block text-xs font-medium leading-[1.3] text-[#8d8d84]">
              Venda a comida boa que sobrou hoje
            </span>
          </span>
          <svg width="17" height="17" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0">
            <path d="M8.5 4.5 15 11l-6.5 6.5" fill="none" stroke="#8d8d84" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>

        <div className="mt-3.5 text-center text-[11.5px] font-medium leading-none text-[#8d8d84]">
          Porto Alegre · RS
        </div>
      </div>
    </main>
  );
}
