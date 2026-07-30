import Link from "next/link";
import { ParceiroSignupForm } from "@/components/parceiro/signup-form";

export default function CadastroParceiro() {
  return (
    <main className="flex flex-1 flex-col px-5 pb-[22px] pt-4">
      <Link
        href="/"
        aria-label="Voltar"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-sage-line bg-white"
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

      <div className="mt-[18px] text-xs font-bold uppercase leading-none tracking-[0.7px] text-muted">
        Passo 1 de 2
      </div>
      <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.15]">
        Cadastrar meu negócio
      </h1>
      {/* Says up front where the money question went, so its absence doesn't
          read as something being hidden. */}
      <p className="mt-1.5 text-[13px] font-medium leading-[1.45] text-muted">
        Dá para publicar a primeira sacola hoje. Dados bancários só no passo 2,
        antes do primeiro repasse.
      </p>

      <div className="mt-5 flex flex-1 flex-col">
        <ParceiroSignupForm />
      </div>
    </main>
  );
}
