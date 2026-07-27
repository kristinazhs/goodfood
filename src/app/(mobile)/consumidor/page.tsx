import Link from "next/link";
import { BagCard } from "@/components/consumidor/bag-card";
import { CategoryRow } from "@/components/consumidor/category-row";
import { SpotlightCard } from "@/components/consumidor/spotlight-card";
import { BottomNav } from "@/components/ui/bottom-nav";
import { getCurrentProfile } from "@/lib/auth";
import { navConsumidor } from "@/lib/nav";
import { escolherDestaque, getSacolasDisponiveis } from "@/lib/sacolas";
import type { CategoriaId } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIAS: CategoriaId[] = ["tudo", "padaria", "refeicao", "mercado"];

export default async function ConsumidorHome({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const [{ cat: catParam }, todas, sessao] = await Promise.all([
    searchParams,
    getSacolasDisponiveis(),
    getCurrentProfile(),
  ]);
  const cat: CategoriaId = CATEGORIAS.includes(catParam as CategoriaId)
    ? (catParam as CategoriaId)
    : "tudo";

  const primeiroNome = sessao?.profile?.nome?.split(" ")[0] ?? null;
  const sacolas =
    cat === "tudo" ? todas : todas.filter((s) => s.categoria === cat);
  // No spotlight unless a real rule fires — see escolherDestaque in sacolas.ts.
  const destaque = escolherDestaque(sacolas);
  const demais = destaque
    ? sacolas.filter((s) => s !== destaque.sacola)
    : sacolas;

  return (
    <>
      <main className="flex-1">
        <div className="px-5 pb-3 pt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-[22px] font-semibold leading-[1.15]">
                {primeiroNome ? `Oi, ${primeiroNome} 👋` : "Oi 👋"}
                <br />
                <span className="text-terracotta-dark">A comida boa</span> te
                espera
              </div>
              <div className="mt-1.5 flex items-center gap-[5px] text-[13px] font-medium text-muted">
                📍 Bom Fim, Porto Alegre
              </div>
            </div>
            <Link
              href="/consumidor/perfil"
              aria-label="Perfil"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-sage-line bg-sage text-base"
            >
              👤
            </Link>
          </div>
        </div>

        <CategoryRow active={cat} />

        {sacolas.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-muted">
            {cat === "tudo"
              ? "Nenhuma sacola disponível agora."
              : "Nenhuma sacola nesta categoria agora."}
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
