import { MapView } from "@/components/consumidor/map-view";
import { BottomNav } from "@/components/ui/bottom-nav";
import { sacolas } from "@/lib/mock-data";
import { navConsumidor } from "@/lib/nav";

export default function Descobrir() {
  return (
    <>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="z-10 px-5 pb-3 pt-6">
          <h1 className="font-display text-[22px] font-semibold">
            Descobrir no mapa
          </h1>
          <p className="mt-1 flex items-center gap-[5px] text-xs text-muted">
            📍 Sacolas disponíveis perto de Bom Fim, Porto Alegre
          </p>
        </div>

        <MapView sacolas={sacolas} />
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
