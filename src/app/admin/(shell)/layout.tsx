import { Sidebar } from "@/components/desktop/sidebar";
import { Topbar } from "@/components/desktop/topbar";
import { navAdmin } from "@/lib/nav";

export default function AdminShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar
        homeHref="/admin"
        subtitle="Admin · Internal"
        items={navAdmin}
        accountName="Kristina Z."
        accountDetail="admin@goodfood.app"
        accountEmoji="🌱"
        exitHref="/admin/login"
        exitLabel="Sign out"
      />
      <div className="flex min-w-0 flex-1 flex-col bg-cream">
        <Topbar
          prototypeNote="Prototype · seed data · internal tool"
          contextLabel="Thursday, July 17 · Porto Alegre"
        />
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-8 py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
