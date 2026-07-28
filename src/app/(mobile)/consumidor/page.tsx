import { BagCard } from "@/components/consumidor/bag-card";
import { FeedConsumidor } from "@/components/consumidor/feed-consumidor";
import { SpotlightCard } from "@/components/consumidor/spotlight-card";
import { BottomNav } from "@/components/ui/bottom-nav";
import { getCurrentProfile } from "@/lib/auth";
import { navConsumidor } from "@/lib/nav";
import { escolherDestaque, getSacolasDisponiveis } from "@/lib/sacolas";
import type { CategoriaId } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIAS: CategoriaId[] = [
  "tudo",
  "padaria",
  "doceria",
  "refeicao",
  "mercado",
];

export default async function ConsumidorHome({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const [params, todas, sessao] = await Promise.all([
    searchParams,
    getSacolasDisponiveis(),
    getCurrentProfile(),
  ]);

  const cat: CategoriaId = CATEGORIAS.includes(params.cat as CategoriaId)
    ? (params.cat as CategoriaId)
    : "tudo";

  const primeiroNome = sessao?.profile?.nome?.split(" ")[0] ?? null;

  const sacolas =
    cat === "tudo" ? todas : todas.filter((s) => s.categoria === cat);

  // No spotlight unless a real rule fires — see escolherDestaque in sacolas.ts.
  const destaque = escolherDestaque(sacolas);
  const demais = destaque
    ? sacolas.filter((s) => s !== destaque.sacola)
    : sacolas;

  const vazio =
    cat === "tudo"
      ? "Nenhuma sacola disponível agora."
      : "Nenhuma sacola nesta categoria agora.";

  return (
    <>
      <main className="flex flex-1 flex-col">
        <FeedConsumidor primeiroNome={primeiroNome} cat={cat} todas={todas}>
          {sacolas.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-muted">
              {vazio}
              <br />
              Volte mais tarde 🌙
            </div>
          ) : (
            <>
              {destaque && (
                <>
                  <div className="flex items-center justify-between px-5 pb-2.5 pt-5">
                    <div className="flex items-center gap-2">
                      <span className="h-[9px] w-[9px] animate-pulse rounded-full bg-terracotta" />
                      <span className="text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-terracotta-dark">
                        {destaque.rotulo}
                      </span>
                    </div>
                    <span className="text-xs font-semibold leading-none text-muted">
                      {destaque.sacola.disponivel === 1
                        ? "1 sacola"
                        : `${destaque.sacola.disponivel} sacolas`}
                    </span>
                  </div>
                  <SpotlightCard sacola={destaque.sacola} />
                </>
              )}

              {demais.length > 0 && (
                <>
                  <div className="px-5 pb-2.5 pt-[22px] text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
                    Disponível hoje · {demais.length}
                  </div>
                  <div className="flex flex-col gap-3 px-5 pb-[18px]">
                    {demais.map((s) => (
                      <BagCard key={s.id} sacola={s} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </FeedConsumidor>
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
