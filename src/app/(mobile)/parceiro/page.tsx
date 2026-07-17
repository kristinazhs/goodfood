import Link from "next/link";
import { SacolaLojaCard } from "@/components/parceiro/sacola-loja-card";
import { StatsRow } from "@/components/parceiro/stats-row";
import { BottomNav } from "@/components/ui/bottom-nav";
import { sacolasLoja } from "@/lib/mock-data";
import { navParceiro } from "@/lib/nav";

export default function ParceiroDashboard() {
  return (
    <>
      <main className="flex-1">
        <div className="px-5 pb-4 pt-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="font-display text-[22px] font-semibold leading-[1.15]">
                Oi, Marcos 👋
                <br />
                <span className="text-terracotta-dark">Suas sacolas</span> de
                hoje
              </div>
              <div className="mt-1.5 flex items-center gap-[5px] text-xs text-muted">
                🥖 Domenica Casa de Pães
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

          <StatsRow />
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

        <div className="flex flex-col gap-[13px] px-5 pb-6">
          {sacolasLoja.map((s) => (
            <SacolaLojaCard key={s.id} sacola={s} />
          ))}
        </div>
      </main>
      <BottomNav items={navParceiro} />
    </>
  );
}
