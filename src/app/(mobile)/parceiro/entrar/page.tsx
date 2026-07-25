import Link from "next/link";
import { ParceiroLoginForm } from "@/components/parceiro/login-form";
import { BackButton } from "@/components/ui/back-button";

export default function EntrarParceiro() {
  return (
    <main className="flex-1 px-5 pb-8">
      <div className="pt-5">
        <BackButton href="/" />
      </div>
      <h1 className="mt-6 font-display text-[26px] font-bold">
        Painel do parceiro
      </h1>
      <p className="mt-1.5 text-[13px] text-muted">
        Entre para gerenciar suas sacolas e acompanhar as vendas.
      </p>

      <ParceiroLoginForm />

      <p className="mt-5 text-center text-xs text-muted">
        Ainda não é parceiro?{" "}
        <Link
          href="/parceiro/cadastro"
          className="font-bold text-brand-dark underline"
        >
          Cadastrar meu negócio
        </Link>
      </p>
    </main>
  );
}
