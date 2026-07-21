import { notFound } from "next/navigation";
import { PagamentoClient } from "@/components/consumidor/pagamento-client";
import { BackButton } from "@/components/ui/back-button";
import { getSacolaPorId } from "@/lib/sacolas";

export default async function Pagamento({
  searchParams,
}: {
  searchParams: Promise<{ sacola?: string; qtd?: string }>;
}) {
  const { sacola: sacolaId, qtd: qtdParam } = await searchParams;
  const sacola = await getSacolaPorId(sacolaId ?? "");
  if (!sacola) notFound();
  const qtd = Math.max(1, Number(qtdParam) || 1);

  return (
    <>
      <div className="flex items-center justify-between px-5 pb-1.5 pt-5">
        <BackButton href={`/consumidor/checkout?sacola=${sacola.id}&qtd=${qtd}`} />
        <h1 className="font-display text-lg font-semibold">Pagamento</h1>
        <span className="w-[38px]" />
      </div>
      <PagamentoClient sacola={sacola} qtd={qtd} />
    </>
  );
}
