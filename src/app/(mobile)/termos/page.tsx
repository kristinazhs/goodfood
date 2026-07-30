import Link from "next/link";
import { AvisoDemo } from "@/components/ui/em-breve";

// Placeholder. The consent checkbox on C0b links here, so the link has to
// lead somewhere real — but the actual terms are a legal document that has
// to be written before launch, not invented here.
export default function Termos() {
  return (
    <main className="flex-1 px-5 pb-8 pt-4">
      <Link
        href="/consumidor/cadastro"
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
        Termos de uso
      </h1>
      <AvisoDemo titulo="Documento ainda não escrito">
        Esta página não tem valor legal hoje. Não aceite nada com base nela.
      </AvisoDemo>
      <p className="text-sm leading-[1.6] text-muted">
        Os termos de uso do GoodFood estão sendo preparados e serão publicados
        aqui antes do lançamento. Enquanto isso, o aplicativo é um protótipo:
        os dados são fictícios e nenhuma reserva gera cobrança real.
      </p>
    </main>
  );
}
