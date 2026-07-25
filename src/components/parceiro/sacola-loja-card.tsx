import Link from "next/link";
import { brl } from "@/lib/format";
import type { SacolaLoja } from "@/lib/types";

const plaqueStyles = {
  ativa: "bg-sage text-brand-dark",
  reservada: "bg-[#E5EEF8] text-[#1D5A96]",
  retirada: "bg-[#EFEDE6] text-muted",
  naoRetirada: "bg-alert-bg text-alert",
};

function Plaque({
  num,
  label,
  tipo,
}: {
  num: number;
  label: string;
  tipo: keyof typeof plaqueStyles;
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center gap-[1px] rounded-[10px] px-0.5 pb-1 pt-[5px] ${
        plaqueStyles[tipo]
      } ${num === 0 ? "opacity-30" : ""}`}
    >
      <span className="font-display text-sm font-bold leading-none">{num}</span>
      <span className="text-[8px] font-bold uppercase leading-none tracking-[0.2px]">
        {label}
      </span>
    </div>
  );
}

export function SacolaLojaCard({ sacola }: { sacola: SacolaLoja }) {
  return (
    <div className="overflow-hidden rounded-[18px] border-[1.5px] border-sage-line bg-white">
      <div className="flex items-start gap-3 px-3.5 pt-[13px]">
        <span
          className="blob-b flex h-[54px] w-[54px] shrink-0 items-center justify-center text-[23px]"
          style={{ background: sacola.corThumb }}
        >
          {sacola.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="font-display text-[14.5px] font-semibold leading-[1.25]">
              {sacola.nome}
            </span>
            <span className="shrink-0 font-display text-[15px] font-bold">
              {brl(sacola.preco)}
            </span>
          </div>
          <div className="mt-[3px] text-[11px] text-muted">
            {sacola.retiradaLabel}
          </div>
        </div>
      </div>

      <div className="px-3.5 pb-3.5 pt-3">
        <div className="flex gap-1.5">
          <Plaque num={sacola.ativa} label="Ativa" tipo="ativa" />
          <Plaque num={sacola.reservada} label="Reserv." tipo="reservada" />
          <Plaque num={sacola.retirada} label="Retirada" tipo="retirada" />
          <Plaque num={sacola.naoRetirada} label="N/ Ret." tipo="naoRetirada" />
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[11.5px] text-muted">
            <b className="text-[12.5px] font-extrabold text-brand-dark">
              {brl(sacola.receita)}
            </b>{" "}
            nesta sacola
          </span>
          <Link
            href={`/parceiro/sacolas/${sacola.id}`}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
              sacola.alerta
                ? "bg-alert-bg text-alert"
                : "bg-sage text-brand-dark"
            }`}
          >
            {sacola.alerta ? "Resolver" : "Ver detalhes"}
          </Link>
        </div>
      </div>
    </div>
  );
}
