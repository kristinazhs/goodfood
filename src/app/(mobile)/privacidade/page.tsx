import Link from "next/link";

// Placeholder — see termos/page.tsx.
export default function Privacidade() {
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

      <h1 className="mt-[18px] font-display text-[26px] font-bold leading-[1.15]">
        Política de privacidade
      </h1>
      <p className="mt-3 text-sm leading-[1.6] text-muted">
        A política de privacidade do GoodFood está sendo preparada e será
        publicada aqui antes do lançamento. Hoje o cadastro guarda apenas nome,
        e-mail e senha — nada além disso é coletado.
      </p>
    </main>
  );
}
