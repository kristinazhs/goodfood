import Link from "next/link";
import { BagCard } from "@/components/consumidor/bag-card";
import { CategoryRow } from "@/components/consumidor/category-row";
import { SearchBar } from "@/components/consumidor/search-bar";
import { SpotlightCard } from "@/components/consumidor/spotlight-card";
import { IconPin } from "@/components/ui/icons";
import { BottomNav } from "@/components/ui/bottom-nav";
import { getCurrentProfile } from "@/lib/auth";
import { navConsumidor } from "@/lib/nav";
import { escolherDestaque, getSacolasDisponiveis } from "@/lib/sacolas";
import type { CategoriaId, Sacola } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIAS: CategoriaId[] = [
  "tudo",
  "padaria",
  "doceria",
  "refeicao",
  "mercado",
];

// "Pães" and "paes" should both match "Sacola Mista Pães".
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function buscar(sacolas: Sacola[], q: string): Sacola[] {
  const termo = normalizar(q);
  if (!termo) return sacolas;
  return sacolas.filter((s) =>
    normalizar(`${s.nome} ${s.loja}`).includes(termo),
  );
}

export default async function ConsumidorHome({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; busca?: string }>;
}) {
  const [params, todas, sessao] = await Promise.all([
    searchParams,
    getSacolasDisponiveis(),
    getCurrentProfile(),
  ]);

  const cat: CategoriaId = CATEGORIAS.includes(params.cat as CategoriaId)
    ? (params.cat as CategoriaId)
    : "tudo";
  const q = params.q?.trim() ?? "";
  // The field stays open while searching, and while a term is active.
  const buscando = params.busca === "1" || q.length > 0;

  const primeiroNome = sessao?.profile?.nome?.split(" ")[0] ?? null;

  const porCategoria =
    cat === "tudo" ? todas : todas.filter((s) => s.categoria === cat);
  const sacolas = buscar(porCategoria, q);

  // No spotlight unless a real rule fires — see escolherDestaque in sacolas.ts.
  const destaque = escolherDestaque(sacolas);
  const demais = destaque
    ? sacolas.filter((s) => s !== destaque.sacola)
    : sacolas;

  const vazio =
    q.length > 0
      ? `Nenhuma sacola para “${q}”.`
      : cat === "tudo"
        ? "Nenhuma sacola disponível agora."
        : "Nenhuma sacola nesta categoria agora.";

  return (
    <>
      <main className="flex-1">
        <div className="px-5 pt-[14px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[21px] font-semibold leading-[1.2]">
                {primeiroNome ? `Oi, ${primeiroNome} 👋` : "Oi 👋"}
                <br />
                <span className="text-terracotta-dark">a comida boa</span> te
                espera
              </h1>

              {buscando ? (
                <SearchBar q={q} cat={cat} />
              ) : (
                // The origin of the search, in the words the person recognises.
                // Not yet tappable: picking between saved addresses needs an
                // addresses table, which doesn't exist yet.
                <p className="mt-[7px] flex h-6 items-center gap-[5px] text-[13px] font-semibold text-muted">
                  <IconPin active size={14} />
                  Bom Fim, Porto Alegre
                </p>
              )}
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

        <CategoryRow active={cat} q={q} buscando={buscando} />

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
