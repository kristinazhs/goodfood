import { DadosBancariosForm } from "@/components/parceiro/dados-bancarios-form";
import { BackButton } from "@/components/ui/back-button";
import { getDadosBancarios } from "@/lib/parceiro";

export const dynamic = "force-dynamic";

// B — where the money goes. Stored in its own table (0019), readable only by
// the shop that owns it: establishments is world-readable, so an account
// number there would have been published.

export default async function Repasse() {
  const { dados } = await getDadosBancarios();

  return (
    <main className="flex flex-1 flex-col px-5 pb-8">
      <div className="flex items-center justify-between pb-1.5 pt-5">
        <BackButton href="/parceiro/perfil" />
        <h1 className="font-display text-lg font-semibold">Repasse</h1>
        <span className="w-[38px]" />
      </div>

      {/* Said plainly rather than implied: nothing is paid out on this yet,
          and pretending otherwise would be the worst kind of placeholder. */}
      <div className="mb-5 mt-3 rounded-xl border-[1.5px] border-[#e8c37a] bg-[#faf1dc] px-3.5 py-3">
        <p className="text-[13px] font-bold leading-[1.3] text-[#8a6a14]">
          Ainda não fazemos repasses
        </p>
        <p className="mt-1 text-[12.5px] font-medium leading-[1.45] text-[#8a6a14]">
          O meio de pagamento do GoodFood ainda está sendo definido. Você pode
          deixar seus dados prontos aqui — eles ficam visíveis só para a sua
          loja — mas nenhum valor é transferido por enquanto.
        </p>
      </div>

      <DadosBancariosForm dados={dados} />
    </main>
  );
}
