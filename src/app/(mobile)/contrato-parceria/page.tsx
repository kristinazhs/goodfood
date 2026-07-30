import Link from "next/link";
import { AvisoDemo } from "@/components/ui/em-breve";

// Placeholder — the partner signup links here from its consent checkbox, so
// the link has to lead somewhere real. The contract itself is a legal
// document that has to be written before launch, not invented here.
export default function ContratoParceria() {
  return (
    <main className="flex-1 px-5 pb-8 pt-4">
      <Link
        href="/parceiro/cadastro"
        aria-label="Voltar"
        className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-sage-line bg-white"
      >
        <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
          <path
            d="M13.5 4.5 7 11l6.5 6.5"
            fill="none"
            stroke="#23231f"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      </Link>

      <h1 className="mt-[18px] mb-3 font-display text-[26px] font-bold leading-[1.15]">
        Contrato de parceria
      </h1>
      <AvisoDemo titulo="Contrato ainda não escrito">
        Nada aqui obriga ninguém. A taxa de comissão ainda não foi definida, e
        nenhum repasse acontece.
      </AvisoDemo>
      <p className="text-sm leading-[1.6] text-muted">
        O contrato de parceria do GoodFood está sendo preparado e será
        publicado aqui antes do lançamento. Ele detalhará a comissão por sacola
        vendida, o prazo de repasse e as responsabilidades de cada lado.
      </p>
      <p className="mt-3 text-sm leading-[1.6] text-muted">
        Hoje o aplicativo é um protótipo: os dados são fictícios, nenhuma
        reserva gera cobrança real e nenhum repasse é feito.
      </p>
    </main>
  );
}
