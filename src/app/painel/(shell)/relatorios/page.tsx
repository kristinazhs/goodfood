import { BarChart } from "@/components/desktop/bar-chart";
import { BarList } from "@/components/desktop/bar-list";
import { Card } from "@/components/desktop/card";
import { Chips } from "@/components/desktop/chips";
import { PageHeader } from "@/components/desktop/page-header";
import { StatCard } from "@/components/desktop/stat-card";

const vendasSemana = [
  { label: "Seg", value: 5 },
  { label: "Ter", value: 7 },
  { label: "Qua", value: 4 },
  { label: "Qui", value: 9 },
  { label: "Sex", value: 8 },
  { label: "Sáb", value: 15 },
  { label: "Dom", value: 13 },
];

const janelas = [
  { label: "18h – 19h", value: 26, display: "26 sacolas" },
  { label: "19h – 20h", value: 18, display: "18 sacolas" },
  { label: "10h30 – 11h30", value: 11, display: "11 sacolas" },
  { label: "13h – 14h", value: 6, display: "6 sacolas" },
];

export default function PainelRelatorios() {
  return (
    <>
      <PageHeader
        title="Relatórios do estabelecimento"
        description="Desempenho da Domenica Casa de Pães na GoodFood."
        actions={<Chips options={["7 dias", "30 dias", "Total"]} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          hero
          value="R$ 1.342,60"
          label="faturado nos últimos 7 dias"
          trend="↑ 18% vs. semana anterior"
        />
        <StatCard value="61" label="sacolas vendidas" />
        <StatCard value="R$ 22,01" label="ticket médio" />
        <StatCard value="94%" label="taxa de retirada" trend="↑ acima da média" />
        <StatCard value="4,8 ★" label="avaliação média" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Vendas por dia" subtitle="sacolas vendidas nos últimos 7 dias">
          <BarChart data={vendasSemana} height={150} />
        </Card>

        <Card
          title="Janelas que mais vendem"
          subtitle="onde concentrar suas sacolas"
        >
          <BarList data={janelas} />
        </Card>

        <Card title="Não retiradas" subtitle="taxa de no-show por semana">
          <div className="flex items-end gap-6">
            <div>
              <div className="font-display text-[30px] font-bold">6%</div>
              <div className="text-[11.5px] text-muted">nesta semana</div>
            </div>
            <BarChart
              data={[
                { label: "S24", value: 9 },
                { label: "S25", value: 7 },
                { label: "S26", value: 8 },
                { label: "S27", value: 5 },
                { label: "S28", value: 6 },
              ]}
              height={90}
            />
          </div>
          <p className="mt-3 text-[11.5px] leading-[1.5] text-muted">
            Sacolas reservadas e não retiradas. A média da plataforma é 5,2% —
            você está próximo dela.
          </p>
        </Card>

        <Card
          title="Receita recuperada do desperdício"
          subtitle="o que teria sido perdido sem a GoodFood"
        >
          <div className="grid grid-cols-3 gap-3 rounded-[14px] bg-sage p-4 text-center">
            <div>
              <div className="font-display text-lg font-bold text-brand-dark">
                84kg
              </div>
              <div className="mt-0.5 text-[10px] leading-[1.3] text-muted">
                comida resgatada
              </div>
            </div>
            <div>
              <div className="font-display text-lg font-bold text-brand-dark">
                312
              </div>
              <div className="mt-0.5 text-[10px] leading-[1.3] text-muted">
                sacolas no total
              </div>
            </div>
            <div>
              <div className="font-display text-lg font-bold text-brand-dark">
                201kg
              </div>
              <div className="mt-0.5 text-[10px] leading-[1.3] text-muted">
                CO₂ evitado
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-[14px] border-[1.5px] border-sage-line p-3.5">
            <span className="blob-b flex h-10 w-10 shrink-0 items-center justify-center bg-[#FCEFE3] text-lg">
              🥐
            </span>
            <div className="flex-1">
              <div className="font-display text-[13px] font-semibold">
                Sacola Surpresa Doce
              </div>
              <div className="text-[11px] text-muted">
                mais vendida · 22 vendidas · R$ 613,80 gerados
              </div>
            </div>
            <span className="text-lg">🏆</span>
          </div>
        </Card>
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-[16px] bg-amber-bg p-4">
        <span className="text-lg">🌱</span>
        <div>
          <div className="text-[12.5px] font-extrabold leading-[1.3] text-[#8a6a14]">
            Você está entre os 15% melhores parceiros do RS
          </div>
          <div className="mt-1 text-[11.5px] leading-[1.4] text-[#9a7d2e]">
            Continue assim — sua nota e taxa de retirada estão acima da média da
            plataforma.
          </div>
        </div>
      </div>
    </>
  );
}
