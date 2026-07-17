import { PageHeader } from "@/components/desktop/page-header";
import { SacolaForm } from "@/components/painel/sacola-form";

export default function NovaSacola() {
  return (
    <>
      <PageHeader
        title="Criar sacola"
        description="Monte a oferta do dia — quantidade, preço, janela de retirada e pronto."
      />
      <SacolaForm />
    </>
  );
}
