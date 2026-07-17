import Link from "next/link";
import { Chips } from "@/components/desktop/chips";
import { DataTable, type Column } from "@/components/desktop/data-table";
import { PageHeader } from "@/components/desktop/page-header";
import { PlaqueCounts } from "@/components/painel/plaque-counts";
import { brl } from "@/lib/format";
import { sacolasLoja } from "@/lib/mock-data";
import type { SacolaLoja } from "@/lib/types";

const columns: Column<SacolaLoja>[] = [
  {
    key: "sacola",
    header: "Sacola",
    render: (s) => (
      <div className="flex items-center gap-3">
        <span
          className="blob-b flex h-9 w-9 shrink-0 items-center justify-center text-base"
          style={{ background: s.corThumb }}
        >
          {s.emoji}
        </span>
        <span className="font-display text-[13.5px] font-semibold">
          {s.nome}
        </span>
      </div>
    ),
  },
  {
    key: "preco",
    header: "Preço",
    align: "right",
    render: (s) => <b>{brl(s.preco)}</b>,
  },
  {
    key: "retirada",
    header: "Janela de retirada",
    render: (s) => <span className="text-muted">{s.retiradaLabel}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (s) => <PlaqueCounts sacola={s} />,
  },
  {
    key: "receita",
    header: "Receita",
    align: "right",
    render: (s) => <b className="text-brand-dark">{brl(s.receita)}</b>,
  },
  {
    key: "acoes",
    header: "Ações",
    align: "right",
    render: (s) => (
      <div className="flex justify-end gap-1.5">
        <Link
          href={`/painel/sacolas/${s.id}/editar`}
          className="rounded-full bg-sage px-3 py-1.5 text-[11px] font-bold text-brand-dark"
        >
          Editar
        </Link>
        <button className="rounded-full border-[1.5px] border-sage-line bg-white px-3 py-1.5 text-[11px] font-bold text-muted hover:border-brand hover:text-brand-dark">
          Duplicar
        </button>
        <button className="rounded-full border-[1.5px] border-sage-line bg-white px-3 py-1.5 text-[11px] font-bold text-muted hover:border-alert hover:text-alert">
          Desativar
        </button>
      </div>
    ),
  },
];

export default function PainelSacolas() {
  return (
    <>
      <PageHeader
        title="Minhas sacolas"
        description="Todas as suas ofertas — ativas, agendadas, encerradas e esgotadas."
        actions={
          <Link
            href="/painel/sacolas/nova"
            className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-bold text-white"
          >
            + Nova sacola
          </Link>
        }
      />

      <div className="mb-4">
        <Chips
          options={["Todas", "Ativas", "Agendadas", "Encerradas", "Esgotadas"]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={sacolasLoja}
        rowKey={(s) => s.id}
        footer="5 sacolas · dados de hoje · filtros e ordenação ilustrativos no protótipo"
      />
    </>
  );
}
