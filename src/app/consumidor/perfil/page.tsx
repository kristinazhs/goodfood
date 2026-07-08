import Link from "next/link";
import { BottomNav } from "@/components/ui/bottom-nav";
import { navConsumidor } from "@/lib/nav";

const secoes = [
  { emoji: "👤", titulo: "Dados pessoais", sub: "Nome, e-mail e telefone" },
  { emoji: "💳", titulo: "Formas de pagamento", sub: "Pix e cartões salvos" },
  { emoji: "🔔", titulo: "Notificações", sub: "Alertas de sacolas perto de você" },
  { emoji: "📍", titulo: "Endereços", sub: "Bom Fim, Porto Alegre" },
];

export default function PerfilConsumidor() {
  return (
    <>
      <main className="flex-1">
        <div className="px-5 pb-4 pt-6">
          <div className="flex items-center gap-3.5">
            <span className="blob-a flex h-[64px] w-[64px] items-center justify-center bg-sage text-[28px]">
              👤
            </span>
            <div>
              <h1 className="font-display text-xl font-bold">Carla Souza</h1>
              <div className="mt-0.5 text-xs text-muted">
                carla.souza@email.com
              </div>
            </div>
          </div>
        </div>

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
                <span className="block text-[13px] font-bold">{s.titulo}</span>
                <span className="mt-[1px] block text-[11.5px] text-muted">
                  {s.sub}
                </span>
              </span>
              <span className="text-muted">›</span>
            </button>
          ))}
        </div>

        <div className="px-5 pb-6 pt-5">
          <Link
            href="/"
            className="block w-full rounded-[14px] border-[1.5px] border-sage-line bg-white p-[13px] text-center text-[13px] font-bold text-alert"
          >
            Sair da conta
          </Link>
        </div>
      </main>
      <BottomNav items={navConsumidor} />
    </>
  );
}
