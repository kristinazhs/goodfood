import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { brl } from "@/lib/format";
import { getSacolaPorId } from "@/lib/sacolas";

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<{ sacola?: string; qtd?: string }>;
}) {
  const { sacola: sacolaId, qtd: qtdParam } = await searchParams;
  const sacola = await getSacolaPorId(sacolaId ?? "");
  if (!sacola) notFound();
  const qtd = Math.max(1, Number(qtdParam) || 1);
  const total = sacola.preco * qtd;

  return (
    <>
      <main className="flex-1">
        <div className="flex items-center justify-between px-5 pb-1.5 pt-5">
          <BackButton href={`/consumidor/sacola/${sacola.id}`} />
          <h1 className="font-display text-lg font-semibold">Checkout</h1>
          <span className="w-[38px]" />
        </div>

        <div className="px-5">
          <div className="mb-2.5 mt-4 text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
            Seu pedido
          </div>
          <div className="flex items-center gap-[13px] rounded-2xl border-[1.5px] border-sage-line bg-white p-[11px]">
            <span
              className="blob-b flex h-[66px] w-[66px] shrink-0 items-center justify-center text-[27px]"
              style={{ background: sacola.corThumb }}
            >
              {sacola.emoji}
            </span>
            <div className="flex-1">
              <div className="font-display text-sm font-semibold">
                {sacola.nome}
              </div>
              <div className="mt-0.5 text-[11px] text-muted">{sacola.loja}</div>
              <div className="mt-2 flex items-end justify-between">
                <span className="rounded-md bg-sage px-[7px] py-[3px] text-[10px] font-bold text-brand-dark">
                  {qtd} {qtd > 1 ? "unidades" : "unidade"}
                </span>
                <span className="font-display text-[15px] font-bold">
                  {brl(total)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-2.5 mt-5 text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
            Horário de retirada
          </div>
          <div className="flex items-center gap-3 rounded-[14px] bg-sage px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] text-white">
              ⏰
            </span>
            <div>
              <b className="block text-[13.5px] font-extrabold text-brand-dark">
                Hoje, entre {sacola.janela}
              </b>
              <span className="text-[11.5px] text-muted">
                {sacola.endereco}
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-[14px] border-[1.5px] border-sage-line bg-white p-3.5">
            <div className="flex justify-between text-[13px] text-muted">
              <span>Subtotal</span>
              <span>{brl(total)}</span>
            </div>
            <div className="mt-1.5 flex justify-between text-[13px] text-muted">
              <span>Taxa de serviço</span>
              <span>R$ 0,00</span>
            </div>
            <div className="mt-2.5 flex justify-between border-t border-sage-line pt-2.5 text-sm font-bold">
              <span>Total na retirada</span>
              <span className="font-display">{brl(total)}</span>
            </div>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 z-10 border-t border-sage-line bg-white px-5 pb-[22px] pt-4">
        <Link
          href={`/consumidor/pagamento?sacola=${sacola.id}&qtd=${qtd}`}
          className="flex items-center justify-between gap-2 whitespace-nowrap rounded-[14px] bg-brand px-4 py-4 text-sm font-bold text-white"
        >
          <span>Continuar para pagamento</span>
          <span className="font-display text-base">{brl(total)}</span>
        </Link>
      </div>
    </>
  );
}
