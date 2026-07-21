"use client";

import Link from "next/link";
import { useState } from "react";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

// Fixed pin spots on the dummy map; sacolas are placed by order.
const posicoes: { top: string; left: string }[] = [
  { top: "28%", left: "46%" },
  { top: "54%", left: "24%" },
  { top: "20%", left: "72%" },
  { top: "68%", left: "62%" },
  { top: "40%", left: "80%" },
  { top: "76%", left: "34%" },
];

export function MapView({ sacolas }: { sacolas: Sacola[] }) {
  const [selecionada, setSelecionada] = useState<Sacola>(sacolas[0]);

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* dummy map surface */}
      <div className="absolute inset-0 bg-[#E9F1E8]">
        <svg
          className="absolute inset-0 h-full w-full opacity-70"
          preserveAspectRatio="none"
          viewBox="0 0 400 700"
          aria-hidden
        >
          <rect width="400" height="700" fill="#E9F1E8" />
          {/* blocks */}
          <rect x="20" y="40" width="120" height="90" rx="10" fill="#DCE8DB" />
          <rect x="180" y="20" width="90" height="140" rx="10" fill="#DCE8DB" />
          <rect x="300" y="60" width="80" height="100" rx="10" fill="#DCE8DB" />
          <rect x="30" y="180" width="100" height="110" rx="10" fill="#DCE8DB" />
          <rect x="170" y="200" width="150" height="80" rx="10" fill="#D3E0D1" />
          <rect x="40" y="330" width="140" height="100" rx="10" fill="#DCE8DB" />
          <rect x="220" y="320" width="110" height="130" rx="10" fill="#DCE8DB" />
          <rect x="20" y="470" width="160" height="90" rx="10" fill="#D3E0D1" />
          <rect x="220" y="480" width="150" height="100" rx="10" fill="#DCE8DB" />
          <rect x="60" y="600" width="130" height="80" rx="10" fill="#DCE8DB" />
          <rect x="240" y="600" width="120" height="80" rx="10" fill="#D3E0D1" />
          {/* streets */}
          <path d="M0 160 H400" stroke="#F7F3EB" strokeWidth="10" />
          <path d="M0 310 H400" stroke="#F7F3EB" strokeWidth="10" />
          <path d="M0 460 H400" stroke="#F7F3EB" strokeWidth="10" />
          <path d="M0 590 H400" stroke="#F7F3EB" strokeWidth="10" />
          <path d="M150 0 V700" stroke="#F7F3EB" strokeWidth="10" />
          <path d="M300 0 V700" stroke="#F7F3EB" strokeWidth="10" />
          {/* park */}
          <circle cx="245" cy="240" r="46" fill="#C9E4D2" />
        </svg>
      </div>

      {/* user location */}
      <div
        className="absolute z-[5] -translate-x-1/2 -translate-y-1/2"
        style={{ top: "50%", left: "50%" }}
      >
        <span className="absolute -inset-2.5 animate-ping rounded-full bg-brand/25" />
        <span className="relative block h-3.5 w-3.5 rounded-full border-2 border-white bg-terracotta-dark shadow-[0_0_0_3px_rgba(199,123,69,0.25)]" />
      </div>

      {/* sacola pins */}
      {sacolas.map((s, i) => {
        const pos = posicoes[i % posicoes.length];
        const ativa = selecionada.id === s.id;
        return (
          <button
            key={s.id}
            onClick={() => setSelecionada(s)}
            className="absolute z-10 -translate-x-1/2 -translate-y-full transition-transform"
            style={{ top: pos.top, left: pos.left }}
          >
            <span
              className={`flex items-center gap-1.5 rounded-full border-2 py-1.5 pl-1.5 pr-3 text-xs font-extrabold shadow-[0_6px_14px_rgba(0,0,0,0.15)] ${
                ativa
                  ? "border-brand-dark bg-brand text-white"
                  : "border-white bg-white text-brand-dark"
              }`}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[13px]"
                style={{ background: ativa ? "rgba(255,255,255,0.25)" : s.corThumb }}
              >
                {s.emoji}
              </span>
              {brl(s.preco)}
            </span>
            <span
              className={`mx-auto block h-2 w-2 -translate-y-px rotate-45 ${
                ativa ? "bg-brand-dark" : "bg-white"
              }`}
            />
          </button>
        );
      })}

      {/* recenter button */}
      <button
        aria-label="Centralizar no meu local"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-base shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
      >
        🎯
      </button>

      {/* selected sacola card */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
        <Link
          href={`/consumidor/sacola/${selecionada.id}`}
          className="flex items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white p-3 shadow-[0_10px_28px_rgba(0,0,0,0.14)] transition-transform active:scale-[0.98]"
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
              {selecionada.loja} · {selecionada.distancia}
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
    </div>
  );
}
