import Link from "next/link";
import { AvaliacaoCard } from "@/components/parceiro/avaliacao-card";
import { BottomNav } from "@/components/ui/bottom-nav";
import { navParceiro } from "@/lib/nav";
import { getAvaliacoes } from "@/lib/parceiro";

export const dynamic = "force-dynamic";

// The reviews half of P4 on its own, since the partner nav keeps a separate
// Avaliações tab. Real reviews now — the screen was mock, which is why
// "Responder" did nothing: there was no review to answer.

export default async function Avaliacoes() {
  const { itens, media, total, semResposta } = await getAvaliacoes();

  return (
    <>
      <main className="flex-1 pb-6">
        <div className="px-5 pt-[18px]">
          <h1 className="font-display text-[23px] font-semibold">Avaliações</h1>
          <p className="mt-1 text-[12.5px] font-medium leading-[1.4] text-muted">
            {semResposta > 0
              ? `${semResposta} ${
                  semResposta === 1
                    ? "avaliação ainda sem resposta"
                    : "avaliações ainda sem resposta"
                }.`
              : "Todas as avaliações já foram respondidas."}
          </p>
        </div>

        <div className="flex items-center justify-between px-5 pb-2.5 pt-4">
          <span className="text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
            Suas avaliações
          </span>
          <span className="text-[12.5px] font-semibold leading-none text-muted">
            {media === null
              ? "sem notas ainda"
              : `${media.toFixed(1).replace(".", ",")} · ${total} no total`}
          </span>
        </div>

        {itens.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm leading-[1.5] text-muted">
            Ainda não há avaliações.
            <br />
            Elas aparecem aqui depois que um cliente retira a sacola.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5 px-5">
            {itens.map((a) => (
              <AvaliacaoCard key={a.id} a={a} />
            ))}
          </div>
        )}

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
