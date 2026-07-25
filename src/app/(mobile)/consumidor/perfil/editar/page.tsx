import { redirect } from "next/navigation";
import { PerfilEditForm } from "@/components/consumidor/perfil-edit-form";
import { BackButton } from "@/components/ui/back-button";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditarPerfil() {
  const sessao = await getCurrentProfile();
  if (!sessao) redirect("/consumidor/entrar");

  return (
    <main className="flex-1 px-5 pb-8">
      <div className="flex items-center justify-between pb-1.5 pt-5">
        <BackButton href="/consumidor/perfil" />
        <h1 className="font-display text-lg font-semibold">Dados pessoais</h1>
        <span className="w-[38px]" />
      </div>

      <PerfilEditForm
        nome={sessao.profile?.nome ?? ""}
        telefone={sessao.profile?.telefone ?? ""}
        email={sessao.email ?? ""}
      />
    </main>
  );
}
