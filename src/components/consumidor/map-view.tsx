"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import type { PontoMapa } from "@/components/consumidor/leaflet-map";
import { ORIGEM } from "@/lib/distancia";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#eaf0e6]" />,
});

// On the map, category matters less than "can I get there in time and can I
// afford it" — so the quick filters are window and price.
type FiltroId = "abertas" | "preco20";

function estaAberta(s: Sacola, agora: number): boolean {
  if (!s.janelaInicio || !s.janelaFim) return false;
  return (
    new Date(s.janelaInicio).getTime() <= agora &&
    new Date(s.janelaFim).getTime() >= agora
  );
}

export function MapView({ sacolas }: { sacolas: Sacola[] }) {
  const [filtros, setFiltros] = useState<FiltroId[]>([]);
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
        (!filtros.includes("preco20") || s.preco <= 20),
    );
  }, [comCoords, filtros]);

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

  // The card shows the shop's most urgent sacola. With nothing tapped yet the
  // map still opens on a decision rather than an empty sheet: the soonest
  // window wins, matching the order the feed uses.
  const selecionada = useMemo(() => {
    const candidatas = lojaSelecionada
      ? visiveis.filter((s) => s.loja === lojaSelecionada)
      : visiveis;
    return (
      [...candidatas].sort((a, b) =>
        (a.janelaFim ?? "").localeCompare(b.janelaFim ?? ""),
      )[0] ?? null
    );
  }, [visiveis, lojaSelecionada]);

  // Which pin reads as selected, including the default one.
  const lojaAtiva = selecionada?.loja ?? null;

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

  const rota = selecionada
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${selecionada.endereco || selecionada.loja}, Porto Alegre`,
      )}`
    : "#";

  return (
    <div className="relative flex-1 overflow-hidden bg-[#eaf0e6]">
      <LeafletMap
        pontos={pontos}
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
          <span className="truncate text-sm text-muted">{ORIGEM.label}</span>
        </div>
        <button
          type="button"
          aria-label="Filtros"
          aria-expanded={folhaAberta}
          onClick={() => setFolhaAberta(true)}
          className="pointer-events-auto relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-white shadow-[0_6px_18px_rgba(0,0,0,0.10)]"
        >
          {filtros.length > 0 && (
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

      <div className="absolute left-5 top-[78px] z-[600] flex gap-2">
        <button
          type="button"
          onClick={() => alternar("abertas")}
          aria-pressed={filtros.includes("abertas")}
          className={`inline-flex h-8 items-center rounded-full px-3 text-[12.5px] leading-none ${
            filtros.includes("abertas")
              ? "bg-brand-dark font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.14)]"
              : "bg-white font-semibold text-charcoal shadow-[0_4px_12px_rgba(0,0,0,0.10)]"
          }`}
        >
          Abertas agora
        </button>
        <button
          type="button"
          onClick={() => alternar("preco20")}
          aria-pressed={filtros.includes("preco20")}
          className={`inline-flex h-8 items-center rounded-full px-3 text-[12.5px] leading-none ${
            filtros.includes("preco20")
              ? "bg-brand-dark font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.14)]"
              : "bg-white font-semibold text-charcoal shadow-[0_4px_12px_rgba(0,0,0,0.10)]"
          }`}
        >
          Até R$ 20
        </button>
      </div>

      {/* Filter sheet — the chips above are shortcuts into the same state.
          Raio and categoria belong here too, once they exist. */}
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

            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setFiltros([])}
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

      {/* the C1 card, so the same object reads the same way on both screens */}
      {selecionada && (
        <div className="absolute inset-x-4 bottom-4 z-[1000] rounded-[20px] bg-white p-3.5 shadow-[0_-2px_24px_rgba(0,0,0,0.14)]">
          <div className="flex gap-[13px]">
            <FotoSacola
              src={selecionada.fotoUrl}
              quantidade={selecionada.disponivel}
              alt={selecionada.nome}
              size={72}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="truncate font-display text-base font-semibold leading-[1.3]">
                {selecionada.nome}
              </div>
              <div className="mt-0.5 truncate text-[13px] font-medium leading-[1.3] text-muted">
                {selecionada.loja}
                {selecionada.distancia ? ` · ${selecionada.distancia}` : ""}
              </div>
              <div className="mt-auto flex items-center gap-[7px] pt-[9px]">
                <span className="inline-flex h-[26px] items-center whitespace-nowrap rounded-lg bg-sage px-[9px] text-xs font-bold leading-none text-brand-dark">
                  {selecionada.janela}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            {selecionada.precoOriginal > selecionada.preco && (
              <span className="text-[11px] font-medium leading-none text-[#8d8d84] line-through">
                {brl(selecionada.precoOriginal)}
              </span>
            )}
            <span className="font-display text-[17px] font-bold leading-none">
              {brl(selecionada.preco)}
            </span>
          </div>

          <div className="mt-3 flex gap-2.5">
            <Link
              href={`/consumidor/sacola/${selecionada.id}?de=mapa`}
              className="flex h-12 flex-1 items-center justify-center rounded-[14px] bg-brand text-[15px] font-bold text-white transition-transform active:scale-[0.98]"
            >
              Ver sacola
            </Link>
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
