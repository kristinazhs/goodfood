import Link from "next/link";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import { BottomNav } from "@/components/ui/bottom-nav";
import { contagemRetirada, diaMes, mesPorExtenso } from "@/lib/datas";
import { brl } from "@/lib/format";
import { getOrigem } from "@/lib/enderecos";
import { navConsumidor } from "@/lib/nav";
import {
  calcularImpacto,
  getMeusPedidos,
  type PedidoResumo,
  type PedidoStatus,
} from "@/lib/pedidos";

export const dynamic = "force-dynamic";

const statusHistorico: Record<PedidoStatus, { texto: string; cor: string }> = {
  reservado: { texto: "Reservado", cor: "bg-[#E5EEF8] text-[#1D5A96]" },
  retirado: { texto: "Retirado", cor: "bg-sage text-brand-dark" },
  nao_retirado: { texto: "Não retirado", cor: "bg-alert-bg text-alert" },
  cancelado: { texto: "Cancelado", cor: "bg-[#EFEDE6] text-muted" },
};

// An order is "active" while it's still yours to collect.
function estaAtivo(p: PedidoResumo): boolean {
  return p.status === "reservado" && new Date(p.janelaFim).getTime() > Date.now();
}

function porMes(pedidos: PedidoResumo[]): [string, PedidoResumo[]][] {
  const grupos = new Map<string, PedidoResumo[]>();
  for (const p of pedidos) {
    const chave = mesPorExtenso(p.reservadoEm);
    const atual = grupos.get(chave);
    if (atual) atual.push(p);
    else grupos.set(chave, [p]);
  }
  return [...grupos.entries()];
}

