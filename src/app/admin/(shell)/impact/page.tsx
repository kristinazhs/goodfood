import { BarChart } from "@/components/desktop/bar-chart";
import { Card } from "@/components/desktop/card";
import { PageHeader } from "@/components/desktop/page-header";
import { StatCard } from "@/components/desktop/stat-card";
import { getImpactByMonth, getImpactStats } from "@/lib/admin-mock-data";

export default function AdminImpact() {
  const impact = getImpactStats();

  return (
    <>
      <PageHeader
        title="Impact"
        description="Sustainability numbers for reporting and marketing — aggregated from real order data since launch (March 2026)."
        actions={
          <button className="rounded-full border-[1.5px] border-sage-line bg-white px-5 py-2.5 text-[13px] font-bold text-muted hover:border-brand hover:text-brand-dark">
            ⬇ Export report
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          hero
          value={`${(impact.foodRescuedKg / 1000).toFixed(1)}t`}
          label="food rescued from waste"
          trend="+40% month over month"
        />
        <StatCard
          value={`${(impact.co2AvoidedKg / 1000).toFixed(1)}t`}
          label="CO₂-equivalent avoided"
          trend="≈ 2.4 kg CO₂ per kg of food"
        />
        <StatCard
          value={`R$ ${impact.consumerSavings.toLocaleString("en-US")}`}
          label="saved by consumers"
          trend="vs. original prices"
        />
        <StatCard
          value={impact.bagsRescued.toLocaleString("en-US")}
          label="bags rescued"
          trend={`≈ ${impact.mealsEquivalent.toLocaleString("en-US")} meals`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Food rescued per month" subtitle="kg · since launch">
          <BarChart data={getImpactByMonth()} height={170} />
        </Card>

        <Card title="How these numbers are built">
          <ul className="flex flex-col gap-3 text-[12px] leading-[1.55] text-muted">
            <li>
              🛍️ <b className="text-charcoal">Food rescued</b> — sum of picked-up
              bags × average bag weight per category.
            </li>
            <li>
              🌍 <b className="text-charcoal">CO₂ avoided</b> — 2.4 kg CO₂-eq per
              kg of food (FAO reference factor).
            </li>
            <li>
              💰 <b className="text-charcoal">Consumer savings</b> — original
              value minus price paid, summed over picked-up orders.
            </li>
            <li>
              📐 Same aggregation the businesses see in their own reports — the
              numbers always match.
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
