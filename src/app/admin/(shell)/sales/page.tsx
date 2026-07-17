import { BarChart } from "@/components/desktop/bar-chart";
import { BarList } from "@/components/desktop/bar-list";
import { Card } from "@/components/desktop/card";
import { Chips } from "@/components/desktop/chips";
import { PageHeader } from "@/components/desktop/page-header";
import { StatCard } from "@/components/desktop/stat-card";
import {
  getSalesByCategory,
  getSalesByDay,
  getSalesByNeighborhood,
} from "@/lib/admin-mock-data";

function fmtBrl(v: number) {
  return `R$ ${v.toLocaleString("en-US")}`;
}

export default function AdminSales() {
  const byNeighborhood = getSalesByNeighborhood();
  const byCategory = getSalesByCategory();

  return (
    <>
      <PageHeader
        title="Sales"
        description="GMV and bags sold across the platform. Aggregated from the same order data businesses see in their own reports."
        actions={<Chips options={["7 days", "30 days", "90 days", "Custom"]} defaultActive="30 days" />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard hero value="R$ 48,230" label="GMV · last 30 days" trend="+14% vs. prev. period" />
        <StatCard value="2,147" label="bags sold" trend="+11% vs. prev. period" />
        <StatCard value="R$ 22.46" label="average order value" trend="+R$ 0.90" />
        <StatCard value="R$ 1,608" label="GMV per day (avg)" trend="+9%" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Bags sold per day" subtitle="last 14 days" className="xl:col-span-2">
          <BarChart data={getSalesByDay()} height={170} />
        </Card>

        <Card title="GMV by neighborhood" subtitle="last 30 days">
          <BarList
            data={byNeighborhood.map((n) => ({
              label: n.label,
              value: n.gmv,
              display: fmtBrl(n.gmv),
            }))}
          />
        </Card>

        <Card title="GMV by business category" subtitle="last 30 days">
          <BarList
            data={byCategory.map((c) => ({
              label: c.label,
              value: c.gmv,
              display: `${fmtBrl(c.gmv)} · ${c.bags} bags`,
            }))}
          />
          <p className="mt-4 text-[11.5px] leading-[1.5] text-muted">
            Padarias drive {Math.round((byCategory[0].gmv / byCategory.reduce((a, c) => a + c.gmv, 0)) * 100)}%
            of GMV — evening pickup windows (18h–20h) remain the strongest slot
            platform-wide.
          </p>
        </Card>
      </div>
    </>
  );
}
