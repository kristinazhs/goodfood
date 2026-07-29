import Link from "next/link";
import { LoginForm } from "@/components/consumidor/login-form";
import { BackButton } from "@/components/ui/back-button";

export default async function EntrarConsumidor({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const paraCadastro = next
    ? `/consumidor/cadastro?next=${encodeURIComponent(next)}`
    : "/consumidor/cadastro";

  return (
    <main className="flex-1 px-5 pb-8">
      <div className="pt-5">
        <BackButton href="/" />
      </div>
      <h1 className="mt-6 font-display text-[26px] font-bold">
        Bem-vinda de volta 👋
      </h1>
      <p className="mt-1.5 text-[13px] text-muted">
        Entre para encontrar sacolas surpresa perto de você.
      </p>

      <LoginForm next={next} />

      <p className="mt-5 text-center text-xs text-muted">
        Ainda não tem conta?{" "}
        <Link
          href={paraCadastro}
          className="font-bold text-brand-dark underline"
        >
          Criar conta
        </Link>
      </p>
    </main>
  );
}
