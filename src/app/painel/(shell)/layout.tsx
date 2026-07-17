import { Sidebar } from "@/components/desktop/sidebar";
import { Topbar } from "@/components/desktop/topbar";
import { navPainel } from "@/lib/nav";

export default function PainelShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar
        homeHref="/painel"
        subtitle="Painel do Estabelecimento"
        items={navPainel}
        accountName="Domenica Casa de Pães"
        accountDetail="Bom Fim · Porto Alegre"
        accountEmoji="🥖"
        exitHref="/painel/entrar"
        exitLabel="Sair da conta"
      />
      <div className="flex min-w-0 flex-1 flex-col bg-cream">
        <Topbar
          prototypeNote="Protótipo · dados fictícios · nada é reservado nem cobrado"
          contextLabel="Quinta-feira, 17 de julho · Porto Alegre"
        />
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-8 py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
