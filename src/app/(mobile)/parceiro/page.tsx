import Link from "next/link";
import { BottomNav } from "@/components/ui/bottom-nav";
import { brl } from "@/lib/format";
import { comHora, estadoDaLoja } from "@/lib/horarios";
import { navParceiro } from "@/lib/nav";
import { getFilaHoje, getPainelParceiro } from "@/lib/parceiro";

export const dynamic = "force-dynamic";

// P1 — what the counter does twenty times a day is at the top: confirm a
// pickup by code. Faturado/vendidas left this screen; vanity numbers with no
// period don't help at 18:45, so they moved to Desempenho where there's
// context.

const DIAS = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

export default async function ParceiroHoje({
  searchParams,
}: {
  searchParams: Promise<{ entregue?: string; publicada?: string }>;
}) {
  const [
    { entregue, publicada },
    { establishment, sacolas },
    fila,
  ] = await Promise.all([
    searchParams,
    getPainelParceiro(),
    getFilaHoje(),
  ]);

  const hoje = DIAS[new Date().getDay()];

  // "Aberta" now answers the question it appears to answer. It used to be
  // `sacolas.some(s => s.ativa > 0)` — the shop was called open whenever any
  // offer was live, even at 22h for a shop that closes at 19h30.
  const estado = estadoDaLoja(establishment?.horarios);
  const rotuloEstado =
    estado.aberta === null ? "" : estado.aberta ? " · aberta" : " · fechada";
  const foraDoHorario = sacolas.filter((s) => s.foraDoHorario);

  return (
    <>
      <main className="flex-1 pb-6">
        <div className="px-5 pt-[18px]">
          <h1 className="font-display text-[22px] font-semibold leading-[1.15]">
            Hoje, {hoje}
          </h1>
          <p className="mt-1 text-[13px] font-medium text-muted">
            {establishment?.nome ?? "Seu estabelecimento"}
            {rotuloEstado}
            {estado.aberta && estado.fechaAs
              ? ` até ${comHora(estado.fechaAs)}`
              : ""}
            {estado.aberta === false && estado.abreAs
              ? ` · abre ${comHora(estado.abreAs)}`
              : ""}
          </p>
        </div>

        {/* A bag published for a time nobody is at the counter is a customer
            standing at a locked door. Worth catching here, not at 22h. */}
        {foraDoHorario.length > 0 && (
          <div className="mx-5 mt-4 rounded-xl border-[1.5px] border-[#e8c37a] bg-[#faf1dc] px-3.5 py-3">
            <div className="text-[13px] font-bold leading-[1.3] text-[#8a6a14]">
              {foraDoHorario.length === 1
                ? "Uma sacola está fora do seu horário"
                : `${foraDoHorario.length} sacolas estão fora do seu horário`}
            </div>
            <div className="mt-1 text-[12.5px] font-medium leading-[1.4] text-[#8a6a14]">
              {foraDoHorario.map((s) => s.nome).join(", ")} —{" "}
              {foraDoHorario.length === 1 ? "a janela dela" : "as janelas"} não
              cabe
              {foraDoHorario.length === 1 ? "" : "m"} no horário que você
              cadastrou. Quem for retirar pode encontrar a loja fechada.
            </div>
          </div>
        )}

        {entregue && (
          <div className="mx-5 mt-4 rounded-xl bg-sage px-3.5 py-3 text-[13px] font-bold text-brand-dark">
            Retirada registrada. O repasse entra no seu extrato.
          </div>
        )}

        {publicada === "1" && (
          <div className="mx-5 mt-4 rounded-xl bg-sage px-3.5 py-3">
            <p className="text-[13px] font-bold leading-[1.3] text-brand-dark">
              Sacola publicada
            </p>
            <p className="mt-1 text-[12.5px] font-medium leading-[1.4] text-brand-dark">
              Ela já aparece para os clientes. As reservas chegam na fila
              abaixo.
            </p>
          </div>
        )}

        {/* the task, and the button that does it */}
        <div className="mx-5 mt-4 rounded-[18px] border-[1.5px] border-sage-line bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase leading-none tracking-[0.5px] text-muted">
                Aguardando retirada
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-[28px] font-bold leading-none text-brand-dark">
                  {fila.aguardando}
                </span>
                <span className="text-[13px] font-medium text-muted">
                  {fila.aguardando === 1
                    ? "cliente a caminho"
                    : "clientes a caminho"}
                </span>
              </div>
              {fila.ateAs && (
                <div className="mt-1 text-[12.5px] font-medium text-muted">
                  até {fila.ateAs}
                </div>
              )}
            </div>
            {fila.ateAs && (
              <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-sage px-2 text-[11px] font-bold leading-none text-brand-dark">
                janela aberta
              </span>
            )}
          </div>

          <Link
            href="/parceiro/retirada"
            className="mt-3.5 flex h-[52px] items-center justify-center gap-2.5 rounded-[14px] bg-brand text-base font-bold text-white transition-transform active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
              <path
                d="M3.5 8V4.5H7M15 4.5h3.5V8M18.5 14v3.5H15M7 17.5H3.5V14"
                fill="none"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Escanear código
          </Link>
        </div>

        {/* Fixed-height list with its own scroll: as the day fills up, the
            top of the screen isn't pushed away. */}
        <div className="mt-5 flex items-center justify-between px-5 pb-2.5">
          <span className="text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
            Fila de hoje
          </span>
          <span className="text-xs font-semibold leading-none text-muted">
            {fila.aguardando} aguardando · {fila.total} hoje
          </span>
        </div>

        {fila.itens.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            Nenhuma reserva hoje ainda.
          </p>
        ) : (
          <div className="mx-5 max-h-[280px] overflow-y-auto rounded-[16px] border-[1.5px] border-sage-line bg-white">
            {fila.itens.map((i, idx) => {
              const aguardando = i.status === "reservado";
              return (
                <div
                  key={i.id}
                  className={`flex items-center gap-3 px-3.5 py-3 ${
                    idx > 0 ? "border-t border-sage-line" : ""
                  }`}
                >
                  <span
                    className={`w-[62px] shrink-0 font-display text-[13px] font-bold tracking-[0.5px] ${
                      aguardando ? "text-charcoal" : "text-[#b5b5a8]"
                    }`}
                  >
                    {i.codigo}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[13px] font-semibold ${
                        aguardando ? "text-charcoal" : "text-muted"
                      }`}
                    >
                      {i.cliente}
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                      {i.qtd} un · {i.nomeSacola}
                      {i.retiradoAs ? ` · ${i.retiradoAs}` : ""}
                    </span>
                  </span>
                  {/* Collected rows stay visible for auditing, marked only by
                      the plaque — never a button you can tap by mistake. */}
                  <span
                    className={`inline-flex h-6 shrink-0 items-center rounded-[7px] px-2 text-[11px] font-bold leading-none ${
                      aguardando
                        ? "bg-[#E5EEF8] text-[#1D5A96]"
                        : i.status === "retirado"
                          ? "bg-sage text-brand-dark"
                          : "bg-alert-bg text-alert"
                    }`}
                  >
                    {aguardando
                      ? "Reservado"
                      : i.status === "retirado"
                        ? "Retirado"
                        : "Não retirado"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between px-5 pb-2.5">
          <span className="text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
            Publicado hoje
          </span>
          <Link
            href="/parceiro/sacolas/nova"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand px-3 text-xs font-bold text-white"
          >
            + Nova sacola
          </Link>
        </div>

        {sacolas.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm leading-[1.5] text-muted">
            Você ainda não publicou sacolas hoje.
          </p>
        ) : (
          <div className="flex flex-col gap-3 px-5">
            {sacolas.map((s) => {
              const vendidas = s.retirada + s.naoRetirada;
              const total = Math.max(1, vendidas + s.reservada + s.ativa);
              const pct = (n: number) => `${(n / total) * 100}%`;
              return (
                <Link
                  key={s.id}
                  href={`/parceiro/sacolas/${s.id}`}
                  className="rounded-[18px] border-[1.5px] border-sage-line bg-white p-3.5 transition-transform active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-display text-base font-semibold">
                        {s.nome}
                      </div>
                      <div className="mt-0.5 text-[12.5px] font-medium text-muted">
                        {s.retiradaLabel}
                      </div>
                    </div>
                    <span className="shrink-0 font-display text-base font-bold">
                      {brl(s.preco)}
                    </span>
                  </div>

                  {/* The funnel as one bar — it used to be four loose numbers. */}
                  <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-[#efece5]">
                    <span className="bg-brand" style={{ width: pct(s.retirada) }} />
                    <span className="bg-[#7FA98C]" style={{ width: pct(s.reservada) }} />
                    <span className="bg-terracotta" style={{ width: pct(s.naoRetirada) }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-[12px] font-semibold">
                    <span className="text-brand-dark">{s.retirada} retiradas</span>
                    <span className="text-[#5c8a6b]">{s.reservada} reservadas</span>
                    {s.naoRetirada > 0 && (
                      <span className="text-terracotta-dark">
                        {s.naoRetirada} não retiradas
                      </span>
                    )}
                    <span className="text-muted">{s.ativa} resta</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav items={navParceiro} />
    </>
  );
}
