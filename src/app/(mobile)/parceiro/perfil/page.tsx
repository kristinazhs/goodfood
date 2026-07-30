import Link from "next/link";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import { BottomNav } from "@/components/ui/bottom-nav";
import { signOut } from "@/lib/auth-actions";
import { brl } from "@/lib/format";
import { navParceiro } from "@/lib/nav";
import { getDadosBancarios, getLoja, getModelos } from "@/lib/parceiro";
import { publicarModeloHoje, removerModelo } from "@/lib/parceiro-actions";

export const dynamic = "force-dynamic";

// P5 — "Loja" stopped being only settings. The most-used act of the day
// (re-publishing something that already exists) lives here, one tap from a
// saved model. Payout and help stay visible but quiet, in 44px rows.

const ROTULO_CATEGORIA: Record<string, string> = {
  padaria: "padaria",
  doceria: "doceria",
  refeicao: "refeição",
  mercado: "mercado",
};

export default async function Loja({
  searchParams,
}: {
  searchParams: Promise<{
    erro?: string;
    salvo?: string;
    perfil?: string;
    repasse?: string;
    removido?: string;
  }>;
}) {
  const [{ erro, salvo, perfil, repasse, removido }, loja, modelos, banco] =
    await Promise.all([
      searchParams,
      getLoja(),
      getModelos(),
      getDadosBancarios(),
    ]);
  const repasseConfigurado = banco.configurado;

  return (
    <>
      <main className="flex-1 pb-6">
        <div className="flex items-center gap-3.5 px-5 pt-5">
          <FotoSacola
            src={loja?.fotoUrl ?? null}
            size={62}
            radius={16}
            legenda={"foto\nloja"}
            alt=""
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-semibold leading-[1.2]">
              {loja?.nome ?? "Sua loja"}
            </h1>
            <p className="mt-[3px] truncate text-[12.5px] font-medium leading-[1.3] text-muted">
              {loja?.endereco || "Endereço não informado"}
            </p>
          </div>
        </div>

        {repasse === "1" && (
          <div className="mx-5 mt-4 rounded-xl bg-sage px-3.5 py-3">
            <p className="text-[13px] font-bold leading-[1.3] text-brand-dark">
              Dados de repasse salvos
            </p>
            <p className="mt-1 text-[12.5px] font-medium leading-[1.4] text-brand-dark">
              Ficam guardados até os repasses começarem. Só a sua loja vê.
            </p>
          </div>
        )}

        {removido === "1" && (
          <div className="mx-5 mt-4 rounded-xl bg-sage px-3.5 py-3">
            <p className="text-[13px] font-bold leading-[1.3] text-brand-dark">
              Modelo removido
            </p>
            <p className="mt-1 text-[12.5px] font-medium leading-[1.4] text-brand-dark">
              Ele saiu desta lista. As sacolas já publicadas a partir dele
              continuam no ar, com as reservas que já têm.
            </p>
          </div>
        )}

        {perfil === "1" && (
          <div className="mx-5 mt-4 rounded-xl bg-sage px-3.5 py-3">
            <p className="text-[13px] font-bold leading-[1.3] text-brand-dark">
              Perfil público atualizado
            </p>
            <p className="mt-1 text-[12.5px] font-medium leading-[1.4] text-brand-dark">
              É assim que sua loja aparece para quem procura sacola.
            </p>
          </div>
        )}

        {salvo === "1" && (
          <div className="mx-5 mt-4 rounded-xl bg-sage px-3.5 py-3">
            <p className="text-[13px] font-bold leading-[1.3] text-brand-dark">
              Modelo salvo
            </p>
            <p className="mt-1 text-[12.5px] font-medium leading-[1.4] text-brand-dark">
              Ele fica em Modelos salvos, logo abaixo. Para colocá-lo à venda
              hoje, toque em Publicar hoje.
            </p>
          </div>
        )}

        {erro === "duplicada" ? (
          <p className="mx-5 mt-4 rounded-xl bg-amber-bg px-3.5 py-3 text-[13px] font-semibold text-amber-ink">
            Essa sacola já está publicada hoje. Para uma segunda leva, use
            Publicar sacola e defina outra janela de retirada.
          </p>
        ) : erro ? (
          <p className="mx-5 mt-4 rounded-xl bg-alert-bg px-3.5 py-3 text-[13px] font-semibold text-alert">
            Não foi possível publicar esse modelo. Tente pela tela Publicar
            sacola.
          </p>
        ) : null}

        <div className="flex items-center justify-between px-5 pb-2.5 pt-6">
          <span className="text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
            Modelos salvos
          </span>
          <span className="text-[12.5px] font-semibold leading-none text-muted">
            {modelos.length === 1 ? "1 modelo" : `${modelos.length} modelos`}
          </span>
        </div>

        <div className="flex flex-col gap-2.5 px-5">
          {modelos.length === 0 ? (
            <p className="py-6 text-center text-sm leading-[1.5] text-muted">
              Você ainda não tem modelos salvos.
              <br />
              Crie o primeiro para publicar com um toque nos próximos dias.
            </p>
          ) : (
            modelos.map((m) => (
              <div
                key={m.bagId}
                className="rounded-2xl border-[1.5px] border-sage-line bg-white p-[13px]"
              >
                <div className="flex items-end justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold leading-[1.3]">
                      {m.nome} · {m.quantidade} un
                    </div>
                    <div className="mt-[3px] text-[12.5px] font-medium leading-[1.3] text-muted">
                      {m.janelaInicio.replace(":", "h")} –{" "}
                      {m.janelaFim.replace(":", "h")} ·{" "}
                      {ROTULO_CATEGORIA[m.categoria] ?? m.categoria}
                      {m.usos > 0 ? ` · usado ${m.usos}×` : ""}
                    </div>
                    {m.publicadoHoje && (
                      <div className="mt-1 text-[11.5px] font-semibold leading-none text-brand-dark">
                        já publicada hoje
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 font-display text-base font-bold">
                    {brl(m.preco)}
                  </span>
                </div>

                <div className="mt-[11px] flex gap-2.5">
                  {m.publicadoHoje ? (
                    <span className="flex h-11 flex-1 items-center justify-center rounded-xl bg-sage text-[13.5px] font-bold text-brand-dark">
                      Publicada hoje
                    </span>
                  ) : (
                    <form action={publicarModeloHoje} className="flex-1">
                      <input type="hidden" name="bagId" value={m.bagId} />
                      <button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-brand text-[13.5px] font-bold text-white transition-transform active:scale-[0.98]"
                      >
                        Publicar hoje
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/parceiro/sacolas/nova?modelo=${m.bagId}`}
                    className="flex h-11 shrink-0 items-center rounded-xl border-[1.5px] border-sage-line bg-white px-3.5 text-[13.5px] font-bold text-[#4a4a44]"
                  >
                    Editar
                  </Link>
                  {/* Takes it out of this list; the offers already published
                      from it, and their reservations, all stand. */}
                  <form action={removerModelo} className="shrink-0">
                    <input type="hidden" name="bagId" value={m.bagId} />
                    <button
                      type="submit"
                      aria-label={`Remover ${m.nome} dos modelos`}
                      className="h-11 rounded-xl border-[1.5px] border-sage-line bg-white px-3 text-[13.5px] font-bold text-muted"
                    >
                      Remover
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}

          <Link
            href="/parceiro/sacolas/nova"
            className="flex h-12 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-sage-line text-[13.5px] font-bold text-brand-dark"
          >
            <span className="text-[17px] leading-none">+</span> Novo modelo
          </Link>
        </div>

        <div className="px-5 pb-2.5 pt-6 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
          Ajustes da loja
        </div>

        <div className="flex flex-col gap-2.5 px-5">
          <Link
            href="/parceiro/perfil/publico"
            className="flex min-h-11 items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-[1.3]">
                Perfil público
              </span>
              <span className="mt-0.5 block text-[12.5px] font-medium leading-[1.35] text-muted">
                Foto, descrição e horários
              </span>
            </span>
            <span className="shrink-0 text-base font-bold leading-none text-[#8d8d84]">
              ›
            </span>
          </Link>

          <Link
            href="/parceiro/perfil/repasse"
            className="flex min-h-11 items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-[1.3]">
                Repasse e dados bancários
              </span>
              <span className="mt-0.5 block text-[12.5px] font-medium leading-[1.35] text-muted">
                {repasseConfigurado
                  ? "Dados salvos · repasses ainda não ativos"
                  : "Deixe pronto para quando os repasses começarem"}
              </span>
            </span>
            <span className="shrink-0 text-base font-bold leading-none text-[#8d8d84]">
              ›
            </span>
          </Link>

          <a
            href="mailto:contato@goodfood.app?subject=Ajuda%20para%20parceiros"
            className="flex min-h-11 items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-[1.3]">
                Ajuda para parceiros
              </span>
              <span className="mt-0.5 block truncate text-[12.5px] font-medium leading-[1.35] text-muted">
                Falar com o time
              </span>
            </span>
            <span className="shrink-0 text-base font-bold leading-none text-[#8d8d84]">
              ›
            </span>
          </a>

          {/* Not in the design, but a partner needs a way out. Grey, not
              alarm-coloured: leaving is destructive, not urgent. */}
          <form action={signOut} className="pt-1">
            <button
              type="submit"
              className="h-11 w-full text-[13.5px] font-semibold text-muted"
            >
              Sair
            </button>
          </form>
        </div>
      </main>
      <BottomNav items={navParceiro} />
    </>
  );
}
