import { notFound } from "next/navigation";
import { BagCard } from "@/components/consumidor/bag-card";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import { BackButton } from "@/components/ui/back-button";
import { comHora, diaSemanaSP, estadoDaLoja } from "@/lib/horarios";
import { getOrigem } from "@/lib/enderecos";
import { agruparPorDia, getLojaPublica } from "@/lib/sacolas";

export const dynamic = "force-dynamic";

// H — the shop's own page. Until now there was nowhere for a shop name to
// lead: search results for "Lojas" opened a sacola instead, and an order in
// the history had no way back to the place it came from.

const DIAS = [
  { id: "seg", label: "Segunda" },
  { id: "ter", label: "Terça" },
  { id: "qua", label: "Quarta" },
  { id: "qui", label: "Quinta" },
  { id: "sex", label: "Sexta" },
  { id: "sab", label: "Sábado" },
  { id: "dom", label: "Domingo" },
] as const;

export default async function PaginaLoja({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const [{ id }, { de }] = await Promise.all([params, searchParams]);
  // Back respects where you came from, instead of always going home.
  const voltarPara = de === "mapa" ? "/consumidor/descobrir" : "/consumidor";
  const loja = await getLojaPublica(id, await getOrigem());
  if (!loja) notFound();

  const estado = estadoDaLoja(loja.horarios);
  const hojeId = diaSemanaSP();

  return (
    <main className="flex flex-1 flex-col pb-8">
      <div className="px-5 pt-5">
        <BackButton href={voltarPara} />
      </div>

      <div className="flex items-center gap-3.5 px-5 pt-4">
        <FotoSacola
          src={loja.fotoUrl}
          size={72}
          radius={18}
          legenda={"foto\nloja"}
          alt=""
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[21px] font-semibold leading-[1.2]">
            {loja.nome}
          </h1>
          <p className="mt-[3px] text-[12.5px] font-medium leading-[1.35] text-muted">
            {/* No invented star: a shop with no reviews shows none. */}
            {loja.avaliacao !== null && (
              <>
                ★ {loja.avaliacao.toFixed(1).replace(".", ",")} (
                {loja.avaliacoesTotal}) ·{" "}
              </>
            )}
            {estado.aberta === null
              ? "Horário não informado"
              : estado.aberta
                ? `Aberta agora${estado.fechaAs ? ` até ${comHora(estado.fechaAs)}` : ""}`
                : "Fechada agora"}
          </p>
        </div>
      </div>

      {loja.descricao && (
        <p className="px-5 pt-4 text-[13.5px] leading-[1.55] text-[#4a4a44]">
          {loja.descricao}
        </p>
      )}

      {loja.endereco && (
        <div className="px-5 pt-4">
          <div className="text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
            Onde retirar
          </div>
          <p className="mt-2 text-[13.5px] leading-[1.4]">{loja.endereco}</p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${loja.endereco || loja.nome}, Porto Alegre`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-block text-[13px] font-bold text-brand-dark"
          >
            Como chegar ›
          </a>
        </div>
      )}

      <div className="px-5 pb-2.5 pt-6 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
        Horários
      </div>
      <div className="mx-5 overflow-hidden rounded-2xl border-[1.5px] border-sage-line bg-white">
        {DIAS.map((d, i) => {
          const h = loja.horarios[d.id];
          const hoje = d.id === hojeId;
          return (
            <div
              key={d.id}
              className={`flex items-center justify-between px-3.5 py-2.5 text-[13px] ${
                i > 0 ? "border-t border-sage-line" : ""
              } ${hoje ? "bg-sage" : ""}`}
            >
              <span className={hoje ? "font-bold text-brand-dark" : "font-medium"}>
                {d.label}
              </span>
              <span
                className={
                  hoje ? "font-bold text-brand-dark" : "font-medium text-muted"
                }
              >
                {!h
                  ? "—"
                  : h.aberto
                    ? `${comHora(h.inicio)} – ${comHora(h.fim)}`
                    : "Fechado"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="px-5 pb-2.5 pt-6 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
        Sacolas disponíveis
      </div>
      {loja.sacolas.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm leading-[1.5] text-muted">
          Nenhuma sacola desta loja agora.
          <br />
          Volte mais tarde 🌙
        </p>
      ) : (
        /* Grouped by day, like the feed. A shop with sacolas on both days
           listed them flat, so every tomorrow card had to carry "amanhã ·"
           in its own pill — which on a 390px screen left no room and clipped
           the closing time to "amanhã · 06h30 – 0…". Said once as a heading,
           the pill has room for the whole window again. */
        agruparPorDia(loja.sacolas).map(([dia, doDia]) => (
          <div key={dia}>
            <div className="px-5 pb-2 pt-1 text-[12.5px] font-bold capitalize leading-none text-muted">
              {dia} · {doDia.length}
            </div>
            <div className="flex flex-col gap-2.5 px-5 pb-3">
              {doDia.map((s) => (
                <BagCard key={s.id} sacola={s} mostrarDia={false} />
              ))}
            </div>
          </div>
        ))
      )}
    </main>
  );
}
