import { EnderecosLista } from "@/components/consumidor/enderecos-lista";
import { BackButton } from "@/components/ui/back-button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { getEnderecos } from "@/lib/enderecos";
import { navConsumidor } from "@/lib/nav";

export const dynamic = "force-dynamic";

// C7 — saved addresses. PENDENCIAS called this the highest-leverage item on
// the list, and it was right: it's what makes "450 m" mean anything, and it's
// what the map's radius filter will need.

export default async function Enderecos({
  searchParams,
}: {
  searchParams: Promise<{
    salvo?: string;
    principal?: string;
    removido?: string;
  }>;
}) {
  const [{ salvo, principal, removido }, enderecos] = await Promise.all([
    searchParams,
    getEnderecos(),
  ]);

  const aviso =
    principal === "1"
      ? "Pronto. As distâncias agora saem deste endereço."
      : salvo === "1"
        ? "Endereço salvo."
        : removido === "1"
          ? "Endereço removido."
          : null;

  return (
    <>
      <main className="flex-1 px-5 pb-6">
        <div className="flex items-center justify-between pb-1.5 pt-5">
          <BackButton href="/consumidor/perfil" />
          <h1 className="font-display text-lg font-semibold">
            Endereços salvos
          </h1>
          <span className="w-[38px]" />
        </div>

        <p className="mb-4 mt-1 text-[12.5px] font-medium leading-[1.45] text-muted">
          As distâncias e o tempo a pé de todas as telas são medidos a partir
          do endereço marcado como principal.
        </p>

        {aviso && (
          <p className="mb-4 rounded-xl bg-sage px-3.5 py-3 text-[13px] font-bold leading-[1.35] text-brand-dark">
            {aviso}
          </p>
        )}

        <EnderecosLista enderecos={enderecos} />
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
