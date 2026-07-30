import Link from "next/link";
import { CodigoForm } from "@/components/parceiro/codigo-form";
import { BottomNav } from "@/components/ui/bottom-nav";
import { SeloEmBreve } from "@/components/ui/em-breve";
import { entregarSacola } from "@/lib/parceiro-actions";
import { getPedidoPorCodigo } from "@/lib/parceiro";
import { brl } from "@/lib/format";
import { navParceiro } from "@/lib/nav";

export const dynamic = "force-dynamic";

// P2 — a flow that didn't exist. The consumer is handed a code and a QR that
// no partner screen could read; "confirmar retirada" lived inside a listing,
// with no check that the right order was being handed over.

export default async function Retirada({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; erro?: string }>;
}) {
  const { codigo, erro } = await searchParams;
  const busca = (codigo ?? "").trim();
  const pedido = busca ? await getPedidoPorCodigo(busca) : null;
  const naoEncontrado = busca.length >= 4 && !pedido;

  return (
    <>
      <main className="flex-1 px-5 pb-6 pt-4">
        <div className="flex items-center gap-3">
          <Link
            href="/parceiro"
            aria-label="Voltar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-sage-line bg-white"
          >
            <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
              <path
                d="M13.5 4.5 7 11l6.5 6.5"
                fill="none"
                stroke="#23231f"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          <h1 className="font-display text-[22px] font-semibold">Retirada</h1>
        </div>

        {/* The camera reader needs a permission prompt and a QR library; the
            typed code is the fallback the design asks for, and it works on
            any phone at the counter today. */}
        <div className="mt-4 flex h-[132px] flex-col items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-sage-line bg-white text-center">
          <svg width="28" height="28" viewBox="0 0 22 22" aria-hidden="true">
            <path
              d="M3.5 8V4.5H7M15 4.5h3.5V8M18.5 14v3.5H15M7 17.5H3.5V14"
              fill="none"
              stroke="#8d8d84"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span className="flex items-center gap-2 text-[13px] font-semibold text-muted">
            Leitura por câmera
            <SeloEmBreve />
          </span>
          <span className="text-xs text-muted">
            Digite o código do cliente abaixo
          </span>
        </div>

        <CodigoForm valorInicial={busca} />

        {erro && (
          <p className="mt-4 rounded-xl bg-alert-bg px-3.5 py-3 text-[13px] font-semibold text-alert">
            Não foi possível registrar a retirada. Tente novamente.
          </p>
        )}

        {naoEncontrado && (
          <p className="mt-4 rounded-xl bg-alert-bg px-3.5 py-3 text-[13px] font-semibold text-alert">
            Nenhum pedido com esse código nesta loja. Confira os 4 caracteres.
          </p>
        )}

        {pedido && (
          <div className="mt-4 rounded-[18px] border-2 border-brand bg-white p-4">
            <div className="text-xs font-bold uppercase leading-none tracking-[0.5px] text-muted">
              Pedido encontrado
            </div>
            <div className="mt-2 font-display text-lg font-bold">
              {pedido.codigo} · {pedido.cliente}
            </div>

            <dl className="mt-3 flex flex-col gap-2 border-t border-sage-line pt-3 text-[13.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Sacola</dt>
                <dd className="text-right font-semibold">
                  {pedido.nomeSacola} · {pedido.qtd} un
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Janela</dt>
                <dd className="text-right font-semibold">{pedido.janela}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Já pago pelo cliente</dt>
                <dd className="text-right font-display text-base font-bold">
                  {brl(pedido.total)}
                </dd>
              </div>
            </dl>

            {/* Not a blocker: someone may genuinely turn up a day early and
                the shop may be happy to hand it over. It just shouldn't
                happen without the counter noticing. */}
            {!pedido.impedimento && pedido.aviso && (
              <p className="mt-4 rounded-xl border-[1.5px] border-[#e8c37a] bg-[#faf1dc] px-3.5 py-3 text-[13px] font-semibold leading-[1.4] text-[#8a6a14]">
                {pedido.aviso} Confirme só se for entregar agora.
              </p>
            )}

            {pedido.impedimento ? (
              <p className="mt-4 rounded-xl bg-amber-bg px-3.5 py-3 text-[13px] font-semibold text-amber-ink">
                {pedido.impedimento}
              </p>
            ) : (
              <form action={entregarSacola} className="mt-4">
                <input type="hidden" name="orderId" value={pedido.id} />
                <button
                  type="submit"
                  className="h-[52px] w-full rounded-[14px] bg-brand text-base font-bold text-white transition-transform active:scale-[0.98]"
                >
                  Entregar sacola
                </button>
                {/* The customer paid at reservation, so confirming does not
                    charge anyone — it records the pickup and releases payout. */}
                <p className="mt-2.5 text-center text-xs leading-[1.4] text-muted">
                  Ao confirmar, a retirada é registrada e o repasse entra no
                  seu extrato.
                </p>
              </form>
            )}
          </div>
        )}
      </main>
      <BottomNav items={navParceiro} />
    </>
  );
}
