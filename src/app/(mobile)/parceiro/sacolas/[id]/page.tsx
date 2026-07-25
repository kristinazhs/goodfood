import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { brl } from "@/lib/format";
import { getListingDetalhe } from "@/lib/parceiro";
import { marcarNaoRetirada, marcarRetirada } from "@/lib/parceiro-actions";
import type { PedidoStatus } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

const statusInfo: Record<PedidoStatus, { texto: string; cor: string }> = {
  reservado: { texto: "Reservado", cor: "bg-[#E5EEF8] text-[#1D5A96]" },
  retirado: { texto: "Retirado", cor: "bg-sage text-brand-dark" },
  nao_retirado: { texto: "Não retirado", cor: "bg-alert-bg text-alert" },
  cancelado: { texto: "Cancelado", cor: "bg-[#EFEDE6] text-muted" },
};

export default async function ListingDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const l = await getListingDetalhe(id);
  if (!l) notFound();

  const pendentes = l.reservas.filter((r) => r.status === "reservado").length;

  return (
    <main className="flex-1 px-5 pb-8">
      <div className="flex items-center justify-between pb-1.5 pt-5">
        <BackButton href="/parceiro" />
        <h1 className="font-display text-lg font-semibold">Detalhes</h1>
        <span className="w-[38px]" />
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-[18px] border-[1.5px] border-sage-line bg-white p-3.5">
        <span className="blob-b flex h-[54px] w-[54px] shrink-0 items-center justify-center bg-sage text-[23px]">
          {l.emoji}
        </span>
        <div>
          <div className="font-display text-[15px] font-semibold">{l.nome}</div>
          <div className="mt-0.5 text-[11.5px] text-muted">
            Retirada {l.janela} · {l.quantidadeDisponivel} de {l.quantidadeTotal}{" "}
            ainda disponíveis
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 pb-2.5 pt-6">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
          Reservas
        </span>
        {pendentes > 0 && (
          <span className="text-[11.5px] font-semibold text-brand-dark">
            {pendentes} aguardando retirada
          </span>
        )}
      </div>

      {l.reservas.length === 0 ? (
        <div className="rounded-[14px] border-[1.5px] border-dashed border-sage-line px-5 py-10 text-center text-sm text-muted">
          Nenhuma reserva ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {l.reservas.map((r) => {
            const s = statusInfo[r.status];
            return (
              <div
                key={r.id}
                className="rounded-[16px] border-[1.5px] border-sage-line bg-white p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-[15px] font-bold tracking-[1px]">
                    {r.codigo}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-[10.5px] font-bold ${s.cor}`}
                  >
                    {s.texto}
                  </span>
                </div>
                <div className="mt-1 text-[11.5px] text-muted">
                  {r.qtd} {r.qtd > 1 ? "unidades" : "unidade"} · {brl(r.total)}
                </div>

                {r.status === "reservado" && (
                  <div className="mt-3 flex gap-2.5">
                    <form action={marcarRetirada} className="flex-1">
                      <input type="hidden" name="orderId" value={r.id} />
                      <input type="hidden" name="listingId" value={l.id} />
                      <button
                        type="submit"
                        className="w-full rounded-[12px] bg-brand py-2.5 text-[12.5px] font-bold text-white"
                      >
                        Confirmar retirada
                      </button>
                    </form>
                    <form action={marcarNaoRetirada}>
                      <input type="hidden" name="orderId" value={r.id} />
                      <input type="hidden" name="listingId" value={l.id} />
                      <button
                        type="submit"
                        className="rounded-[12px] border-[1.5px] border-sage-line px-3 py-2.5 text-[12.5px] font-bold text-muted"
                      >
                        Não veio
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
