import { MapView } from "@/components/consumidor/map-view";
import { BottomNav } from "@/components/ui/bottom-nav";
import { navConsumidor } from "@/lib/nav";
import { getSacolasDisponiveis } from "@/lib/sacolas";

export const dynamic = "force-dynamic";

export default async function Descobrir() {
  const sacolas = await getSacolasDisponiveis();

  return (
    <>
      {/* Full-bleed map: the header floats over it. The old fixed
          title + subtitle block spent ~90px on the one element that
          matters least here. */}
      <main className="flex flex-1 flex-col overflow-hidden">
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
