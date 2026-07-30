import { BottomNav } from "@/components/ui/bottom-nav";
import { AvisoDemo } from "@/components/ui/em-breve";
import { navParceiro } from "@/lib/nav";
import { METRICAS, PERIODOS, REPASSE, SEMANA } from "@/lib/parceiro-mock";

// P4 — how much did I sell. The reviews used to be repeated at the bottom of
// this screen; Avaliações owns them, and showing the same list in two places
// only made it unclear which one was the real one.
//
// DEMO SCREEN: every number here comes from lib/parceiro-mock.ts. See that
// file for why it isn't wired to Supabase yet.

const TOM: Record<string, string> = {
  brand: "text-brand-dark",
  muted: "text-muted",
  alerta: "text-terracotta-dark",
};

export default function Desempenho() {
  return (
    <>
      <main className="flex-1 pb-6">
        <div className="px-5 pt-[18px]">
          <h1 className="font-display text-[23px] font-semibold">Desempenho</h1>
          {/* Was a faint grey line that read like a footnote. A tester skimmed
              past it and took the numbers for their own. */}
          <div className="mt-3">
            <AvisoDemo titulo="Tela de demonstração">
              Todos os números desta tela são fictícios, iguais para qualquer
              loja. Os filtros de período também não funcionam ainda. Serve
              para mostrar como o acompanhamento vai ser.
            </AvisoDemo>
          </div>

          <div className="mt-3 flex gap-2 opacity-60">
            {PERIODOS.map((p, i) => (
              <span
                key={p}
                className={`inline-flex h-[34px] items-center rounded-full px-[13px] text-[12.5px] ${
                  i === 0
                    ? "bg-brand-dark font-bold text-white"
                    : "border-[1.5px] border-sage-line bg-white font-semibold text-charcoal"
                }`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-5 mt-4 rounded-[20px] border-[1.5px] border-sage-line bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase leading-none tracking-[0.7px] text-muted">
                {REPASSE.titulo}
              </div>
              <div className="mt-2 font-display text-[32px] font-bold leading-none">
                {REPASSE.valor}
              </div>
              <div className="mt-1.5 text-[13px] font-semibold leading-none text-brand-dark">
                {REPASSE.variacao}
              </div>
            </div>
            <span className="inline-flex h-[26px] shrink-0 items-center rounded-lg bg-sage px-[9px] text-xs font-bold leading-none text-brand-dark">
              {REPASSE.sacolas}
            </span>
          </div>

          {/* The chart concludes something: the best day is marked, not left
              for the reader to spot. */}
          <div className="mt-[18px] flex h-24 items-end gap-2">
            {SEMANA.map((d) => (
              <div
                key={d.dia}
                className="flex h-full flex-1 flex-col items-center justify-end gap-[7px]"
              >
                <span
                  className={`w-full rounded-t-[5px] rounded-b-[3px] ${
                    d.destaque ? "bg-brand" : "bg-sage"
                  }`}
                  style={{ height: `${d.altura}%` }}
                />
                <span
                  className={`text-[11.5px] leading-none ${
                    d.destaque
                      ? "font-bold text-charcoal"
                      : "font-semibold text-muted"
                  }`}
                >
                  {d.dia}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] font-semibold leading-[1.4] text-brand-dark">
            Sábado rende 2,3× a média — vale publicar mais sacolas nesse dia.
          </p>
        </div>

        {/* Every number carries a comparison: "28 sacolas" alone leads to no
            decision. */}
        <div className="grid grid-cols-2 gap-2.5 px-5 pt-3.5">
          {METRICAS.map((m) => (
            <div
              key={m.rotulo}
              className="rounded-2xl border-[1.5px] border-sage-line bg-white p-[13px]"
            >
              <div className="font-display text-xl font-bold">{m.valor}</div>
              <div className="mt-[3px] text-[12.5px] font-semibold leading-[1.3] text-muted">
                {m.rotulo}
              </div>
              <div
                className={`mt-1.5 text-xs font-semibold leading-none ${TOM[m.tom]}`}
              >
                {m.nota}
              </div>
            </div>
          ))}
        </div>

      </main>
      <BottomNav items={navParceiro} />
    </>
  );
}
