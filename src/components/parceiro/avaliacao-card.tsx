import type { AvaliacaoMock } from "@/lib/parceiro-mock";

// A poor rating is actionable, not just readable: it carries its own colour
// and leads with the reply. Shared by P4 and the Avaliações tab.

function Estrelas({ nota, critica }: { nota: number; critica?: boolean }) {
  return (
    <div
      className={`mt-[5px] text-[13px] font-bold leading-none ${
        critica ? "text-alert" : "text-terracotta"
      }`}
      aria-label={`${nota} de 5 estrelas`}
    >
      {"★".repeat(nota)}
      {"☆".repeat(5 - nota)}
    </div>
  );
}

export function AvaliacaoCard({ a }: { a: AvaliacaoMock }) {
  return (
    <div
      className={`rounded-2xl border-[1.5px] p-[13px] ${
        a.critica
          ? "border-[#f3d2ce] bg-alert-bg"
          : "border-sage-line bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] font-bold leading-none">{a.autor}</span>
        <span className="text-[12.5px] font-medium leading-none text-muted">
          {a.quando}
        </span>
      </div>

      <Estrelas nota={a.nota} critica={a.critica} />

      <p className="mt-2 text-[13.5px] leading-[1.55] text-[#4a4a44]">
        {a.texto}
      </p>

      <div className="mt-2.5 flex items-center justify-between gap-2.5">
        {a.sacola ? (
          <span className="inline-flex h-6 items-center rounded-[7px] bg-sage px-2 text-xs font-bold leading-none text-brand-dark">
            {a.sacola}
          </span>
        ) : (
          <span className="text-[12.5px] font-semibold leading-[1.3] text-alert">
            {a.aviso}
          </span>
        )}
        <button
          type="button"
          className={`h-9 shrink-0 rounded-full px-[13px] text-[12.5px] font-bold ${
            a.critica
              ? "bg-alert text-white"
              : "border-[1.5px] border-sage-line bg-white text-brand-dark"
          }`}
        >
          Responder
        </button>
      </div>
    </div>
  );
}
