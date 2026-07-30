"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// C0 — splash and entry are ONE screen in two states.
//
// The green block doesn't cut to another screen: it shrinks into the rounded
// header the rest of the app already uses, revealing the cream underneath.
// That continuity is what explains where the screen came from.
//
// The splash also carries the promise, not just the brand — half a second of
// full attention is too scarce to spend on a logo alone.
//
// HOW THE MOVEMENT WORKS
//
// The two states don't share a layout: the splash centres the logo in a
// full-screen block, the header pins it to the bottom-left of a short one.
// justify-content, align-items and text-align can't be animated, and neither
// can a height of `auto` — so simply swapping the classes makes the screen
// jump. Instead we measure the splash, switch to the real header layout, and
// then use a transform to put the logo *back* where the splash had it before
// releasing it. Only height and transform animate, and both are smooth.

const JA_VISTO = "goodfood:splash-visto";
const DURACAO_SPLASH = 1100; // how long the full screen holds before opening
const DURACAO_ABERTURA = 900; // how long the green takes to shrink
const CURVA = "cubic-bezier(.4,0,.2,1)";

type Fase = "entrada" | "splash" | "abrindo";

type Medidas = { altura: number; logo: DOMRect; frase: DOMRect };

// useLayoutEffect warns when rendered on the server, where there is nothing
// to measure anyway. Measuring before the first paint is what stops the entry
// screen from flashing for a frame on a first visit.
const useEfeitoDeLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Put an element back where it used to be, with no transition. Scale comes
// from the width ratio, which absorbs the font-size change for free.
function inverter(el: HTMLElement, antes: DOMRect) {
  const agora = el.getBoundingClientRect();
  const escala = agora.width > 0 ? antes.width / agora.width : 1;
  el.style.transition = "none";
  el.style.transformOrigin = "left top";
  el.style.transform =
    `translate(${antes.left - agora.left}px, ${antes.top - agora.top}px) ` +
    `scale(${escala})`;
}

function soltar(el: HTMLElement) {
  el.style.transition = `transform ${DURACAO_ABERTURA}ms ${CURVA}`;
  el.style.transform = "none";
}

function limpar(el: HTMLElement | null) {
  if (!el) return;
  el.style.transition = "";
  el.style.transform = "";
  el.style.transformOrigin = "";
  el.style.height = "";
}

