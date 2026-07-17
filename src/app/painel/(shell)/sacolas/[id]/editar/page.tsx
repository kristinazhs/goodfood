import { notFound } from "next/navigation";
import { PageHeader } from "@/components/desktop/page-header";
import { SacolaForm } from "@/components/painel/sacola-form";
import { sacolasLoja } from "@/lib/mock-data";

export default async function EditarSacola({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sacola = sacolasLoja.find((s) => s.id === id);
  if (!sacola) notFound();

  return (
    <>
      <PageHeader
        title={`Editar — ${sacola.nome}`}
        description="Alterações valem só para as unidades ainda não reservadas."
      />
      <SacolaForm sacola={sacola} />
    </>
  );
}
