"use client";

import { useEffect, useRef, useState } from "react";
import {
  BagCardCompacto,
  LojaRow,
} from "@/components/consumidor/bag-card-compacto";
import {
  MIN_BUSCA,
  SUGESTOES,
  aplicarSugestao,
  buscarSacolas,
  lojasDe,
  type SugestaoId,
} from "@/lib/busca";
import type { Sacola } from "@/lib/types";

// C1a/C1b — search is a STATE of the home screen, not another screen.
// Tapping the magnifier collapses the greeting and address, grows the field
// on the address line, and swaps the category row for recent searches and
// suggestions. The back arrow cancels and restores C1 exactly as it was,
// scroll included.

const RECENTES_KEY = "goodfood:buscas-recentes";
const MAX_RECENTES = 3;

function lerRecentes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const cru = window.localStorage.getItem(RECENTES_KEY);
    return cru ? (JSON.parse(cru) as string[]).slice(0, MAX_RECENTES) : [];
  } catch {
    return [];
  }
}

export function BuscaC1({
  todas,
  aberta,
  aoFechar,
}: {
  todas: Sacola[];
  aberta: boolean;
  aoFechar: () => void;
}) {
  const [q, setQ] = useState("");
  const [sugestao, setSugestao] = useState<SugestaoId | null>(null);
  const [recentes, setRecentes] = useState<string[]>([]);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberta) {
      setRecentes(lerRecentes());
      campo.current?.focus();
    } else {
      setQ("");
      setSugestao(null);
    }
  }, [aberta]);

  if (!aberta) return null;

  function guardarRecente(termo: string) {
    const limpo = termo.trim();
    if (limpo.length < MIN_BUSCA) return;
    const proximas = [limpo, ...recentes.filter((r) => r !== limpo)].slice(
      0,
      MAX_RECENTES,
    );
    setRecentes(proximas);
    try {
      window.localStorage.setItem(RECENTES_KEY, JSON.stringify(proximas));
    } catch {
      // private mode / storage disabled — recents just won't persist
    }
  }

  function limparRecentes() {
    setRecentes([]);
    try {
      window.localStorage.removeItem(RECENTES_KEY);
    } catch {
      // ignore
    }
  }

  const digitando = q.trim().length >= MIN_BUSCA;
  const sacolas = sugestao
    ? aplicarSugestao(todas, sugestao)
    : buscarSacolas(todas, q);
  const lojas = sugestao ? [] : lojasDe(sacolas);
  const mostrandoResultados = digitando || sugestao !== null;

  return (
    <div className="flex flex-1 flex-col">
      {/* the field grows on the address line; the arrow cancels */}
      <div className="flex items-center gap-2.5 px-5 pb-1 pt-[14px]">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Cancelar busca"
          className="flex h-11 w-8 shrink-0 items-center justify-start text-xl leading-none text-charcoal"
        >
          ←
        </button>

        <span className="flex h-[46px] flex-1 items-center gap-2 rounded-full border-[1.5px] border-brand bg-white px-4">
          <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true">
            <circle cx="10" cy="10" r="6" fill="none" stroke="#1a6b3a" strokeWidth="1.9" />
            <path
              d="M14.5 14.5 19 19"
              stroke="#1a6b3a"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={campo}
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSugestao(null);
            }}
            onBlur={() => guardarRecente(q)}
            placeholder="Sacola, loja ou categoria"
            aria-label="Buscar sacola, loja ou categoria"
            enterKeyHint="search"
            className="w-full bg-transparent text-[15px] font-medium outline-none [&::-webkit-search-cancel-button]:hidden placeholder:font-normal placeholder:text-muted"
          />
          {q.length > 0 && (
            <button
              type="button"
              onClick={() => {
                guardarRecente(q);
                setQ("");
                setSugestao(null);
                campo.current?.focus();
              }}
              aria-label="Limpar busca"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage text-sm leading-none text-brand-dark"
            >
              ✕
            </button>
          )}
        </span>
      </div>

      {mostrandoResultados ? (
        <div className="flex flex-col gap-2.5 px-5 pb-6 pt-3">
          {sacolas.length === 0 && lojas.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              Nada encontrado para “
              {sugestao
                ? SUGESTOES.find((s) => s.id === sugestao)?.label
                : q.trim()}
              ”.
              <br />
              Tente outro termo 🌙
            </p>
          ) : (
            <>
              {sacolas.length > 0 && (
                <>
                  <div className="pb-0.5 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
                    Sacolas · {sacolas.length}
                  </div>
                  {sacolas.map((s) => (
                    <BagCardCompacto key={s.listingId ?? s.id} sacola={s} termo={q} />
                  ))}
                </>
              )}

              {lojas.length > 0 && (
                <>
                  <div className="pb-0.5 pt-2 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
                    Lojas · {lojas.length}
                  </div>
                  {lojas.map((l) => (
                    <LojaRow key={l.nome} {...l} termo={q} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="px-5 pb-6 pt-4">
          {recentes.length > 0 && (
            <>
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
                  Buscas recentes
                </span>
                <button
                  type="button"
                  onClick={limparRecentes}
                  className="text-[13px] font-semibold text-terracotta-dark"
                >
                  Limpar
                </button>
              </div>
              <ul className="mb-5">
                {recentes.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => setQ(r)}
                      className="flex min-h-[44px] w-full items-center gap-2.5 text-left text-[15px] text-charcoal"
                    >
                      <svg width="15" height="15" viewBox="0 0 22 22" aria-hidden="true">
                        <circle cx="11" cy="11" r="7.5" fill="none" stroke="#8d8d84" strokeWidth="1.8" />
                        <path d="M11 7v4.4l3 1.8" stroke="#8d8d84" strokeWidth="1.8" fill="none" />
                      </svg>
                      <span className="flex-1">{r}</span>
                      <span className="text-sm text-[#b5b5a8]">↖</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="pb-2 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
            Sugestões perto de você
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSugestao(s.id);
                  setQ("");
                }}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border-[1.5px] border-sage-line bg-white px-3.5 text-[13px] font-semibold text-brand-dark"
              >
                {s.emoji && <span>{s.emoji}</span>}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
