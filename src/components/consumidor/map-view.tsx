"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import type { PontoMapa } from "@/components/consumidor/leaflet-map";
import type { Origem } from "@/lib/distancia";
import { brl } from "@/lib/format";
import { escolherLojaNoMapa } from "@/lib/mapa";
import type { Sacola } from "@/lib/types";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#eaf0e6]" />,
});

// Everything filterable lives in the sheet — the map surface stays for the
// map. Window and price answer "can I get there in time and can I afford it";
// category is there for when someone knows what they want.
type FiltroId = "abertas" | "preco20";

const CATEGORIAS = [
  { id: "padaria", label: "Padaria" },
  { id: "doceria", label: "Doceria" },
  { id: "refeicao", label: "Refeição" },
  { id: "mercado", label: "Mercado" },
];

function estaAberta(s: Sacola, agora: number): boolean {
  if (!s.janelaInicio || !s.janelaFim) return false;
  return (
    new Date(s.janelaInicio).getTime() <= agora &&
    new Date(s.janelaFim).getTime() >= agora
  );
}

export function MapView({
  sacolas,
  origem,
}: {
  sacolas: Sacola[];
  origem: Origem;
}) {
  const [filtros, setFiltros] = useState<FiltroId[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [folhaAberta, setFolhaAberta] = useState(false);
  const [lojaSelecionada, setLojaSelecionada] = useState<string | null>(null);

  const comCoords = useMemo(
    () => sacolas.filter((s) => s.lat != null && s.lng != null),
    [sacolas],
  );

  const visiveis = useMemo(() => {
    const agora = Date.now();
    return comCoords.filter(
      (s) =>
        (!filtros.includes("abertas") || estaAberta(s, agora)) &&
        (!filtros.includes("preco20") || s.preco <= 20) &&
        (categorias.length === 0 || categorias.includes(s.categoria)),
    );
  }, [comCoords, filtros, categorias]);

  // One pin per shop: a shop can sell several kinds of sacola, so the pin
  // carries the total count rather than a price that would misrepresent it.
  const pontos: PontoMapa[] = useMemo(() => {
    const porLoja = new Map<string, PontoMapa>();
    for (const s of visiveis) {
      const atual = porLoja.get(s.loja);
      if (atual) atual.quantidade += s.disponivel;
      else
        porLoja.set(s.loja, {
          loja: s.loja,
          lat: s.lat as number,
          lng: s.lng as number,
          quantidade: s.disponivel,
        });
    }
    return [...porLoja.values()];
  }, [visiveis]);

  // The card describes the SHOP, not one of its sacolas. Showing a single
  // sacola meant the map picked one for you and hid the rest — a bakery with
  // four kinds looked like a bakery with one.
  const loja = useMemo(
    () => escolherLojaNoMapa(visiveis, lojaSelecionada),
    [visiveis, lojaSelecionada],
  );

  // Which pin reads as selected, including the default one.
  const lojaAtiva = loja?.nome ?? null;

  function alternar(id: FiltroId) {
    setFiltros((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }

  if (comCoords.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center text-sm leading-[1.5] text-muted">
        As sacolas disponíveis ainda não têm localização no mapa. Use a aba
        Início para vê-las.
      </div>
    );
  }

  const rota = loja
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${loja.endereco || loja.nome}, Porto Alegre`,
      )}`
    : "#";

  return (
    <div className="relative flex-1 overflow-hidden bg-[#eaf0e6]">
      <LeafletMap
        pontos={pontos}
        origem={origem}
        lojaSelecionada={lojaAtiva}
        onSelect={setLojaSelecionada}
      />

      {/* header floats over the map — the old fixed title block ate ~90px */}
      <div className="pointer-events-none absolute inset-x-5 top-[14px] z-[600] flex gap-2">
        <div className="pointer-events-auto flex h-[46px] flex-1 items-center gap-[9px] rounded-[14px] bg-white px-3.5 shadow-[0_6px_18px_rgba(0,0,0,0.10)]">
          <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0">
            <circle cx="10" cy="10" r="6" fill="none" stroke="#6b6b62" strokeWidth="1.8" />
            <path d="M14.5 14.5 19 19" stroke="#6b6b62" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="truncate text-sm text-muted">{origem.label}</span>
        </div>
        <button
          type="button"
          aria-label="Filtros"
          aria-expanded={folhaAberta}
          onClick={() => setFolhaAberta(true)}
          className="pointer-events-auto relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-white shadow-[0_6px_18px_rgba(0,0,0,0.10)]"
        >
          {(filtros.length > 0 || categorias.length > 0) && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-terracotta" />
          )}
          <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
            <path
              d="M3.5 7h15M6.5 11h9M9 15h4"
              stroke="#23231f"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Every filter lives here, so the map surface stays uncluttered.
          Raio is the one still missing. */}
      {folhaAberta && (
        <div className="absolute inset-0 z-[1100]">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setFolhaAberta(false)}
            className="absolute inset-0 bg-black/25"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[22px] bg-white px-5 pb-6 pt-4 shadow-[0_-2px_24px_rgba(0,0,0,0.18)]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-sage-line" />
            <div className="mb-3 font-display text-lg font-semibold">
              Filtros
            </div>

            {(
              [
                { id: "abertas" as const, label: "Abertas agora", nota: "Janela de retirada aberta neste momento" },
                { id: "preco20" as const, label: "Até R$ 20", nota: "Somente sacolas de até R$ 20,00" },
              ]
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => alternar(f.id)}
                aria-pressed={filtros.includes(f.id)}
                className="flex w-full items-center justify-between gap-3 border-b border-sage-line py-3 text-left last:border-b-0"
              >
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold">
                    {f.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {f.nota}
                  </span>
                </span>
                <span
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                    filtros.includes(f.id) ? "bg-brand" : "bg-sage-line"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white transition-transform ${
                      filtros.includes(f.id) ? "translate-x-5" : ""
                    }`}
                  />
                </span>
              </button>
            ))}

            <div className="mt-4">
              <span className="mb-2 block text-[13px] font-bold leading-none text-[#4a4a44]">
                Categoria
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS.map((c) => {
                  const on = categorias.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setCategorias((xs) =>
                          on ? xs.filter((x) => x !== c.id) : [...xs, c.id],
                        )
                      }
                      aria-pressed={on}
                      className={`inline-flex h-9 items-center rounded-full px-3.5 text-[13px] ${
                        on
                          ? "bg-brand-dark font-bold text-white"
                          : "border-[1.5px] border-sage-line bg-white font-semibold text-charcoal"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted">
                Sem seleção, mostramos todas as categorias.
              </p>
            </div>

            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setFiltros([]);
                  setCategorias([]);
                }}
                className="flex h-12 flex-1 items-center justify-center rounded-[14px] border-[1.5px] border-sage-line bg-white text-[15px] font-semibold text-charcoal"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => setFolhaAberta(false)}
                className="flex h-12 flex-1 items-center justify-center rounded-[14px] bg-brand text-[15px] font-bold text-white"
              >
                Ver {pontos.length === 1 ? "1 loja" : `${pontos.length} lojas`}
              </button>
            </div>
          </div>
        </div>
      )}

      {pontos.length === 0 && (
        <div className="absolute inset-x-8 top-1/2 z-[600] -translate-y-1/2 rounded-2xl bg-white/95 px-5 py-4 text-center text-sm text-muted shadow-[0_6px_18px_rgba(0,0,0,0.10)]">
          Nenhuma sacola com esses filtros agora.
        </div>
      )}

      {/* A SHOP plaque: name, how much it has, and a way in. Choosing which
          sacola happens on the shop's own page, where all of them are. */}
      {loja && (
        <div className="absolute inset-x-4 bottom-4 z-[1000] rounded-[20px] bg-white p-3.5 shadow-[0_-2px_24px_rgba(0,0,0,0.14)]">
          <div className="flex gap-[13px]">
            <FotoSacola
              src={loja.fotoUrl}
              size={72}
              radius={16}
              legenda={"foto\nloja"}
              alt=""
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="truncate font-display text-base font-semibold leading-[1.3]">
                {loja.nome}
              </div>
              <div className="mt-0.5 truncate text-[13px] font-medium leading-[1.3] text-muted">
                {loja.distancia}
                {/* No star until the shop actually has reviews. */}
                {loja.avaliacao != null && (
                  <>
                    {loja.distancia ? " · " : ""}★{" "}
                    {loja.avaliacao.toFixed(1).replace(".", ",")}
                    {loja.avaliacoesTotal > 0 ? ` (${loja.avaliacoesTotal})` : ""}
                  </>
                )}
              </div>
              <div className="mt-auto flex items-center gap-[7px] pt-[9px]">
                {loja.esgotada ? (
                  <span className="inline-flex h-[26px] items-center whitespace-nowrap rounded-lg bg-[#f2efe8] px-[9px] text-xs font-bold leading-none text-muted">
                    esgotada
                  </span>
                ) : (
                  <span className="inline-flex h-[26px] items-center whitespace-nowrap rounded-lg bg-sage px-[9px] text-xs font-bold leading-none text-brand-dark">
                    {loja.janela}
                  </span>
                )}
              </div>
            </div>
          </div>

          {loja.esgotada ? (
            <p className="mt-2.5 text-[12.5px] font-medium leading-[1.4] text-muted">
              Tudo reservado nesta loja. Toque em outro pin para ver o que
              ainda tem perto de você.
            </p>
          ) : (
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="text-[12.5px] font-semibold leading-none text-muted">
                {loja.variedades === 1
                  ? "1 tipo de sacola"
                  : `${loja.variedades} tipos de sacola`}
                {" · "}
                {loja.quantidade === 1
                  ? "1 disponível"
                  : `${loja.quantidade} disponíveis`}
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[11px] font-medium leading-none text-[#8d8d84]">
                  a partir de
                </span>
                <span className="mt-0.5 block font-display text-[17px] font-bold leading-none">
                  {brl(loja.precoMin)}
                </span>
              </span>
            </div>
          )}

          <div className="mt-3 flex gap-2.5">
            {loja.esgotada ? (
              <Link
                href={`/loja/${loja.id}?de=mapa`}
                className="flex h-12 flex-1 items-center justify-center rounded-[14px] bg-sage text-[15px] font-bold text-brand-dark transition-transform active:scale-[0.98]"
              >
                Ver a loja
              </Link>
            ) : (
              <Link
                href={`/loja/${loja.id}?de=mapa`}
                className="flex h-12 flex-1 items-center justify-center rounded-[14px] bg-brand text-[15px] font-bold text-white transition-transform active:scale-[0.98]"
              >
                Ver sacolas
              </Link>
            )}
            <a
              href={rota}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Como chegar"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border-[1.5px] border-sage-line bg-white"
            >
              <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
                <path
                  d="M11 3 19 19 11 15.5 3 19z"
                  fill="none"
                  stroke="#134d29"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
