import Link from "next/link";
import { CriarSacolaForm } from "@/components/parceiro/criar-sacola-form";
import { getModelos } from "@/lib/parceiro";

export const dynamic = "force-dynamic";

export default async function PublicarSacola({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string }>;
}) {
  const [{ modelo }, modelos] = await Promise.all([
    searchParams,
    getModelos(),
  ]);

  return (
    <main className="flex flex-1 flex-col pb-0 pt-3.5">
      <div className="flex items-center gap-3 px-5 pb-3">
        <Link
          href="/parceiro"
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
        <h1 className="font-display text-[19px] font-semibold">
          Publicar sacola
        </h1>
      </div>

      <CriarSacolaForm modelos={modelos} modeloInicial={modelo} />
    </main>
  );
}
