import Link from "next/link";
import { BottomNav } from "@/components/ui/bottom-nav";
import { brl } from "@/lib/format";
import { navConsumidor } from "@/lib/nav";
import { getMeusPedidos, type PedidoStatus } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

const statusLabel: Record<PedidoStatus, { texto: string; cor: string }> = {
  reservado: { texto: "Reservado", cor: "bg-[#E5EEF8] text-[#1D5A96]" },
  retirado: { texto: "Retirado", cor: "bg-sage text-brand-dark" },
  nao_retirado: { texto: "Não retirado", cor: "bg-alert-bg text-alert" },
  cancelado: { texto: "Cancelado", cor: "bg-[#EFEDE6] text-muted" },
};

export default async function HistoricoPedidos() {
  const pedidos = await getMeusPedidos();

  return (
    <>
      <main className="flex-1">
        <div className="px-5 pb-3 pt-6">
          <h1 className="font-display text-[22px] font-semibold">
            Seus pedidos
          </h1>
          <p className="mt-1 text-xs text-muted">
            Acompanhe reservas ativas e peça de novo dos seus favoritos.
          </p>
        </div>

        {pedidos.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm leading-[1.5] text-muted">
            Você ainda não fez nenhuma reserva.
            <br />
            <Link href="/consumidor" className="font-bold text-brand-dark underline">
              Encontrar uma sacola
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-[13px] px-5 pb-6">
            {pedidos.map((p) => {
              const status = statusLabel[p.status];
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border-[1.5px] border-sage-line bg-white p-[13px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="blob-b flex h-[54px] w-[54px] shrink-0 items-center justify-center bg-sage text-[23px]">
                      {p.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display text-sm font-semibold">
                          {p.nomeSacola}
                        </span>
                        <span className="shrink-0 font-display text-sm font-bold">
                          {brl(p.total)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted">
                        {p.loja} · {p.janela}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`rounded-md px-2 py-1 text-[10.5px] font-bold ${status.cor}`}
                    >
                      {status.texto}
                    </span>
                    {p.status === "reservado" ? (
                      <Link
                        href={`/consumidor/pedido/${p.id}`}
                        className="rounded-full bg-sage px-3 py-1.5 text-[11px] font-bold text-brand-dark"
                      >
                        Ver código
                      </Link>
                    ) : (
                      <Link
                        href={`/consumidor/sacola/${p.bagId}`}
                        className="rounded-full bg-sage px-3 py-1.5 text-[11px] font-bold text-brand-dark"
                      >
                        Pedir novamente
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
