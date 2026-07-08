import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { Field } from "@/components/ui/field";

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

      <div className="mt-6 flex flex-col gap-3.5">
        <Field label="Nome do negócio" placeholder="Ex.: Domenica Casa de Pães" />
        <Field label="CNPJ" placeholder="00.000.000/0001-00" />
        <Field label="Endereço" placeholder="Rua, número — bairro" />
        <div>
          <span className="mb-1.5 block text-xs font-bold text-muted">
            Categoria
          </span>
          <select className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none focus:border-brand">
            <option>Padaria</option>
            <option>Restaurante</option>
            <option>Supermercado</option>
          </select>
        </div>
        <Field label="E-mail" type="email" placeholder="loja@email.com" />
        <Field label="Telefone" type="tel" placeholder="(51) 3333-3333" />
        <Field label="Senha" type="password" placeholder="Mínimo 8 caracteres" />
      </div>

      <Link
        href="/parceiro"
        className="mt-6 block w-full rounded-[14px] bg-brand p-4 text-center text-[15px] font-bold text-white"
      >
        Cadastrar negócio
      </Link>

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
