import Link from "next/link";
import { notFound } from "next/navigation";
import { brl } from "@/lib/format";
import { getPedidoDetalhe } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

const qrMatrix = [
  "111011101",
  "101001011",
  "111010110",
  "000111001",
  "110100111",
  "011001010",
  "111010011",
  "101001110",
  "111011010",
];

function QrPlaceholder() {
  return (
    <svg viewBox="0 0 9 9" className="h-[120px] w-[120px]" aria-hidden>
      {qrMatrix.flatMap((row, y) =>
        row.split("").map((cel, x) =>
          cel === "1" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="0.92" height="0.92" fill="#23231F" />
          ) : null,
        ),
      )}
    </svg>
  );
}

export default async function PedidoConfirmacao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await getPedidoDetalhe(id);
  if (!pedido) notFound();

  return (
    <main className="flex-1 px-5 pb-8">
      <div className="pt-8 text-center">
        <span className="blob-a mx-auto flex h-[64px] w-[64px] items-center justify-center bg-sage text-[28px]">
          ✅
        </span>
        <h1 className="mt-3.5 font-display text-[22px] font-bold">
          Pedido confirmado!
        </h1>
        <p className="mt-1.5 text-[13px] text-muted">
          {pedido.loja} · Retirada entre {pedido.janela}
        </p>
      </div>

      <div className="mt-6 rounded-[18px] border-[1.5px] border-sage-line bg-white p-5 text-center">
        <div className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
          Código de retirada
        </div>
        <div className="mt-1.5 font-display text-[30px] font-bold tracking-[2px]">
          {pedido.codigo}
        </div>
        <div className="mt-3 flex justify-center">
          <QrPlaceholder />
        </div>
        <div className="mt-3 text-xs text-muted">
          Mostre este código no balcão ao retirar sua sacola.
        </div>
      </div>

      <div className="mt-4 flex items-center gap-[13px] rounded-2xl border-[1.5px] border-sage-line bg-white p-[11px]">
        <span
          className="blob-b flex h-[54px] w-[54px] shrink-0 items-center justify-center text-[23px]"
          style={{ background: pedido.corThumb }}
        >
          {pedido.emoji}
        </span>
        <div className="flex-1">
          <div className="font-display text-sm font-semibold">
            {pedido.nomeSacola}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">
            {pedido.qtd} {pedido.qtd > 1 ? "unidades" : "unidade"}
          </div>
        </div>
        <span className="font-display text-[15px] font-bold">
          {brl(pedido.total)}
        </span>
      </div>

      {pedido.endereco && (
        <div className="mt-4 flex items-start gap-3 rounded-[14px] border-[1.5px] border-sage-line bg-white p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-sage text-base">
            📍
          </span>
          <div className="flex-1">
            <div className="text-[13px] font-bold">{pedido.endereco}</div>
            <div className="mt-[3px] text-xs text-muted">{pedido.loja}</div>
          </div>
          <button className="rounded-full bg-sage px-3 py-[7px] text-[11.5px] font-bold text-brand-dark">
            Como chegar
          </button>
        </div>
      )}

      <div className="mt-3 flex items-start gap-[9px] rounded-[14px] bg-sage px-[13px] py-3 text-[11.5px] leading-[1.5] text-brand-dark">
        💳{" "}
        <span>
          <b>{brl(pedido.total)}</b> serão cobrados na retirada, ou ao final da
          janela caso não compareça. Cancelamento grátis até 17h00.
        </span>
      </div>

      <button className="mt-3 w-full rounded-[14px] border-[1.5px] border-sage-line bg-white p-[13px] text-[13px] font-bold">
        🤝 Pedir para um amigo retirar
      </button>

      <Link
        href="/consumidor/pedidos"
        className="mt-2.5 block w-full rounded-[14px] bg-brand p-3.5 text-center text-sm font-bold text-white"
      >
        Ver meus pedidos
      </Link>
    </main>
  );
}
