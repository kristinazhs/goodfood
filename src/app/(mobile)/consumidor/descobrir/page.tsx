import { MapView } from "@/components/consumidor/map-view";
import { BottomNav } from "@/components/ui/bottom-nav";
import { navConsumidor } from "@/lib/nav";
import { getSacolasDisponiveis } from "@/lib/sacolas";

export const dynamic = "force-dynamic";

export default async function Descobrir() {
  const sacolas = await getSacolasDisponiveis();

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

        {sacolas.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-5 text-center text-sm text-muted">
            Nenhuma sacola disponível agora.
          </div>
        ) : (
          <MapView sacolas={sacolas} />
        )}
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
