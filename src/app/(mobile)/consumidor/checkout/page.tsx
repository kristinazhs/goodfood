import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutClient } from "@/components/consumidor/checkout-client";
import { getSacolaPorId } from "@/lib/sacolas";

export const dynamic = "force-dynamic";

// C4 — summary and payment on one screen. Progress is explicit ("Passo 2 de
// 2"): reserving food against a deadline asks for predictability, not
// suspense.

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<{ sacola?: string; qtd?: string }>;
}) {
  const { sacola: sacolaId, qtd: qtdParam } = await searchParams;
  const sacola = await getSacolaPorId(sacolaId ?? "");
  if (!sacola) notFound();
  const qtd = Math.max(1, Number(qtdParam) || 1);

  return (
    <main className="flex flex-1 flex-col pt-4">
      <div className="flex items-center gap-3 px-5 pb-4">
        <Link
          href={`/consumidor/sacola/${sacola.id}`}
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
        <div className="min-w-0">
          <h1 className="font-display text-[21px] font-semibold leading-[1.2]">
            Confirmar reserva
          </h1>
          <p className="mt-0.5 text-xs font-bold uppercase leading-none tracking-[0.7px] text-muted">
            Passo 2 de 2
          </p>
        </div>
      </div>

      <CheckoutClient sacola={sacola} qtd={qtd} />
    </main>
  );
}
