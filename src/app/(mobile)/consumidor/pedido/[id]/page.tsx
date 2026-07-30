import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/ui/bottom-nav";
import { CompartilharPedido } from "@/components/consumidor/compartilhar-pedido";
import { contagemRetirada, horaMinutoSP } from "@/lib/datas";
import { minutosAPe } from "@/lib/distancia";
import { getOrigem } from "@/lib/enderecos";
import { brl } from "@/lib/format";
import { navConsumidor } from "@/lib/nav";
import { CancelarPedido } from "@/components/consumidor/cancelar-pedido";
import { getPedidoDetalhe } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

// C5 — celebrate first, then become the pickup screen in the same scroll.
// The praise doesn't cost an extra tap or a throwaway screen.

const JANELA_CANCELAMENTO_MIN = 15;

const NOME_METODO: Record<string, string> = {
  cartao: "Cartão de crédito",
  pix: "Pix",
};

export default async function PedidoConfirmacao({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const [{ id }, { erro }] = await Promise.all([params, searchParams]);
  const pedido = await getPedidoDetalhe(id);
  if (!pedido) notFound();

  const contagem = contagemRetirada(pedido.janelaInicio, pedido.janelaFim);
  const origem = await getOrigem();
  const minutos = minutosAPe(pedido.lat, pedido.lng, origem);
  const pagoAs = horaMinutoSP(pedido.reservadoEm);

  // Free cancellation runs for 15 minutes from the reservation.
  const limite =
    new Date(pedido.reservadoEm).getTime() + JANELA_CANCELAMENTO_MIN * 60_000;
  const podeCancelar = pedido.status === "reservado" && Date.now() < limite;
  const horaLimite = horaMinutoSP(new Date(limite).toISOString());

  const rota = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${pedido.endereco || pedido.loja}, Porto Alegre`,
  )}`;

  return (
    <>
      <main className="flex-1 pb-6">
        <div className="px-5 pt-6 text-center">
          <h1 className="font-display text-[23px] font-bold leading-[1.2]">
            Pedido confirmado!
          </h1>
          <p className="mt-1.5 text-[13px] font-medium leading-[1.45] text-muted">
            Retire hoje entre {pedido.janela}
            {contagem ? ` · ${contagem}` : ""}
          </p>
          <p className="mt-0.5 text-[12.5px] font-medium leading-[1.4] text-muted">
            {pedido.loja} · {pedido.endereco}
          </p>
        </div>

        {erro && (
          <p className="mx-5 mt-4 rounded-xl bg-alert-bg px-3.5 py-3 text-[13px] font-semibold text-alert">
            Não foi possível cancelar. O prazo de 15 minutos pode ter passado.
          </p>
        )}

        {/* The code is read at a counter, in a hurry, in bad light. */}
        <div className="mx-5 mt-5 rounded-[20px] border-2 border-brand bg-white px-5 py-6 text-center">
          <div className="text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
            Mostre no balcão
          </div>
          <div className="mt-3 font-display text-[40px] font-bold leading-none tracking-[3px]">
            {pedido.codigo}
          </div>
          <p className="mt-3 text-[12.5px] font-medium leading-[1.4] text-muted">
            O balcão digita esse código para confirmar a retirada.
          </p>
        </div>

        <div className="mx-5 mt-3 flex items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white p-[13px]">
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-bold leading-[1.3]">
              {pedido.endereco}
            </div>
            {minutos != null && (
              <div className="mt-0.5 text-[12.5px] font-medium leading-[1.3] text-muted">
                {minutos} min a pé · aberto até {pedido.janela.split("–")[1]?.trim()}
              </div>
            )}
          </div>
          <a
            href={rota}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 shrink-0 items-center rounded-full border-[1.5px] border-sage-line bg-white px-3 text-[13px] font-bold text-brand-dark"
          >
            Rota
          </a>
        </div>

        {/* The money already left, so the screen says so rather than implying
            something is still owed at the counter. */}
        <div className="mx-5 mt-3 flex items-center justify-between gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white p-[13px]">
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold leading-[1.3]">
              Total pago
            </div>
            <div className="mt-0.5 truncate text-[12.5px] font-medium leading-[1.3] text-muted">
              {pedido.metodo ? NOME_METODO[pedido.metodo] : "Pagamento"} · hoje,{" "}
              {pagoAs}
            </div>
          </div>
          <span className="shrink-0 font-display text-lg font-bold">
            {brl(pedido.total)}
          </span>
        </div>

        {/* With payment at reservation, handing the pickup to someone else is
            the only path that still saves the money — so it leads. */}
        <CompartilharPedido
          codigo={pedido.codigo}
          nomeSacola={pedido.nomeSacola}
          loja={pedido.loja}
          endereco={pedido.endereco}
          janela={pedido.janela}
        />

        <div className="mx-5 mt-3">
          {podeCancelar ? (
            <CancelarPedido orderId={pedido.id} horaLimite={horaLimite} />
          ) : pedido.status === "reservado" ? (
            <p className="text-center text-[12.5px] font-medium leading-[1.4] text-muted">
              O prazo de cancelamento encerrou às {horaLimite}. Não vai
              conseguir ir? Passe a retirada para alguém.
            </p>
          ) : null}
        </div>

        <div className="px-5 pt-5 text-center">
          <Link
            href="/consumidor/pedidos"
            className="text-[13px] font-bold text-brand-dark"
          >
            Ver meus pedidos
          </Link>
        </div>
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
