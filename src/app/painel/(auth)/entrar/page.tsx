import Link from "next/link";
import { Field } from "@/components/ui/field";

export default function PainelEntrar() {
  return (
    <div className="w-full max-w-[400px]">
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
        <h1 className="font-display text-lg font-semibold">Entrar</h1>
        <p className="mt-1 text-[12.5px] leading-[1.5] text-muted">
          Use a mesma conta do aplicativo — seu estabelecimento pode acessar
          pelos dois.
        </p>
        <div className="mt-5 flex flex-col gap-3.5">
          <Field label="E-mail" type="email" placeholder="voce@padaria.com.br" />
          <Field label="Senha" type="password" placeholder="••••••••" />
        </div>
        <Link
          href="/painel"
          className="mt-5 block rounded-full bg-brand py-3 text-center text-[13px] font-bold text-white"
        >
          Entrar no painel
        </Link>
        <div className="mt-4 text-center text-[12px] text-muted">
          Ainda não é parceiro?{" "}
          <Link
            href="/painel/cadastro"
            className="font-bold text-brand-dark underline"
          >
            Criar conta
          </Link>
        </div>
      </div>

      <div className="mt-5 text-center text-[11px] text-muted">
        🚧 Protótipo · o login é ilustrativo, nenhum dado é enviado
      </div>
    </div>
  );
}
