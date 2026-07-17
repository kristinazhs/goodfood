import Link from "next/link";
import { BagCard } from "@/components/consumidor/bag-card";
import { CategoryRow } from "@/components/consumidor/category-row";
import { SpotlightCard } from "@/components/consumidor/spotlight-card";
import { BottomNav } from "@/components/ui/bottom-nav";
import { sacolas } from "@/lib/mock-data";
import { navConsumidor } from "@/lib/nav";

export default function ConsumidorHome() {
  const destaque = sacolas.find((s) => s.destaque)!;
  const demais = sacolas.filter((s) => !s.destaque);

  return (
    <>
      <main className="flex-1">
        <div className="px-5 pb-3 pt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-[22px] font-semibold leading-[1.15]">
                Oi, Carla 👋
                <br />
                <span className="text-terracotta-dark">A comida boa</span> te
                espera
              </div>
              <div className="mt-1.5 flex items-center gap-[5px] text-xs text-muted">
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

        <CategoryRow />

        <div className="px-5 pb-[9px] pt-1 text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
          ⏰ Acabando agora
        </div>
        <SpotlightCard sacola={destaque} />

        <div className="px-5 pb-[9px] text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
          🛍️ Disponível hoje
        </div>
        <div className="flex flex-col gap-[13px] px-5 pb-6">
          {demais.map((s) => (
            <BagCard key={s.id} sacola={s} />
          ))}
        </div>
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
