import Link from "next/link";
import { Field } from "@/components/ui/field";

export default function PainelCadastro() {
  return (
    <div className="w-full max-w-[440px]">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="font-display text-[30px] font-bold text-brand-dark"
        >
          GoodFood
        </Link>
        <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.6px] text-muted">
          Painel do Estabelecimento
        </div>
      </div>

      <div className="rounded-[22px] border-[1.5px] border-sage-line bg-white p-6">
        <h1 className="font-display text-lg font-semibold">Criar conta</h1>
        <p className="mt-1 text-[12.5px] leading-[1.5] text-muted">
          A mesma conta vale para o aplicativo e para o painel desktop.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Nome do estabelecimento"
              placeholder="Ex.: Padaria Estrela"
            />
          </div>
          <Field label="CNPJ" placeholder="00.000.000/0001-00" />
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted">
              Categoria
            </span>
            <select className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none focus:border-brand">
              <option>Padaria</option>
              <option>Restaurante</option>
              <option>Supermercado</option>
            </select>
          </label>
          <Field label="Bairro" placeholder="Ex.: Bom Fim" />
          <Field label="Telefone" placeholder="(51) 9 0000-0000" />
          <div className="sm:col-span-2">
            <Field label="E-mail" type="email" placeholder="voce@padaria.com.br" />
          </div>
          <div className="sm:col-span-2">
            <Field label="Senha" type="password" placeholder="Mínimo 8 caracteres" />
          </div>
        </div>
        <Link
          href="/painel"
          className="mt-5 block rounded-full bg-brand py-3 text-center text-[13px] font-bold text-white"
        >
          Criar conta e entrar
        </Link>
        <div className="mt-4 text-center text-[12px] text-muted">
          Já é parceiro?{" "}
          <Link
            href="/painel/entrar"
            className="font-bold text-brand-dark underline"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
