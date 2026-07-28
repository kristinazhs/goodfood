import Link from "next/link";
import { SignupForm } from "@/components/consumidor/signup-form";

export default function CadastroConsumidor() {
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

      <h1 className="mt-[18px] font-display text-[26px] font-bold leading-[1.15]">
        Criar sua conta
      </h1>
      {/* Explains the ask instead of just making it. */}
      <p className="mt-1.5 text-[13px] font-medium leading-[1.45] text-muted">
        Você só precisa de conta para reservar uma sacola.
      </p>

      <SignupForm />
    </main>
  );
}
