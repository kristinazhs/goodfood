import Link from "next/link";
import { AvaliarForm } from "@/components/consumidor/avaliar-form";
import { BottomNav } from "@/components/ui/bottom-nav";
import { getCurrentProfile } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { getAvaliacaoPendente, getMinhasAvaliacoes } from "@/lib/avaliacoes";
import { navConsumidor } from "@/lib/nav";
import { calcularImpacto, getMeusPedidos } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

// C7 — impact first, because it's what brings someone back; then the rating
// they owe, then their own reviews, then the quiet account rows.

export default async function Perfil({
  searchParams,
}: {
  searchParams: Promise<{ avaliado?: string; erro?: string }>;
}) {
  const [{ avaliado, erro }, sessao, pedidos, pendente, avaliacoes] =
    await Promise.all([
      searchParams,
      getCurrentProfile(),
      getMeusPedidos(),
      getAvaliacaoPendente(),
      getMinhasAvaliacoes(),
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

        {avaliado && (
          <p className="mx-5 mt-4 rounded-xl bg-sage px-3.5 py-3 text-[13px] font-bold text-brand-dark">
            Obrigado! Sua avaliação ajuda a loja e quem vem depois.
          </p>
        )}
        {erro && (
          <p className="mx-5 mt-4 rounded-xl bg-alert-bg px-3.5 py-3 text-[13px] font-semibold text-alert">
            Não foi possível salvar a avaliação. Tente novamente.
          </p>
        )}

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

        {pendente && (
          <>
            <div className="px-5 pb-2.5 pt-[22px] text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
              Avaliar retirada
            </div>
            <div className="px-5">
              <AvaliarForm pendente={pendente} />
            </div>
          </>
        )}

        {avaliacoes.length > 0 && (
          <>
            <div className="px-5 pb-2.5 pt-[22px] text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
              Suas avaliações · {avaliacoes.length}
            </div>
            <div className="flex flex-col gap-2.5 px-5">
              {/* By shop, exactly as the partner sees them on P4. */}
              {avaliacoes.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border-[1.5px] border-sage-line bg-white p-[13px]"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="min-w-0 truncate text-[13.5px] font-bold leading-[1.3]">
                      {a.loja}
                    </span>
                    <span className="shrink-0 text-[12.5px] font-medium leading-none text-muted">
                      {a.quando}
                    </span>
                  </div>
                  <div className="mt-[5px] text-[13px] font-bold leading-none tracking-[1px] text-terracotta">
                    {"★".repeat(a.nota)}
                    {"☆".repeat(5 - a.nota)}
                  </div>
                  {a.comentario && (
                    <p className="mt-2 text-[13px] leading-[1.5] text-[#4a4a44]">
                      {a.comentario}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="px-5 pb-2.5 pt-[22px] text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
          Conta
        </div>

        <div className="flex flex-col gap-2.5 px-5">
          {/* No chevron where there's nowhere to go yet. */}
          <div className="rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5">
            <div className="text-sm font-bold leading-[1.3]">
              Endereços salvos
            </div>
            <div className="mt-0.5 text-[12.5px] font-medium leading-[1.35] text-muted">
              Em breve — hoje a busca parte de Bom Fim
            </div>
          </div>

          <div className="rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5">
            <div className="text-sm font-bold leading-[1.3]">
              Formas de pagamento
            </div>
            <div className="mt-0.5 text-[12.5px] font-medium leading-[1.35] text-muted">
              Em breve — nenhuma cobrança real acontece ainda
            </div>
          </div>

          <div className="rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5">
            <div className="text-sm font-bold leading-[1.3]">Notificações</div>
            <div className="mt-0.5 text-[12.5px] font-medium leading-[1.35] text-muted">
              Sacolas novas por perto, lembrete de retirada · em breve
            </div>
          </div>

          <a
            href="mailto:contato@goodfood.app?subject=Ajuda%20com%20um%20pedido"
            className="flex min-h-11 items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-[1.3]">
                Ajuda e contato
              </span>
              <span className="mt-0.5 block truncate text-[12.5px] font-medium leading-[1.35] text-muted">
                Dúvidas sobre um pedido
              </span>
            </span>
            <span className="shrink-0 text-base font-bold leading-none text-[#8d8d84]">
              ›
            </span>
          </a>

          {/* Feedback about the app is a separate path from rating a shop —
              mixing them contaminates the partner's score with product
              problems they can't fix. */}
          <a
            href="mailto:contato@goodfood.app?subject=Feedback%20do%20app"
            className="flex min-h-11 items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-[1.3]">
                Enviar feedback do app
              </span>
              <span className="mt-0.5 block truncate text-[12.5px] font-medium leading-[1.35] text-muted">
                O que faltou, o que atrapalhou — chega direto no time
              </span>
            </span>
            <span className="shrink-0 text-base font-bold leading-none text-[#8d8d84]">
              ›
            </span>
          </a>

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
