import Link from "next/link";
import { ParceiroSignupForm } from "@/components/parceiro/signup-form";
import { BackButton } from "@/components/ui/back-button";

export default function CadastroParceiro() {
  return (
    <main className="flex-1 px-5 pb-8">
      <div className="pt-5">
        <BackButton href="/" />
      </div>
      <h1 className="mt-6 font-display text-[26px] font-bold">
        Cadastrar meu negócio
      </h1>
      <p className="mt-1.5 text-[13px] text-muted">
        Venda o excedente do dia e transforme sobras em faturamento.
      </p>

      <ParceiroSignupForm />

      <p className="mt-5 text-center text-xs text-muted">
        Já é parceiro?{" "}
        <Link
          href="/parceiro/entrar"
          className="font-bold text-brand-dark underline"
        >
          Entrar
        </Link>
      </p>
    </main>
  );
}
