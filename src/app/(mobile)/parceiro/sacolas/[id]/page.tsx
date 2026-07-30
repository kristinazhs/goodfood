import Link from "next/link";
import { notFound } from "next/navigation";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import { ApagarSacola } from "@/components/parceiro/apagar-sacola";
import { BackButton } from "@/components/ui/back-button";
import { brl } from "@/lib/format";
import { getListingDetalhe } from "@/lib/parceiro";
import { marcarNaoRetirada, marcarRetirada } from "@/lib/parceiro-actions";
import type { PedidoStatus } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

// I — one published sacola and who is holding it.
//
// Restyled to match the rest of the partner side: the same 18px cards, sage
// borders and uppercase section headers as Hoje and Loja. It was the one
// screen still wearing the pre-redesign look.

const statusInfo: Record<PedidoStatus, { texto: string; cor: string }> = {
  reservado: { texto: "Reservado", cor: "bg-[#E5EEF8] text-[#1D5A96]" },
  retirado: { texto: "Retirado", cor: "bg-sage text-brand-dark" },
  nao_retirado: { texto: "Não retirado", cor: "bg-alert-bg text-alert" },
  cancelado: { texto: "Cancelado", cor: "bg-[#EFEDE6] text-muted" },
};

export default async function ListingDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const [{ id }, { erro }] = await Promise.all([params, searchParams]);
  const l = await getListingDetalhe(id);
  if (!l) notFound();

  const pendentes = l.reservas.filter((r) => r.status === "reservado").length;
  const reservadas = l.quantidadeTotal - l.quantidadeDisponivel;
  // Any order row at all, including cancelled ones: the database refuses to
  // delete a listing while anything still points at it (ON DELETE RESTRICT).
  const temReservas = l.reservas.length > 0;

  return (
    <main className="flex-1 pb-8">
      <div className="flex items-center justify-between px-5 pb-1.5 pt-5">
        <BackButton href="/parceiro" />
        <h1 className="font-display text-lg font-semibold">Sacola publicada</h1>
        <span className="w-[38px]" />
      </div>

      {erro && (
        <p className="mx-5 mt-4 rounded-xl bg-alert-bg px-3.5 py-3 text-[13px] font-semibold text-alert">
          Não foi possível concluir. Tente novamente.
        </p>
      )}

      <div className="mx-5 mt-4 rounded-[18px] border-[1.5px] border-sage-line bg-white p-[13px]">
        <div className="flex gap-[13px]">
          <FotoSacola size={72} radius={14} legenda={"foto\nsacola"} alt="" />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="truncate font-display text-base font-semibold leading-[1.3]">
              {l.nome}
            </div>
            <div className="mt-0.5 text-[12.5px] font-medium leading-[1.35] text-muted">
              Retirada {l.janela}
            </div>
            <div className="mt-auto flex items-center gap-[7px] pt-[9px]">
              <span className="inline-flex h-[26px] items-center whitespace-nowrap rounded-lg bg-sage px-[9px] text-xs font-bold leading-none text-brand-dark">
                {l.quantidadeDisponivel} de {l.quantidadeTotal} ainda à venda
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2.5">
          <div className="flex-1 rounded-[14px] bg-[#f7f5ef] p-3">
            <div className="text-xs font-bold uppercase leading-none tracking-[0.5px] text-muted">
              Reservadas
            </div>
            <div className="mt-1.5 font-display text-[17px] font-bold leading-none text-brand-dark">
              {reservadas}
            </div>
          </div>
          <div className="flex-1 rounded-[14px] bg-[#f7f5ef] p-3">
            <div className="text-xs font-bold uppercase leading-none tracking-[0.5px] text-muted">
              Aguardando
            </div>
            <div className="mt-1.5 font-display text-[17px] font-bold leading-none text-brand-dark">
              {pendentes}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-2.5 pt-6">
        <span className="text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
          Reservas
        </span>
        {pendentes > 0 && (
          <span className="text-[12.5px] font-semibold leading-none text-muted">
            {pendentes} aguardando retirada
          </span>
        )}
      </div>

      {l.reservas.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm leading-[1.5] text-muted">
          Nenhuma reserva ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5 px-5">
          {l.reservas.map((r) => {
            const s = statusInfo[r.status];
            return (
              <div
                key={r.id}
                className="rounded-2xl border-[1.5px] border-sage-line bg-white p-[13px]"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <span className="font-display text-[15px] font-bold tracking-[0.5px]">
                    {r.codigo}
                  </span>
                  <span
                    className={`inline-flex h-6 shrink-0 items-center rounded-[7px] px-2 text-[11px] font-bold leading-none ${s.cor}`}
                  >
                    {s.texto}
                  </span>
                </div>
                <div className="mt-1 text-[12.5px] font-medium leading-[1.35] text-muted">
                  {r.qtd} {r.qtd > 1 ? "unidades" : "unidade"} · {brl(r.total)}
                </div>

                {r.status === "reservado" && (
                  <div className="mt-3 flex gap-2.5">
                    <form action={marcarRetirada} className="flex-1">
                      <input type="hidden" name="orderId" value={r.id} />
                      <input type="hidden" name="listingId" value={l.id} />
                      <button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-brand text-[13.5px] font-bold text-white transition-transform active:scale-[0.98]"
                      >
                        Confirmar retirada
                      </button>
                    </form>
                    <form action={marcarNaoRetirada}>
                      <input type="hidden" name="orderId" value={r.id} />
                      <input type="hidden" name="listingId" value={l.id} />
                      <button
                        type="submit"
                        className="h-11 rounded-xl border-[1.5px] border-sage-line bg-white px-3.5 text-[13.5px] font-bold text-muted"
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

      <div className="px-5 pb-2.5 pt-6 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
        Gerenciar
      </div>

      <div className="flex flex-col gap-2.5 px-5">
        <Link
          href={`/parceiro/sacolas/nova?modelo=${l.bagId}`}
          className="flex min-h-11 items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold leading-[1.3]">
              Editar o modelo
            </span>
            <span className="mt-0.5 block text-[12.5px] font-medium leading-[1.35] text-muted">
              Nome, preço, conteúdo e foto — vale para as próximas publicações
            </span>
          </span>
          <span className="shrink-0 text-base font-bold leading-none text-[#8d8d84]">
            ›
          </span>
        </Link>

        <ApagarSacola listingId={l.id} temReservas={temReservas} />
      </div>
    </main>
  );
}
