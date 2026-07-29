import Link from "next/link";
import { notFound } from "next/navigation";
import { ReserveBar } from "@/components/consumidor/reserve-bar";
import { horaCorteReserva, reservasEncerradas } from "@/lib/datas";
import { minutosAPe } from "@/lib/distancia";
import { brl } from "@/lib/format";
import { getSacolaPorId } from "@/lib/sacolas";

export const dynamic = "force-dynamic";

const NOME_ALERGENO: Record<string, string> = {
  gluten: "glúten",
  leite: "leite",
  ovos: "ovos",
  nozes: "nozes",
  soja: "soja",
  peixe: "peixe",
};

export default async function SacolaDetalhe({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const [{ id }, { de }] = await Promise.all([params, searchParams]);
  const sacola = await getSacolaPorId(id);
  if (!sacola) notFound();

  // Back respects where you came from, instead of always going home.
  const voltarPara = de === "mapa" ? "/consumidor/descobrir" : "/consumidor";

  const temDesconto = sacola.precoOriginal > sacola.preco;
  const economia = sacola.precoOriginal - sacola.preco;
  const pct = temDesconto
    ? Math.round((1 - sacola.preco / sacola.precoOriginal) * 100)
    : 0;

  const minutos = minutosAPe(sacola.lat, sacola.lng);
  const corte = sacola.janelaFim ? horaCorteReserva(sacola.janelaFim) : null;
  const fechada = reservasEncerradas(sacola.janelaFim);
  const esgotada = sacola.disponivel === 0;

  const alergenos = sacola.alergenos
    .map((a) => NOME_ALERGENO[a] ?? a)
    .join(", ");

  const rota = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${sacola.endereco || sacola.loja}, Porto Alegre`,
  )}`;

  return (
    <>
      <main className="flex-1">
        {/* hero — photo slot, striped placeholder until real photos exist */}
        <div
          className="relative h-[172px]"
          style={{
            background:
              "repeating-linear-gradient(135deg,#2b7c49 0 12px,#25703f 12px 24px)",
          }}
        >
          <Link
            href={voltarPara}
            aria-label="Voltar"
            className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95"
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

          {temDesconto && (
            <span className="absolute bottom-3.5 left-4 inline-flex h-7 items-center whitespace-nowrap rounded-full bg-white px-[11px] text-[13px] font-extrabold leading-none text-brand-dark">
              −{pct}% · economize {brl(economia)}
            </span>
          )}
          <span className="absolute bottom-4 right-4 font-mono text-[11px] leading-none text-mint">
            foto da loja
          </span>
        </div>

        <div className="px-5 pt-[18px]">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-bold leading-[1.15]">
              {sacola.nome}
            </h1>
            <div className="shrink-0 text-right">
              {temDesconto && (
                <div className="text-[13px] font-medium leading-none text-muted line-through">
                  {brl(sacola.precoOriginal)}
                </div>
              )}
              <div className="mt-1 font-display text-2xl font-bold leading-[1.15]">
                {brl(sacola.preco)}
              </div>
            </div>
          </div>

          <div className="mt-1.5 text-sm font-medium leading-[1.4] text-muted">
            {/* The shop name is the one thing here people want to look up
                before buying, and it led nowhere until now. */}
            <Link
              href={`/loja/${sacola.lojaId}`}
              className="font-bold text-brand-dark underline"
            >
              {sacola.loja}
            </Link>
            {sacola.distancia ? ` · ${sacola.distancia}` : ""}
            {/* No star until the shop actually has reviews. */}
            {sacola.avaliacao != null && (
              <>
                {" · ★ "}
                {sacola.avaliacao.toFixed(1).replace(".", ",")}
                {sacola.avaliacoesTotal > 0 ? ` (${sacola.avaliacoesTotal})` : ""}
              </>
            )}
          </div>

          {/* the two facts that decide the purchase */}
          <div className="mt-4 flex gap-2.5">
            <div className="flex-1 rounded-[14px] border-[1.5px] border-sage-line bg-white p-3">
              <div className="text-xs font-bold uppercase leading-none tracking-[0.5px] text-muted">
                Retirada
              </div>
              <div className="mt-1.5 text-[15px] font-bold leading-[1.2]">
                {sacola.janela || "—"}
              </div>
              {corte && (
                <div className="mt-[3px] text-[12.5px] font-medium leading-[1.3] text-terracotta-dark">
                  {fechada ? "reservas encerradas" : `reservas até ${corte}`}
                </div>
              )}
            </div>
            <div className="flex-1 rounded-[14px] border-[1.5px] border-sage-line bg-white p-3">
              <div className="text-xs font-bold uppercase leading-none tracking-[0.5px] text-muted">
                Resta
              </div>
              <div className="mt-1.5 text-[15px] font-bold leading-[1.2] text-terracotta-dark">
                {esgotada
                  ? "esgotada"
                  : `${sacola.disponivel} ${sacola.disponivel === 1 ? "sacola" : "sacolas"}`}
              </div>
              <div className="mt-[3px] text-[12.5px] font-medium leading-[1.3] text-muted">
                de {sacola.total} hoje
              </div>
            </div>
          </div>

          {(sacola.conteudos.length > 0 || alergenos) && (
            <section className="mt-[18px]">
              <h2 className="mb-2 font-display text-[17px] font-semibold">
                O que pode vir
              </h2>
              <div className="flex flex-col gap-2">
                {sacola.conteudos.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-sage-line bg-white px-3.5 py-[11px]"
                  >
                    <span className="flex-1 text-[13.5px] font-semibold leading-none">
                      {item.label}
                    </span>
                    <span
                      className={`inline-flex h-6 items-center rounded-[7px] px-2 text-xs font-bold leading-none ${
                        item.tag === "Provável"
                          ? "bg-sage text-brand-dark"
                          : "bg-[#f2efe8] text-muted"
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                ))}

                {/* Allergens are a safety declaration, not a detail — the
                    customer cannot see inside a surprise bag before buying. */}
                {alergenos && (
                  <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-sage-line bg-white px-3.5 py-[11px]">
                    <span className="flex-1 text-[13.5px] font-semibold leading-none text-alert">
                      Contém {alergenos}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="mt-[18px] flex items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white p-[13px]">
            <div
              className="h-11 w-11 shrink-0 rounded-xl"
              style={{
                background:
                  "repeating-linear-gradient(135deg,#e4ede3 0 8px,#eff5ef 8px 16px)",
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-bold leading-[1.3]">
                {sacola.endereco}
              </div>
              {minutos != null && (
                <div className="mt-0.5 text-[12.5px] font-medium leading-[1.3] text-muted">
                  {minutos} min a pé de você
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

          {/* clears the sticky reserve bar so the address card stays reachable */}
          <div className="h-6" />
        </div>
      </main>

      <ReserveBar sacola={sacola} bloqueada={fechada || esgotada} />
    </>
  );
}
