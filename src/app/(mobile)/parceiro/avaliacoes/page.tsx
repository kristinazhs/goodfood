import Link from "next/link";
import { AvaliacaoCard } from "@/components/parceiro/avaliacao-card";
import { BottomNav } from "@/components/ui/bottom-nav";
import { navParceiro } from "@/lib/nav";
import { AVALIACOES, RESUMO_AVALIACOES } from "@/lib/parceiro-mock";

// The reviews half of P4 on its own, since the partner nav keeps a separate
// Avaliações tab. Same cards, same mock source — see lib/parceiro-mock.ts.

export default function Avaliacoes() {
  return (
    <>
      <main className="flex-1 pb-6">
        <div className="px-5 pt-[18px]">
          <h1 className="font-display text-[23px] font-semibold">Avaliações</h1>
          <p className="mt-1 text-[12.5px] font-medium leading-[1.4] text-muted">
            Dados de exemplo — sua loja verá as avaliações reais.
          </p>
        </div>

        <div className="flex items-center justify-between px-5 pb-2.5 pt-4">
          <span className="text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
            Suas avaliações
          </span>
          <span className="text-[12.5px] font-semibold leading-none text-muted">
            {RESUMO_AVALIACOES}
          </span>
        </div>

        <div className="flex flex-col gap-2.5 px-5">
          {AVALIACOES.map((a) => (
            <AvaliacaoCard key={a.autor} a={a} />
          ))}
        </div>

        <div className="px-5 pt-4">
          <Link
            href="/parceiro/desempenho"
            className="text-[13px] font-bold text-brand-dark"
          >
            Ver desempenho da semana ›
          </Link>
        </div>
      </main>
      <BottomNav items={navParceiro} />
    </>
  );
}
