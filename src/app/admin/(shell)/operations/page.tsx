import { PageHeader } from "@/components/desktop/page-header";
import { StatCard } from "@/components/desktop/stat-card";
import { StatusBadge } from "@/components/desktop/status-badge";
import { getOpsFlags, type OpsFlag } from "@/lib/admin-mock-data";

const severityTone = {
  high: "red",
  medium: "amber",
  low: "grey",
} as const;

function FlagRow({ flag }: { flag: OpsFlag }) {
  return (
    <div className="flex items-start gap-4 rounded-[18px] border-[1.5px] border-sage-line bg-white p-5">
      <StatusBadge tone={severityTone[flag.severity]}>
        {flag.severity}
      </StatusBadge>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[13.5px] font-bold">{flag.title}</span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.5px] text-muted">
            {flag.area}
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-[1.5] text-muted">
          {flag.detail}
        </p>
      </div>
      <button className="shrink-0 rounded-full bg-sage px-3.5 py-1.5 text-[11px] font-bold text-brand-dark">
        Review
      </button>
    </div>
  );
}

export default function AdminOperations() {
  const flags = getOpsFlags();
  const high = flags.filter((f) => f.severity === "high").length;
  const medium = flags.filter((f) => f.severity === "medium").length;
  const low = flags.filter((f) => f.severity === "low").length;

  return (
    <>
      <PageHeader
        title="Operations"
        description="Health of the marketplace — no-shows, stuck listings, payment issues and the moderation queue."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          hero
          value={String(flags.length)}
          label="open flags"
          trend={`${high} high priority`}
          trendGood={high === 0}
        />
        <StatCard value={String(high)} label="high · act today" />
        <StatCard value={String(medium)} label="medium · this week" />
        <StatCard value={String(low)} label="low · monitor" />
      </div>

      <div className="mt-6 flex flex-col gap-3.5">
        {flags.map((f) => (
          <FlagRow key={f.title} flag={f} />
        ))}
      </div>
    </>
  );
}
