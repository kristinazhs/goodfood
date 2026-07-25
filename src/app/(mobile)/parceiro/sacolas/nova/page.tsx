import { CriarSacolaForm } from "@/components/parceiro/criar-sacola-form";
import { BackButton } from "@/components/ui/back-button";

export default function CriarSacola() {
  return (
    <main className="flex-1 px-5 pb-8">
      <div className="flex items-center justify-between pb-1.5 pt-5">
        <BackButton href="/parceiro" />
        <h1 className="font-display text-lg font-semibold">Criar sacola</h1>
        <span className="w-[38px]" />
      </div>

      <CriarSacolaForm />
    </main>
  );
}