export function Abertura() {
  // Starts on the entry state so a return visit never waits, the page works
  // without JS, and the layout we measure against is the real one.
  const [fase, setFase] = useState<Fase>("entrada");
  const [solto, setSolto] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const fraseRef = useRef<HTMLDivElement>(null);
  const medidas = useRef<Medidas | null>(null);

  const finalizar = useCallback(() => {
    limpar(headerRef.current);
    limpar(logoRef.current);
    limpar(fraseRef.current);
    setFase("entrada");
  }, []);

  // 1 — decide, before the first paint, whether this is a first launch.
  useEfeitoDeLayout(() => {
    let visto = true;
    try {
      visto = sessionStorage.getItem(JA_VISTO) === "1";
    } catch {
      // storage blocked — just skip the splash
    }
    const semMovimento = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (visto || semMovimento) return;

    try {
      sessionStorage.setItem(JA_VISTO, "1");
    } catch {
      // ignore
    }
    setFase("splash");
  }, []);

  // 2 — hold the full screen, and note exactly where the logo sits on it.
  useEfeitoDeLayout(() => {
    if (fase !== "splash") return;
    const header = headerRef.current;
    const logo = logoRef.current;
    const frase = fraseRef.current;
    if (!header || !logo || !frase) return;

    medidas.current = {
      altura: header.getBoundingClientRect().height,
      logo: logo.getBoundingClientRect(),
      frase: frase.getBoundingClientRect(),
    };

    const t = setTimeout(() => setFase("abrindo"), DURACAO_SPLASH);
    return () => clearTimeout(t);
  }, [fase]);

  // 3 — the DOM is already in the header layout here. Send everything back to
  // the splash with no transition, then release it over one animation.
  useEfeitoDeLayout(() => {
    if (fase !== "abrindo") return;
    const antes = medidas.current;
    const header = headerRef.current;
    const logo = logoRef.current;
    const frase = fraseRef.current;
    if (!antes || !header || !logo || !frase) {
      setSolto(true);
      finalizar();
      return;
    }

    // Where the green block ends up once it is only the rounded top bar.
    const alturaFinal = header.getBoundingClientRect().height;

    header.style.transition = "none";
    header.style.height = `${antes.altura}px`;
    inverter(logo, antes.logo);
    inverter(frase, antes.frase);

    // One whole frame later — a single rAF still runs before this paint.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        header.style.transition =
          `height ${DURACAO_ABERTURA}ms ${CURVA}, ` +
          `border-radius ${DURACAO_ABERTURA}ms ${CURVA}`;
        header.style.height = `${alturaFinal}px`;
        soltar(logo);
        soltar(frase);
        setSolto(true);
      });
    });

    // If transitionend never arrives, don't leave inline styles behind.
    const rede = setTimeout(finalizar, DURACAO_ABERTURA + 300);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(rede);
    };
  }, [fase, finalizar]);

  const aoTerminar = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || e.propertyName !== "height") return;
      finalizar();
    },
    [finalizar],
  );

  const telaCheia = fase === "splash";
  // The buttons, the sentence and the rounded corner arrive with the movement.
  const revelado = fase === "entrada" || solto;

  return (
    <main className="flex flex-1 flex-col">
      <div
        ref={headerRef}
        onTransitionEnd={aoTerminar}
        className={`relative shrink-0 overflow-hidden bg-brand px-6 ${
          telaCheia
            ? "h-[calc(100dvh-42px)] pb-11 pt-11"
            : "h-auto pb-[34px] pt-[46px]"
        } ${revelado ? "rounded-b-[32px]" : "rounded-b-none"}`}
      >
        <span className="absolute -left-12 -top-14 h-40 w-40 rounded-full bg-white/[0.05]" />
        <span className="absolute -bottom-8 -right-5 h-[90px] w-[90px] rounded-full bg-white/[0.05]" />

        <div
          className={`relative flex h-full flex-col ${
            telaCheia ? "items-center justify-center text-center" : "justify-end"
          }`}
        >
          {/* w-fit so these boxes hug the words: the transform that moves them
              is measured from the glyphs, not from the full column width. */}
          <div
            ref={logoRef}
            className={`w-fit font-display font-bold leading-none text-white ${
              telaCheia ? "text-[40px]" : "text-[32px]"
            }`}
          >
            GoodFood
          </div>
          <div
            ref={fraseRef}
            className={`w-fit text-mint ${
              telaCheia
                ? "mt-3 text-sm font-medium leading-[1.4]"
                : "mt-2.5 font-display text-lg font-medium leading-[1.3]"
            }`}
          >
            Comida boa, preço justo,
            <br />
            menos desperdício.
          </div>

          {/* The sentence that says what the app is for — only in the header.
              It takes up its real height as soon as we leave the splash and
              only fades in, so the header has ONE final height to travel to.
              Growing it during the movement made the green overshoot and
              snap back at the end. */}
          <div
            className={`max-w-[260px] overflow-hidden text-[12.5px] leading-[1.55] text-[#bfe3cc] transition-opacity duration-[900ms] ${
              telaCheia ? "mt-0 max-h-0" : "mt-3"
            } ${revelado ? "opacity-100" : "opacity-0"}`}
          >
            Sacolas surpresa de padarias, restaurantes e mercados de Porto
            Alegre com até 50% de desconto.
          </div>
        </div>

        {fase !== "entrada" && (
          <div
            className={`absolute inset-x-0 bottom-11 flex justify-center gap-[5px] transition-opacity duration-300 ${
              revelado ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-white/85" />
            <span className="h-[7px] w-[7px] rounded-full bg-white/45" />
            <span className="h-[7px] w-[7px] rounded-full bg-white/45" />
          </div>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col px-5 pb-5 pt-6 transition-opacity duration-500 ${
          revelado ? "opacity-100 delay-200" : "pointer-events-none opacity-0"
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
