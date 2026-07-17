import Link from "next/link";
import { BarChart } from "@/components/desktop/bar-chart";
import { Card } from "@/components/desktop/card";
import { PageHeader } from "@/components/desktop/page-header";
import { StatCard } from "@/components/desktop/stat-card";
import { StatusBadge } from "@/components/desktop/status-badge";
import {
  getHeadlineKpis,
  getOpsFlags,
  getSalesByDay,
  getSecondaryKpis,
} from "@/lib/admin-mock-data";

export default function AdminOverview() {
  const headline = getHeadlineKpis();
  const secondary = getSecondaryKpis();
  const flags = getOpsFlags().filter((f) => f.severity !== "low");

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="How the GoodFood marketplace is performing across Porto Alegre. Seed data — wired to the shared data model."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {headline.map((kpi, i) => (
          <StatCard
            key={kpi.id}
            hero={i === 0}
            value={kpi.value}
            label={kpi.label}
            trend={kpi.trend}
            trendGood={kpi.trendGood}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {secondary.map((kpi) => (
          <StatCard
            key={kpi.id}
            value={kpi.value}
            label={kpi.label}
            trend={kpi.trend}
            trendGood={kpi.trendGood}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card
          title="Bags sold per day"
          subtitle="last 14 days · all businesses"
          actions={
            <Link
              href="/admin/sales"
              className="text-[12px] font-bold text-brand-dark underline"
            >
              Sales detail
            </Link>
          }
        >
          <BarChart data={getSalesByDay()} height={170} />
        </Card>

        <Card
          title="Needs attention"
          subtitle="operational flags"
          actions={
            <Link
              href="/admin/operations"
              className="text-[12px] font-bold text-brand-dark underline"
            >
              All flags
            </Link>
          }
        >
          <div className="flex flex-col divide-y divide-sage-line/60">
            {flags.map((f) => (
              <div key={f.title} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[12.5px] font-bold leading-[1.35]">
                    {f.title}
                  </span>
                  <StatusBadge tone={f.severity === "high" ? "red" : "amber"}>
                    {f.severity}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-[11.5px] leading-[1.45] text-muted">
                  {f.detail}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
