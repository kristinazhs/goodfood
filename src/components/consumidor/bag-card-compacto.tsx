import Link from "next/link";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import { destacar } from "@/lib/busca";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

// The search result row: the same stock plaque and the same price hierarchy
// as the feed card, at 56px — so results read as the same object, not a
// different one.

function Marcado({ texto, termo }: { texto: string; termo: string }) {
  return (
    <>
      {destacar(texto, termo).map((t, i) =>
        t.marcado ? (
          <mark key={i} className="bg-amber-bg text-inherit">
            {t.texto}
          </mark>
        ) : (
          <span key={i}>{t.texto}</span>
        ),
      )}
    </>
  );
}

export function BagCardCompacto({
  sacola,
  termo = "",
}: {
  sacola: Sacola;
  termo?: string;
}) {
  const temDesconto = sacola.precoOriginal > sacola.preco;

  return (
    <Link
      href={`/consumidor/sacola/${sacola.id}`}
      className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-sage-line bg-white p-2 transition-transform active:scale-[0.98]"
    >
      <FotoSacola
        quantidade={sacola.disponivel}
        alt={sacola.nome}
        size={56}
        radius={10}
      />

      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[15px] font-semibold leading-[1.25]">
          <Marcado texto={sacola.nome} termo={termo} />
        </div>
        <div className="mt-0.5 truncate text-xs font-medium leading-[1.3] text-muted">
          <Marcado texto={sacola.loja} termo={termo} />
          {sacola.distancia ? ` · ${sacola.distancia}` : ""}
        </div>
      </div>

      <div className="shrink-0 text-right">
        {temDesconto && (
          <div className="text-[10.5px] font-medium leading-none text-[#8d8d84] line-through">
            {brl(sacola.precoOriginal)}
          </div>
        )}
        <div className="mt-0.5 font-display text-base font-bold leading-none">
          {brl(sacola.preco)}
        </div>
      </div>
    </Link>
  );
}

export function LojaRow({
  nome,
  avaliacao,
  distancia,
  sacolas,
  sacolaId,
  termo = "",
}: {
  nome: string;
  avaliacao: number;
  distancia: string;
  sacolas: number;
  sacolaId: string;
  termo?: string;
}) {
  return (
    <Link
      // No store page exists yet, so this opens the shop's sacola.
      href={`/consumidor/sacola/${sacolaId}`}
      className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-sage-line bg-white p-2 transition-transform active:scale-[0.98]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage font-mono text-[9px] text-muted">
        logo
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[15px] font-semibold leading-[1.25]">
          <Marcado texto={nome} termo={termo} />
        </div>
        <div className="mt-0.5 truncate text-xs font-medium leading-[1.3] text-muted">
          ★ {avaliacao.toFixed(1).replace(".", ",")}
          {distancia ? ` · ${distancia}` : ""} ·{" "}
          {sacolas === 1 ? "1 sacola hoje" : `${sacolas} sacolas hoje`}
        </div>
      </div>

      <span className="shrink-0 pr-1 text-lg leading-none text-[#b5b5a8]">
        ›
      </span>
    </Link>
  );
}
