import Link from "next/link";
import { redirect } from "next/navigation";
import { PerfilPublicoForm } from "@/components/parceiro/perfil-publico-form";
import { BackButton } from "@/components/ui/back-button";
import { getLoja } from "@/lib/parceiro";

export const dynamic = "force-dynamic";

// H — the row on Loja said "em breve" and led nowhere. This is the page it
// should have led to.

export default async function PerfilPublico() {
  const loja = await getLoja();
  if (!loja) redirect("/parceiro/entrar");

  return (
    <main className="flex flex-1 flex-col px-5 pb-8">
      <div className="flex items-center justify-between pb-1.5 pt-5">
        <BackButton href="/parceiro/perfil" />
        <h1 className="font-display text-lg font-semibold">Perfil público</h1>
        <span className="w-[38px]" />
      </div>

      <p className="mb-5 mt-1 text-[12.5px] font-medium leading-[1.45] text-muted">
        É assim que {loja.nome} aparece para quem procura sacola.{" "}
        <Link
          href={`/loja/${loja.id}`}
          className="font-bold text-brand-dark underline"
        >
          Ver a página
        </Link>
      </p>

      <PerfilPublicoForm
        descricao={loja.descricao}
        fotoUrl={loja.fotoUrl}
        horarios={loja.horarios}
        estabelecimentoId={loja.id}
      />
    </main>
  );
}
