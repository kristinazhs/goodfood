import Link from "next/link";
import { SignupForm } from "@/components/consumidor/signup-form";
import { BackButton } from "@/components/ui/back-button";

export default function CadastroConsumidor() {
  return (
    <main className="flex-1 px-5 pb-8">
      <div className="pt-5">
        <BackButton href="/" />
      </div>
      <h1 className="mt-6 font-display text-[26px] font-bold">Criar conta</h1>
      <p className="mt-1.5 text-[13px] text-muted">
        Leva menos de um minuto — e a comida boa agradece.
      </p>

      <SignupForm />

      <p className="mt-5 text-center text-xs text-muted">
        Já tem conta?{" "}
        <Link
          href="/consumidor/entrar"
          className="font-bold text-brand-dark underline"
        >
          Entrar
        </Link>
      </p>
    </main>
  );
}
