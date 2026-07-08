import { PeriodChips } from "@/components/parceiro/period-chips";
import { BackButton } from "@/components/ui/back-button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { navParceiro } from "@/lib/nav";

const vendasPorDia = [
  { dia: "Seg", altura: 38 },
  { dia: "Ter", altura: 52 },
  { dia: "Qua", altura: 30 },
  { dia: "Qui", altura: 65 },
  { dia: "Sex", altura: 58 },
  { dia: "Sáb", altura: 100, destaque: true },
  { dia: "Dom", altura: 72 },
];

const stats = [
  { valor: "61", label: "sacolas vendidas" },
  { valor: "R$ 22,01", label: "ticket médio" },
  { valor: "4,8 ★", label: "avaliação média" },
  { valor: "94%", label: "taxa de retirada" },
];

const impacto = [
  { num: "84kg", label: "comida resgatada" },
  { num: "312", label: "sacolas no total" },
  { num: "201kg", label: "CO₂ evitado" },
];

export default function Desempenho() {
  return (
    <>
      <main className="flex-1">
        <div className="flex items-center justify-between px-5 pb-1.5 pt-5">
          <BackButton href="/parceiro" />
          <h1 className="font-display text-lg font-semibold">Desempenho</h1>
          <span className="w-[38px]" />
        </div>

        <PeriodChips />

        <div className="relative mx-5 mt-3.5 overflow-hidden rounded-[20px] bg-brand p-5">
          <span className="absolute -right-[30px] -top-10 h-[110px] w-[110px] rounded-full bg-white/[0.05]" />
          <span className="absolute -bottom-[30px] -left-5 h-[70px] w-[70px] rounded-full bg-white/[0.05]" />
          <div className="relative z-[2] text-[11.5px] text-mint">
            Faturado nos últimos 7 dias
          </div>
          <div className="relative z-[2] mt-1 font-display text-[30px] font-bold text-white">
            R$ 1.342,60
          </div>
          <div className="relative z-[2] mt-1.5 text-xs font-bold text-[#BFE3CC]">
            ↑ 18% vs. semana anterior
          </div>
        </div>

        <div className="mx-5 mt-4 rounded-[18px] border-[1.5px] border-sage-line bg-white p-4">
          <div className="mb-3.5 flex items-baseline justify-between">
            <span className="font-display text-[14.5px] font-semibold">
              Vendas por dia
            </span>
            <span className="text-[10.5px] text-muted">sacolas vendidas</span>
          </div>
          <div className="flex h-[90px] items-end gap-2">
            {vendasPorDia.map((v) => (
              <div
                key={v.dia}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              >
                <div
                  className={`w-full rounded-t-[5px] rounded-b-sm ${
                    v.destaque ? "bg-brand" : "bg-sage"
                  }`}
                  style={{ height: `${v.altura}%`, minHeight: 4 }}
                />
                <span className="text-[9.5px] font-semibold text-muted">
                  {v.dia}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 px-5 pt-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 py-[13px]"
            >
              <div className="font-display text-lg font-bold">{s.valor}</div>
              <div className="mt-0.5 text-[10.5px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-2.5 pt-[18px] text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
          Seu impacto total
        </div>
        <div className="mx-5 rounded-2xl bg-sage p-4">
          <div className="flex">
            {impacto.map((i) => (
              <div key={i.label} className="flex-1 text-center">
                <div className="font-display text-lg font-bold text-brand-dark">
                  {i.num}
                </div>
                <div className="mt-[3px] text-[10px] leading-[1.3] text-muted">
                  {i.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-2.5 pt-[18px] text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
          Mais vendida da semana
        </div>
        <div className="mx-5 flex items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white px-3.5 py-[13px]">
          <span className="blob-b flex h-[50px] w-[50px] shrink-0 items-center justify-center bg-sage text-[21px]">
            🥐
          </span>
          <div className="flex-1">
            <div className="font-display text-sm font-semibold">
              Sacola Surpresa Doce
            </div>
            <div className="mt-0.5 text-[11.5px] font-semibold text-muted">
              22 vendidas · R$ 613,80 gerados
            </div>
          </div>
          <span className="shrink-0 text-xl">🏆</span>
        </div>

        <div className="mx-5 mb-6 mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-bg p-3.5">
          <span className="text-lg">🌱</span>
          <div>
            <div className="text-[12.5px] font-extrabold leading-[1.3] text-[#8a6a14]">
              Você está entre os 15% melhores parceiros do RS
            </div>
            <div className="mt-1 text-[11.5px] leading-[1.4] text-[#9a7d2e]">
              Continue assim — sua nota e taxa de retirada estão acima da média
              da plataforma.
            </div>
          </div>
        </div>
      </main>
      <BottomNav items={navParceiro} />
    </>
  );
}
