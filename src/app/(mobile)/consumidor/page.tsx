import { BagCard } from "@/components/consumidor/bag-card";
import { CategoryRow } from "@/components/consumidor/category-row";
import { SpotlightCard } from "@/components/consumidor/spotlight-card";
import { IconPin } from "@/components/ui/icons";
import { BottomNav } from "@/components/ui/bottom-nav";
import { getCurrentProfile } from "@/lib/auth";
import { ORIGEM } from "@/lib/distancia";
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
      <main className="flex-1">
        <div className="px-5 pt-[14px]">
          <h1 className="font-display text-[21px] font-semibold leading-[1.2]">
            {primeiroNome ? `Oi, ${primeiroNome} 👋` : "Oi 👋"}
            <br />
            <span className="text-terracotta-dark">a comida boa</span> te espera
          </h1>

          {/* The origin every distance on this screen is measured from.
              PLACEHOLDER: the address is the design's, because there's no
              saved-addresses table yet — see ORIGEM in lib/distancia.ts. */}
          <p className="mt-[7px] flex h-6 items-center gap-[5px] text-[13px] font-semibold text-muted">
            <IconPin active size={14} />
            {ORIGEM.label}
            <span className="text-[#8d8d84]">▾</span>
          </p>
        </div>

        <CategoryRow active={cat} />

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
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
