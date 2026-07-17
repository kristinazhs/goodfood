import Link from "next/link";
import { Chips } from "@/components/desktop/chips";
import { DataTable, type Column } from "@/components/desktop/data-table";
import { PageHeader } from "@/components/desktop/page-header";
import { StatusBadge } from "@/components/desktop/status-badge";
import { adminBusinesses, type AdminBusiness } from "@/lib/admin-mock-data";

function statusBadge(b: AdminBusiness) {
  if (b.status === "active") return <StatusBadge tone="green">Active</StatusBadge>;
  if (b.status === "pending") return <StatusBadge tone="amber">Pending</StatusBadge>;
  return <StatusBadge tone="grey">Inactive</StatusBadge>;
}

const columns: Column<AdminBusiness>[] = [
  {
    key: "name",
    header: "Business",
    render: (b) => (
      <Link
        href={`/admin/businesses/${b.id}`}
        className="flex items-center gap-2.5 font-display text-[13.5px] font-semibold hover:text-brand-dark hover:underline"
      >
        <span aria-hidden>{b.emoji}</span>
        {b.name}
      </Link>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (b) => <span className="capitalize text-muted">{b.category}</span>,
  },
  {
    key: "neighborhood",
    header: "Neighborhood",
    render: (b) => <span className="text-muted">{b.neighborhood}</span>,
  },
  {
    key: "joined",
    header: "Joined",
    render: (b) => <span className="text-muted">{b.joinDate}</span>,
  },
  {
    key: "sales",
    header: "Total sales",
    align: "right",
    render: (b) => <b>R$ {b.totalSales.toLocaleString("en-US")}</b>,
  },
  {
    key: "listings",
    header: "Active listings",
    align: "center",
    render: (b) => b.activeListings,
  },
  {
    key: "noshow",
    header: "No-show",
    align: "right",
    render: (b) =>
      b.status === "active" ? (
        <span className={b.noShowRate > 10 ? "font-bold text-alert" : ""}>
          {b.noShowRate.toFixed(1)}%
        </span>
      ) : (
        <span className="text-muted">—</span>
      ),
  },
  {
    key: "status",
    header: "Status",
    render: (b) => statusBadge(b),
  },
  {
    key: "actions",
    header: "Actions",
    align: "right",
    render: (b) => (
      <div className="flex justify-end gap-1.5">
        <Link
          href={`/admin/businesses/${b.id}`}
          className="rounded-full bg-sage px-3 py-1.5 text-[11px] font-bold text-brand-dark"
        >
          View
        </Link>
        {b.status === "pending" ? (
          <button className="rounded-full bg-brand px-3 py-1.5 text-[11px] font-bold text-white">
            Approve
          </button>
        ) : (
          <button className="rounded-full border-[1.5px] border-sage-line bg-white px-3 py-1.5 text-[11px] font-bold text-muted hover:border-alert hover:text-alert">
            Suspend
          </button>
        )}
      </div>
    ),
  },
];

export default function AdminBusinesses() {
  return (
    <>
      <PageHeader
        title="Businesses"
        description="Every partner on the platform — approval, status and performance at a glance."
      />

      <div className="mb-4">
        <Chips options={["All", "Active", "Pending approval", "Inactive"]} />
      </div>

      <DataTable
        columns={columns}
        rows={adminBusinesses}
        rowKey={(b) => b.id}
        footer={`${adminBusinesses.length} businesses · sorting and filters are illustrative in the prototype`}
      />
    </>
  );
}
