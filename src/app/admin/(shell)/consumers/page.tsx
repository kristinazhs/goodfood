import { BarList } from "@/components/desktop/bar-list";
import { Card } from "@/components/desktop/card";
import { LineChart } from "@/components/desktop/line-chart";
import { PageHeader } from "@/components/desktop/page-header";
import { StatCard } from "@/components/desktop/stat-card";
import {
  getConsumerSegments,
  getConsumerStats,
  getSignupsByWeek,
} from "@/lib/admin-mock-data";

export default function AdminConsumers() {
  const stats = getConsumerStats();
  const segments = getConsumerSegments();

  return (
    <>
      <PageHeader
        title="Consumers"
        description="Who is buying surprise bags — growth, retention and segments."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard hero value={stats.total.toLocaleString("en-US")} label="total signups" trend="+171 last week" />
        <StatCard value={stats.active30d.toLocaleString("en-US")} label="active (30d)" trend="+9% vs. prev. 30d" />
        <StatCard value={stats.churned.toLocaleString("en-US")} label="churned (no order in 60d)" trend="24% of base" trendGood={false} />
        <StatCard value={String(stats.ordersPerUser)} label="orders per active user" trend="+0.3 vs. prev. 30d" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Signups per week" subtitle="last 8 weeks" className="xl:col-span-2">
          <LineChart data={getSignupsByWeek()} />
        </Card>

        <Card title="Segments" subtitle="based on purchase behavior">
          <BarList
            data={segments.map((s) => ({
              label: s.name,
              value: s.share,
              display: `${s.share}%`,
            }))}
          />
          <div className="mt-4 flex flex-col gap-2">
            {segments.map((s) => (
              <p key={s.name} className="text-[11.5px] leading-[1.5] text-muted">
                <b className="text-charcoal">{s.name}:</b> {s.description}
              </p>
            ))}
          </div>
        </Card>

        <Card title="Top neighborhoods" subtitle="by orders placed · last 30 days">
          <BarList
            data={[
              { label: "Bom Fim", value: 31, display: "31%" },
              { label: "Cidade Baixa", value: 22, display: "22%" },
              { label: "Moinhos de Vento", value: 17, display: "17%" },
              { label: "Centro Histórico", value: 14, display: "14%" },
              { label: "Other", value: 16, display: "16%" },
            ]}
          />
          <p className="mt-4 text-[11.5px] leading-[1.5] text-muted">
            Orders cluster around university-adjacent neighborhoods — consistent
            with the Saver segment being the largest.
          </p>
        </Card>
      </div>
    </>
  );
}
