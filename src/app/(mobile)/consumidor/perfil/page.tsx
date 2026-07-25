import Link from "next/link";
import { BottomNav } from "@/components/ui/bottom-nav";
import { signOut } from "@/lib/auth-actions";
import { getCurrentProfile } from "@/lib/auth";
import { navConsumidor } from "@/lib/nav";

export const dynamic = "force-dynamic";

const secoes = [
  { emoji: "👤", titulo: "Dados pessoais", sub: "Nome, e-mail e telefone" },
  { emoji: "💳", titulo: "Formas de pagamento", sub: "Pix e cartões salvos" },
  { emoji: "🔔", titulo: "Notificações", sub: "Alertas de sacolas perto de você" },
  { emoji: "📍", titulo: "Endereços", sub: "Bom Fim, Porto Alegre" },
];

export default async function PerfilConsumidor() {
  const sessao = await getCurrentProfile();

  return (
    <>
      <main className="flex-1">
        <div className="px-5 pb-4 pt-6">
          <div className="flex items-center gap-3.5">
            <span className="blob-a flex h-[64px] w-[64px] items-center justify-center bg-sage text-[28px]">
              👤
            </span>
            <div>
              <h1 className="font-display text-xl font-bold">
                {sessao?.profile?.nome ?? "Visitante"}
              </h1>
              <div className="mt-0.5 text-xs text-muted">
                {sessao?.email ?? "Você não está conectada"}
              </div>
            </div>
          </div>
        </div>

        {sessao ? (
          <>
            <div className="flex flex-col gap-2.5 px-5">
              {secoes.map((s) => (
                <button
                  key={s.titulo}
                  className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-sage-line bg-white p-3.5 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-sage text-base">
                    {s.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-bold">
                      {s.titulo}
                    </span>
                    <span className="mt-[1px] block text-[11.5px] text-muted">
                      {s.sub}
                    </span>
                  </span>
                  <span className="text-muted">›</span>
                </button>
              ))}
            </div>

            <div className="px-5 pb-6 pt-5">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white p-[13px] text-center text-[13px] font-bold text-alert"
                >
                  Sair da conta
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="px-5 pt-4">
            <p className="text-[13px] leading-[1.5] text-muted">
              Entre ou crie uma conta para reservar sacolas e ver seus pedidos.
            </p>
            <Link
              href="/consumidor/entrar"
              className="mt-4 block w-full rounded-[14px] bg-brand p-4 text-center text-[15px] font-bold text-white"
            >
              Entrar
            </Link>
            <Link
              href="/consumidor/cadastro"
              className="mt-2.5 block w-full rounded-[14px] border-[1.5px] border-sage-line bg-white p-[13px] text-center text-[13px] font-bold text-brand-dark"
            >
              Criar conta
            </Link>
          </div>
        )}
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
