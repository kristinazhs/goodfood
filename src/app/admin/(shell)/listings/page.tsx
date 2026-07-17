import { DataTable, type Column } from "@/components/desktop/data-table";
import { PageHeader } from "@/components/desktop/page-header";
import { StatCard } from "@/components/desktop/stat-card";
import { StatusBadge } from "@/components/desktop/status-badge";
import { getListingsStats } from "@/lib/admin-mock-data";
import { brl } from "@/lib/format";
import { sacolas } from "@/lib/mock-data";
import type { Sacola } from "@/lib/types";

const columns: Column<Sacola>[] = [
  {
    key: "listing",
    header: "Listing",
    render: (s) => (
      <span className="flex items-center gap-2.5 font-display text-[13.5px] font-semibold">
        <span aria-hidden>{s.emoji}</span>
        {s.nome}
      </span>
    ),
  },
  {
    key: "business",
    header: "Business",
    render: (s) => <span className="text-muted">{s.loja}</span>,
  },
  {
    key: "category",
    header: "Category",
    render: (s) => <span className="capitalize text-muted">{s.categoria}</span>,
  },
  {
    key: "price",
    header: "Price",
    align: "right",
    render: (s) => (
      <span>
        <b>{brl(s.preco)}</b>{" "}
        <span className="text-[11px] text-muted line-through">
          {brl(s.precoOriginal)}
        </span>
      </span>
    ),
  },
  {
    key: "window",
    header: "Pickup window",
    render: (s) => <span className="text-muted">{s.janela}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (s) => (
      <StatusBadge tone={s.destaque ? "amber" : "green"}>
        {s.destaque ? "Last unit" : "Active"}
      </StatusBadge>
    ),
  },
];

export default function AdminListings() {
  const stats = getListingsStats();

  return (
    <>
      <PageHeader
        title="Listings"
        description="Live view of sacolas across the platform right now."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard hero value={String(stats.activeNow)} label="active right now" />
        <StatCard value={String(stats.reservedNow)} label="units reserved now" />
        <StatCard value={`${stats.fillRate}%`} label="fill rate (sold vs. offered, 30d)" trend="+4pp vs. prev. 30d" />
        <StatCard value={String(stats.expiredUnsold7d)} label="expired unsold (7d)" trend="-2 vs. prev. week" />
        <StatCard value={`${stats.avgDiscount}%`} label="average discount" />
      </div>

      <div className="mt-6">
        <div className="mb-3">
          <h2 className="font-display text-[15.5px] font-semibold">
            Active now — sample
          </h2>
          <p className="mt-0.5 text-[11px] text-muted">
            what consumers currently see in the app
          </p>
        </div>
        <DataTable
          columns={columns}
          rows={sacolas}
          rowKey={(s) => s.id}
          footer="Sample of 4 of 37 active listings · full live feed comes with the DB wiring"
        />
      </div>
    </>
  );
}
