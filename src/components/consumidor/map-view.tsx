"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#E9F1E8]" />,
});

export function MapView({ sacolas }: { sacolas: Sacola[] }) {
  const comCoords = sacolas.filter((s) => s.lat != null && s.lng != null);
  const [selecionada, setSelecionada] = useState<Sacola | null>(
    comCoords[0] ?? null,
  );

  if (comCoords.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center text-sm leading-[1.5] text-muted">
        As sacolas disponíveis ainda não têm localização no mapa. Use a aba
        Início para vê-las.
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <LeafletMap
        sacolas={comCoords}
        selectedId={selecionada?.id ?? null}
        onSelect={setSelecionada}
      />

      {selecionada && (
        <div className="absolute inset-x-0 bottom-0 z-[1000] px-4 pb-4">
          <Link
            href={`/consumidor/sacola/${selecionada.id}`}
            className="flex items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white p-3 shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-transform active:scale-[0.98]"
          >
            <span
              className="blob-b flex h-14 w-14 shrink-0 items-center justify-center text-2xl"
              style={{ background: selecionada.corThumb }}
            >
              {selecionada.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-sm font-semibold">
                {selecionada.nome}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-muted">
                {selecionada.loja}
                {selecionada.distancia ? ` · ${selecionada.distancia}` : ""}
              </span>
              <span className="mt-1.5 flex items-center gap-1.5">
                <span className="rounded-md bg-sage px-[7px] py-[3px] text-[10px] font-bold text-brand-dark">
                  {selecionada.timer}
                </span>
                <span className="font-display text-sm font-bold">
                  {brl(selecionada.preco)}
                </span>
              </span>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
