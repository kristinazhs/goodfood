import { BagCard } from "@/components/consumidor/bag-card";
import { FeedConsumidor } from "@/components/consumidor/feed-consumidor";
import { SpotlightCard } from "@/components/consumidor/spotlight-card";
import { BottomNav } from "@/components/ui/bottom-nav";
import { getCurrentProfile } from "@/lib/auth";
import { getEnderecos, getOrigem } from "@/lib/enderecos";
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
  searchParams: Promise<{ cat?: string; cancelado?: string }>;
}) {
  // The origin has to be resolved before the sacolas: every distance on the
  // feed is measured from it.
  const origem = await getOrigem();
  const [params, todas, sessao, enderecos] = await Promise.all([
    searchParams,
    getSacolasDisponiveis(origem),
    getCurrentProfile(),
    getEnderecos(),
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

  // Day groups in the order they already come in (janela_fim ascending), so
  // "hoje" leads and "amanhã" follows without a second sort.
  const porDia: [string, typeof demais][] = [];
  for (const s of demais) {
    const grupo = porDia.find(([d]) => d === s.dia);
    if (grupo) grupo[1].push(s);
    else porDia.push([s.dia, [s]]);
  }

  const vazio =
    cat === "tudo"
      ? "Nenhuma sacola disponível agora."
      : "Nenhuma sacola nesta categoria agora.";

  return (
    <>
      <main className="flex flex-1 flex-col">
        <FeedConsumidor
          primeiroNome={primeiroNome}
          cat={cat}
          todas={todas}
          enderecoLabel={origem?.label ?? null}
          enderecos={enderecos}
        >
          {/* Where a cancellation lands: the evening just freed up, so the
              useful next thing is what else is available now. */}
          {params.cancelado === "1" && (
            <div className="mx-5 mt-4 rounded-xl bg-sage px-3.5 py-3">
              <p className="text-[13px] font-bold leading-[1.3] text-brand-dark">
                Reserva cancelada
              </p>
              <p className="mt-1 text-[12.5px] font-medium leading-[1.4] text-brand-dark">
                O reembolso total já foi solicitado. Veja o que mais tem perto
                de você agora.
              </p>
            </div>
          )}

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
                    Sacolas disponíveis · {demais.length}
                  </div>

                  {/* Grouped by day instead of one list under a header that
                      said "hoje". A shop can publish for tomorrow, so that
                      claim can be wrong for a real customer — and the feed
                      would otherwise be empty every evening once today's
                      windows close. Sorted by janela_fim already, so today's
                      group comes first on its own. */}
                  {porDia.map(([dia, doDia]) => (
                    <div key={dia}>
                      <div className="px-5 pb-2 pt-1 text-[12.5px] font-bold capitalize leading-none text-muted">
                        {dia} · {doDia.length}
                      </div>
                      <div className="flex flex-col gap-3 px-5 pb-[18px]">
                        {doDia.map((s) => (
                          <BagCard key={s.id} sacola={s} />
                        ))}
                      </div>
                    </div>
                  ))}
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
