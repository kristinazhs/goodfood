import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { Field } from "@/components/ui/field";

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

      <div className="mt-6 flex flex-col gap-3.5">
        <Field label="E-mail" type="email" placeholder="loja@email.com" />
        <Field label="Senha" type="password" placeholder="••••••••" />
      </div>

      <Link
        href="/parceiro"
        className="mt-6 block w-full rounded-[14px] bg-brand p-4 text-center text-[15px] font-bold text-white"
      >
        Entrar
      </Link>

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
