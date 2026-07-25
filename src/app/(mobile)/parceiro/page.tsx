import Link from "next/link";
import { SacolaLojaCard } from "@/components/parceiro/sacola-loja-card";
import { StatsRow } from "@/components/parceiro/stats-row";
import { BottomNav } from "@/components/ui/bottom-nav";
import { navParceiro } from "@/lib/nav";
import { getPainelParceiro } from "@/lib/parceiro";

export const dynamic = "force-dynamic";

export default async function ParceiroDashboard() {
  const { establishment, sacolas, stats } = await getPainelParceiro();

  return (
    <>
      <main className="flex-1">
        <div className="px-5 pb-4 pt-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="font-display text-[22px] font-semibold leading-[1.15]">
                Olá 👋
                <br />
                <span className="text-terracotta-dark">Suas sacolas</span> de
                hoje
              </div>
              <div className="mt-1.5 flex items-center gap-[5px] text-xs text-muted">
                {establishment
                  ? `${establishment.emoji} ${establishment.nome}`
                  : "Seu estabelecimento"}
              </div>
            </div>
            <Link
              href="/parceiro/perfil"
              aria-label="Perfil da loja"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-sage-line bg-sage text-base"
            >
              👤
            </Link>
          </div>

          <StatsRow
            faturado={stats.faturado}
            vendidas={stats.vendidas}
            resgatada={stats.resgatada}
          />
        </div>

        <div className="flex items-center justify-between px-5 pb-2.5 pt-1">
          <span className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
            Suas sacolas
          </span>
          <Link
            href="/parceiro/sacolas/nova"
            aria-label="Adicionar sacola"
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-brand pb-[2px] text-base font-semibold leading-none text-white"
          >
            +
          </Link>
        </div>

        {sacolas.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm leading-[1.5] text-muted">
            Você ainda não publicou sacolas hoje.
            <br />
            Toque no <b className="text-brand-dark">+</b> para criar a primeira 🥐
          </div>
        ) : (
          <div className="flex flex-col gap-[13px] px-5 pb-6">
            {sacolas.map((s) => (
              <SacolaLojaCard key={s.id} sacola={s} />
            ))}
          </div>
        )}
      </main>
      <BottomNav items={navParceiro} />
    </>
  );
}
