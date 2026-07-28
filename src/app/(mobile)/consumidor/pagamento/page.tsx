import { redirect } from "next/navigation";

// C4 merged the summary and the payment step into /consumidor/checkout.
// This route stays only so an old link or a back-button doesn't 404.
export default async function PagamentoLegado({
  searchParams,
}: {
  searchParams: Promise<{ sacola?: string; qtd?: string }>;
}) {
  const { sacola, qtd } = await searchParams;
  const params = new URLSearchParams();
  if (sacola) params.set("sacola", sacola);
  if (qtd) params.set("qtd", qtd);
  redirect(`/consumidor/checkout?${params.toString()}`);
}
