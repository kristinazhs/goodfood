import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/desktop/card";
import { PageHeader } from "@/components/desktop/page-header";
import { StatCard } from "@/components/desktop/stat-card";
import { StatusBadge } from "@/components/desktop/status-badge";
import { getBusiness } from "@/lib/admin-mock-data";

export default async function AdminBusinessDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = getBusiness(id);
  if (!b) notFound();

  return (
    <>
      <div className="mb-4">
        <Link
          href="/admin/businesses"
          className="text-[12px] font-bold text-muted hover:text-brand-dark"
        >
          ← Back to businesses
        </Link>
      </div>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span aria-hidden>{b.emoji}</span>
            {b.name}
            <StatusBadge
              tone={
                b.status === "active"
                  ? "green"
                  : b.status === "pending"
                    ? "amber"
                    : "grey"
              }
            >
              {b.status}
            </StatusBadge>
          </span>
        }
        description={`${b.category.charAt(0).toUpperCase() + b.category.slice(1)} · ${b.neighborhood}, Porto Alegre · joined ${b.joinDate}`}
        actions={
          b.status === "pending" ? (
            <>
              <button className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-bold text-white">
                Approve business
              </button>
              <button className="rounded-full border-[1.5px] border-sage-line bg-white px-5 py-2.5 text-[13px] font-bold text-muted hover:border-alert hover:text-alert">
                Reject
              </button>
            </>
          ) : (
            <button className="rounded-full border-[1.5px] border-sage-line bg-white px-5 py-2.5 text-[13px] font-bold text-muted hover:border-alert hover:text-alert">
              Suspend
            </button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard hero value={`R$ ${b.totalSales.toLocaleString("en-US")}`} label="total sales" />
        <StatCard value={String(b.activeListings)} label="active listings" />
        <StatCard
          value={b.status === "active" ? `${b.noShowRate.toFixed(1)}%` : "—"}
          label="no-show rate"
          trend={b.noShowRate > 10 ? "above 10% threshold" : undefined}
          trendGood={false}
        />
        <StatCard
          value={b.rating > 0 ? `${b.rating.toFixed(1)} ★` : "—"}
          label="average rating"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Account">
          <div className="flex flex-col divide-y divide-sage-line/60 text-[12.5px]">
            {[
              ["Owner login", "Same credentials as the mobile app"],
              ["Category", b.category],
              ["Neighborhood", b.neighborhood],
              ["Join date", b.joinDate],
              ["Payment mode", "Pay at pickup (no online payout yet)"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5">
                <span className="font-bold">{k}</span>
                <span className="capitalize text-muted">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Notes" subtitle="visible to the internal team only">
          <p className="text-[12.5px] leading-[1.55] text-muted">
            {b.status === "pending"
              ? "Documents submitted and complete. Awaiting first approval review."
              : b.noShowRate > 10
                ? "No-show rate above the 10% threshold — flagged in Operations. Consider suggesting shorter pickup windows."
                : "No open flags for this business."}
          </p>
        </Card>
      </div>
    </>
  );
}
