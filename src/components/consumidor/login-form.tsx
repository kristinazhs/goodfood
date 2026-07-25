"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { signInConsumer, type AuthState } from "@/lib/auth-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signInConsumer,
    {},
  );

  return (
    <form action={action}>
      <div className="mt-6 flex flex-col gap-3.5">
        <Field label="E-mail" name="email" type="email" placeholder="voce@email.com" required />
        <Field label="Senha" name="senha" type="password" placeholder="••••••••" required />
      </div>

      {state.error && (
        <p className="mt-3 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-[14px] bg-brand p-4 text-center text-[15px] font-bold text-white disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