export default async function Pedidos({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const origem = await getOrigem();
  const [{ aba }, pedidos] = await Promise.all([
    searchParams,
    getMeusPedidos(origem),
  ]);

  const ativos = pedidos.filter(estaAtivo);
  const historico = pedidos.filter((p) => !estaAtivo(p));
  const impacto = calcularImpacto(pedidos);

  // Land on whichever tab has something in it.
  const mostrandoHistorico =
    aba === "historico" || (aba !== "ativos" && ativos.length === 0);

  return (
    <>
      <main className="flex-1">
        <div className="px-5 pt-[18px]">
          <h1 className="font-display text-2xl font-semibold">Seus pedidos</h1>

          {/* Active and history are different things: one is a task with a
              code and a clock, the other is a record. */}
          <div className="mt-3.5 flex gap-2">
            <Link
              href="/consumidor/pedidos?aba=ativos"
              aria-current={!mostrandoHistorico ? "page" : undefined}
              className={`inline-flex h-9 items-center rounded-full px-3.5 text-[13px] leading-none ${
                !mostrandoHistorico
                  ? "bg-brand-dark font-bold text-white"
                  : "border-[1.5px] border-sage-line bg-white font-semibold text-charcoal"
              }`}
            >
              Ativos · {ativos.length}
            </Link>
            <Link
              href="/consumidor/pedidos?aba=historico"
              aria-current={mostrandoHistorico ? "page" : undefined}
              className={`inline-flex h-9 items-center rounded-full px-3.5 text-[13px] leading-none ${
                mostrandoHistorico
                  ? "bg-brand-dark font-bold text-white"
                  : "border-[1.5px] border-sage-line bg-white font-semibold text-charcoal"
              }`}
            >
              Histórico
            </Link>
          </div>
        </div>

        <div className="px-5 pt-4">
          {pedidos.length === 0 ? (
            <div className="py-16 text-center text-sm leading-[1.5] text-muted">
              Você ainda não fez nenhuma reserva.
              <br />
              <Link
                href="/consumidor"
                className="font-bold text-brand-dark underline"
              >
                Encontrar uma sacola
              </Link>
            </div>
          ) : !mostrandoHistorico ? (
            ativos.length === 0 ? (
              <div className="py-14 text-center text-sm leading-[1.5] text-muted">
                Nenhuma reserva ativa agora.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {ativos.map((p) => {
                  const contagem = contagemRetirada(p.janelaInicio, p.janelaFim);
                  return (
                    <div
                      key={p.id}
                      className="overflow-hidden rounded-[18px] border-2 border-brand bg-white"
                    >
                      <div className="flex items-center justify-between gap-2 bg-sage px-3.5 py-2.5">
                        <span className="flex min-w-0 items-center gap-[7px] text-[12.5px] font-bold leading-none text-brand-dark">
                          <span className="truncate">Retirar {p.janela}</span>
                          {/* charge-at-reservation: the money already left */}
                          <span className="inline-flex h-5 shrink-0 items-center rounded-md bg-white px-[7px] text-[11px] font-extrabold leading-none text-brand-dark">
                            Pago
                          </span>
                        </span>
                        {contagem && (
                          <span className="shrink-0 text-[12.5px] font-extrabold leading-none text-terracotta-dark">
                            {contagem}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-[13px] p-[13px]">
                        <FotoSacola size={72} radius={12} alt={p.nomeSacola} />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="truncate font-display text-base font-semibold leading-[1.3]">
                            {p.nomeSacola}
                          </div>
                          <div className="mt-0.5 truncate text-[13px] font-medium leading-[1.3] text-muted">
                            {p.loja}
                            {p.distancia ? ` · ${p.distancia}` : ""}
                          </div>
                          <div className="mt-auto flex items-end justify-between gap-2 pt-[9px]">
                            <span className="font-display text-[15px] font-bold tracking-[1.5px]">
                              {p.codigo}
                            </span>
                            <span className="shrink-0 font-display text-base font-bold">
                              {brl(p.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-[13px] pb-[13px]">
                        <Link
                          href={`/consumidor/pedido/${p.id}`}
                          className="flex h-[46px] items-center justify-center rounded-xl bg-brand text-[14.5px] font-bold text-white transition-transform active:scale-[0.98]"
                        >
                          Ver código de retirada
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : historico.length === 0 ? (
            <div className="py-14 text-center text-sm leading-[1.5] text-muted">
              Seu histórico aparece aqui depois da primeira retirada.
            </div>
          ) : (
            porMes(historico).map(([mes, doMes]) => (
              <div key={mes}>
                <div className="pb-2.5 pt-2 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
                  {mes}
                </div>
                <div className="flex flex-col gap-2.5">
                  {doMes.map((p) => {
                    const st = statusHistorico[p.status];
                    return (
                      // No "pedir novamente": the history can't promise today's
                      // stock. It leads to the sacola, where the truth lives.
                      <Link
                        key={p.id}
                        href={`/consumidor/sacola/${p.bagId}`}
                        className="flex gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white p-3 transition-transform active:scale-[0.98]"
                      >
                        <FotoSacola size={56} radius={12} alt={p.nomeSacola} />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="truncate text-sm font-bold leading-[1.3]">
                            {p.nomeSacola}
                          </div>
                          <div className="mt-0.5 truncate text-[12.5px] font-medium leading-[1.3] text-muted">
                            {p.loja} · {p.qtd} un
                          </div>
                          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                            <span className="flex min-w-0 items-center gap-[7px]">
                              <span
                                className={`inline-flex h-6 shrink-0 items-center rounded-[7px] px-2 text-xs font-bold leading-none ${st.cor}`}
                              >
                                {st.texto}
                              </span>
                              <span className="whitespace-nowrap text-[12.5px] font-medium leading-none text-muted">
                                {diaMes(p.reservadoEm)}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs font-bold leading-none">
                              {brl(p.total)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* The reason people come back. Counts collected orders only. */}
          {impacto.kg > 0 && (
            <div className="mt-5 flex items-center gap-3.5 rounded-[18px] bg-sage p-4">
              <div>
                <div className="font-display text-[19px] font-bold text-brand-dark">
                  {impacto.kg.toFixed(1).replace(".", ",")} kg
                </div>
                <div className="mt-0.5 text-[12.5px] font-semibold leading-[1.3] text-[#4a4a44]">
                  de comida que você salvou
                </div>
              </div>
              <div className="h-[38px] w-px bg-sage-line" />
              <div>
                <div className="font-display text-[19px] font-bold text-brand-dark">
                  R$ {Math.round(impacto.economizado)}
                </div>
                <div className="mt-0.5 text-[12.5px] font-semibold leading-[1.3] text-[#4a4a44]">
                  economizados em {impacto.ano}
                </div>
              </div>
            </div>
          )}

          <div className="h-[22px]" />
        </div>
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
