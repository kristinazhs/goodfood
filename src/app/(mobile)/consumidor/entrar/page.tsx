import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { Field } from "@/components/ui/field";

export default function EntrarConsumidor() {
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

      <div className="mt-6 flex flex-col gap-3.5">
        <Field label="E-mail" type="email" placeholder="voce@email.com" />
        <Field label="Senha" type="password" placeholder="••••••••" />
      </div>

      <Link
        href="/consumidor"
        className="mt-6 block w-full rounded-[14px] bg-brand p-4 text-center text-[15px] font-bold text-white"
      >
        Entrar
      </Link>
      <button className="mt-2.5 w-full rounded-[14px] border-[1.5px] border-sage-line bg-white p-[13px] text-[13px] font-bold">
        Entrar com Google
      </button>

      <p className="mt-5 text-center text-xs text-muted">
        Ainda não tem conta?{" "}
        <Link
          href="/consumidor/cadastro"
          className="font-bold text-brand-dark underline"
        >
          Criar conta
        </Link>
      </p>
    </main>
  );
}
