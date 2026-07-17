import Link from "next/link";
import { BarChart } from "@/components/desktop/bar-chart";
import { Card } from "@/components/desktop/card";
import { PageHeader } from "@/components/desktop/page-header";
import { StatCard } from "@/components/desktop/stat-card";
import { StatusBadge } from "@/components/desktop/status-badge";
import { PlaqueCounts } from "@/components/painel/plaque-counts";
import { brl } from "@/lib/format";
import { pedidosLoja, sacolasLoja } from "@/lib/mock-data";

const vendasSemana = [
  { label: "Seg", value: 5 },
  { label: "Ter", value: 7 },
  { label: "Qua", value: 4 },
  { label: "Qui", value: 9 },
  { label: "Sex", value: 8 },
  { label: "Sáb", value: 15 },
  { label: "Dom", value: 13 },
];

export default function PainelDashboard() {
  const aguardando = pedidosLoja.filter((p) => p.status === "reservado");

  return (
    <>
      <PageHeader
        title={
          <>
            Oi, Marcos 👋{" "}
            <span className="text-terracotta-dark">Sua loja hoje</span>
          </>
        }
        description="Visão geral do dia na Domenica Casa de Pães."
        actions={
          <Link
            href="/painel/sacolas/nova"
            className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-bold text-white"
          >
            + Criar sacola
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard hero value="R$ 124" label="faturado hoje" trend="↑ 12% vs. ontem" />
        <StatCard value="5" label="sacolas vendidas hoje" />
        <StatCard value={String(aguardando.length)} label="pedidos aguardando retirada" />
        <StatCard value="R$ 1.342" label="faturado nesta semana" trend="↑ 18% vs. anterior" />
        <StatCard value="7kg" label="comida resgatada hoje" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card
          title="Sacolas de hoje"
          subtitle="Status em tempo real das suas ofertas"
          actions={
            <Link
              href="/painel/sacolas"
              className="text-[12px] font-bold text-brand-dark underline"
            >
              Ver todas
            </Link>
          }
        >
          <div className="flex flex-col divide-y divide-sage-line/60">
            {sacolasLoja.map((s) => (
              <div key={s.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span
                  className="blob-b flex h-11 w-11 shrink-0 items-center justify-center text-xl"
                  style={{ background: s.corThumb }}
                >
                  {s.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-display text-[14px] font-semibold">
                      {s.nome}
                    </span>
                    <span className="font-display text-[14px] font-bold">
                      {brl(s.preco)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    {s.retiradaLabel} · <b className="text-brand-dark">{brl(s.receita)}</b> nesta sacola
                  </div>
                  <div className="mt-1.5">
                    <PlaqueCounts sacola={s} />
                  </div>
                </div>
                <Link
                  href={`/painel/sacolas/${s.id}/editar`}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold ${
                    s.alerta
                      ? "bg-alert-bg text-alert"
                      : "bg-sage text-brand-dark"
                  }`}
                >
                  {s.alerta ? "Resolver" : "Detalhes"}
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card
            title="Aguardando retirada"
            subtitle={`${aguardando.length} pedidos reservados`}
            actions={
              <Link
                href="/painel/pedidos"
                className="text-[12px] font-bold text-brand-dark underline"
              >
                Ver pedidos
              </Link>
            }
          >
            <div className="flex flex-col divide-y divide-sage-line/60">
              {aguardando.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="text-lg">{p.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-bold">
                      {p.codigo} · {p.cliente}
                    </div>
                    <div className="text-[11px] text-muted">
                      {p.nomeSacola} · {p.janela}
                    </div>
                  </div>
                  <StatusBadge tone="blue">{p.qtd}x</StatusBadge>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Vendas na semana" subtitle="sacolas vendidas por dia">
            <BarChart data={vendasSemana} height={120} />
          </Card>
        </div>
      </div>
    </>
  );
}
