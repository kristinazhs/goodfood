import Link from "next/link";
import { BottomNav } from "@/components/ui/bottom-nav";
import { LinhaEmBreve } from "@/components/ui/em-breve";
import { getCurrentProfile } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { getOrigem } from "@/lib/enderecos";
import { navConsumidor } from "@/lib/nav";
import { calcularImpacto, getMeusPedidos } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

// C7 — impact first, because it's what brings someone back; then the rating
// they owe, then their own reviews, then the quiet account rows.

export default async function Perfil({
  searchParams,
}: {
  searchParams: Promise<Record<string, never>>;
}) {
  const origem = await getOrigem();
  const [, sessao, pedidos] = await Promise.all([
    searchParams,
    getCurrentProfile(),
    getMeusPedidos(origem),
  ]);

  const nome = sessao?.profile?.nome ?? "Você";
  const email = sessao?.email ?? "";
  const inicial = nome.trim().charAt(0).toUpperCase() || "?";
  // Same numbers as C6 — one arithmetic, so the app never shows two totals.
  const impacto = calcularImpacto(pedidos);

  return (
    <>
      <main className="flex-1 pb-6">
        <div className="flex items-center gap-3.5 px-5 pt-5">
          <span className="blob-a-active flex h-16 w-16 shrink-0 items-center justify-center bg-sage font-display text-2xl font-bold text-brand-dark">
            {inicial}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-semibold leading-[1.2]">
              {nome}
            </h1>
            <p className="mt-[3px] truncate text-[12.5px] font-medium leading-[1.3] text-muted">
              {email}
            </p>
          </div>
          <Link
            href="/consumidor/perfil/editar"
            className="flex h-[38px] shrink-0 items-center rounded-full border-[1.5px] border-sage-line bg-white px-[13px] text-[12.5px] font-bold text-brand-dark"
          >
            Editar
          </Link>
        </div>

        {/* Impact at the top, not the bottom: it's the reason people return. */}
        {impacto.kg > 0 && (
          <div className="mx-5 mt-[18px] flex items-center gap-3.5 rounded-[18px] bg-sage p-4">
            <div>
              <div className="font-display text-[19px] font-bold text-brand-dark">
                {impacto.kg.toFixed(1).replace(".", ",")} kg
              </div>
              <div className="mt-0.5 text-[12.5px] font-semibold leading-[1.3] text-[#4a4a44]">
                de comida que você salvou
              </div>
            </div>
            <div className="h-[38px] w-px bg-sage-line" />
            <div>
              <div className="font-display text-[19px] font-bold text-brand-dark">
                R$ {Math.round(impacto.economizado)}
              </div>
              <div className="mt-0.5 text-[12.5px] font-semibold leading-[1.3] text-[#4a4a44]">
                economizados em {impacto.ano}
              </div>
            </div>
          </div>
        )}

        <div className="px-5 pb-2.5 pt-[22px] text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
          Conta
        </div>

        <div className="flex flex-col gap-2.5 px-5">
          <Link
            href="/consumidor/perfil/enderecos"
            className="flex min-h-11 items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-[1.3]">
                Endereços salvos
              </span>
              <span className="mt-0.5 block truncate text-[12.5px] font-medium leading-[1.35] text-muted">
                {origem?.label ?? "Nenhum endereço salvo"}
              </span>
            </span>
            <span className="shrink-0 text-base font-bold leading-none text-[#8d8d84]">
              ›
            </span>
          </Link>

          <LinhaEmBreve
            titulo="Formas de pagamento"
            detalhe="Depende da escolha do provedor de pagamento"
          />

          <LinhaEmBreve
            titulo="Notificações"
            detalhe="Sacolas novas por perto, lembrete de retirada"
          />

          {/* These two were mailto: links to contato@goodfood.app, an address
              that nobody reads yet. A tester who writes to it and gets no
              answer learns something worse than "not built": they learn the
              team ignores them. */}
          <LinhaEmBreve
            titulo="Ajuda e contato"
            detalhe="Dúvidas sobre um pedido"
          />

          {/* Feedback about the app is a separate path from rating a shop —
              mixing them contaminates the partner's score with product
              problems they can't fix. */}
          <LinhaEmBreve
            titulo="Enviar feedback do app"
            detalhe="O que faltou, o que atrapalhou"
          />

          {/* Grey, not alarm-coloured, and away from feedback: leaving is
              destructive, not urgent. */}
          <form action={signOut} className="pt-1">
            <button
              type="submit"
              className="h-11 w-full text-[13.5px] font-semibold text-muted"
            >
              Sair
            </button>
          </form>
        </div>
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
