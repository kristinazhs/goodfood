import { Chips } from "@/components/desktop/chips";
import { DataTable, type Column } from "@/components/desktop/data-table";
import { PageHeader } from "@/components/desktop/page-header";
import { StatusBadge } from "@/components/desktop/status-badge";
import { brl } from "@/lib/format";
import { pedidosLoja } from "@/lib/mock-data";
import type { PedidoLoja } from "@/lib/types";

function statusBadge(p: PedidoLoja) {
  if (p.status === "reservado") return <StatusBadge tone="blue">Reservado</StatusBadge>;
  if (p.status === "retirado") return <StatusBadge tone="green">Retirado</StatusBadge>;
  return <StatusBadge tone="red">Não retirado</StatusBadge>;
}

const columns: Column<PedidoLoja>[] = [
  {
    key: "codigo",
    header: "Pedido",
    render: (p) => <b>{p.codigo}</b>,
  },
  {
    key: "cliente",
    header: "Cliente",
    render: (p) => p.cliente,
  },
  {
    key: "sacola",
    header: "Sacola",
    render: (p) => (
      <span className="flex items-center gap-2">
        <span aria-hidden>{p.emoji}</span>
        {p.nomeSacola}
      </span>
    ),
  },
  {
    key: "data",
    header: "Data",
    render: (p) => <span className="text-muted">{p.data}</span>,
  },
  {
    key: "janela",
    header: "Janela",
    render: (p) => <span className="text-muted">{p.janela}</span>,
  },
  {
    key: "qtd",
    header: "Qtd",
    align: "center",
    render: (p) => p.qtd,
  },
  {
    key: "total",
    header: "Total",
    align: "right",
    render: (p) => <b>{brl(p.total)}</b>,
  },
  {
    key: "status",
    header: "Status",
    render: (p) => statusBadge(p),
  },
  {
    key: "acoes",
    header: "Ações",
    align: "right",
    render: (p) =>
      p.status === "reservado" ? (
        <div className="flex justify-end gap-1.5">
          <button className="whitespace-nowrap rounded-full bg-sage px-3 py-1.5 text-[11px] font-bold text-brand-dark">
            ✓ Retirada
          </button>
          <button className="whitespace-nowrap rounded-full border-[1.5px] border-sage-line bg-white px-3 py-1.5 text-[11px] font-bold text-muted hover:border-alert hover:text-alert">
            No-show
          </button>
        </div>
      ) : (
        <span className="text-[11px] text-muted">—</span>
      ),
  },
];

export default function PainelPedidos() {
  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Reservas recebidas — marque a retirada quando o cliente pagar no balcão."
        actions={
          <button className="rounded-full border-[1.5px] border-sage-line bg-white px-5 py-2.5 text-[13px] font-bold text-muted hover:border-brand hover:text-brand-dark">
            ⬇ Exportar CSV
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Chips options={["Hoje", "7 dias", "30 dias", "Todos"]} />
        <span className="text-sage-line">|</span>
        <Chips
          options={["Todos os status", "Reservados", "Retirados", "Não retirados"]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={pedidosLoja}
        rowKey={(p) => p.id}
        footer={`${pedidosLoja.length} pedidos · exportação e filtros ilustrativos no protótipo`}
      />
    </>
  );
}
