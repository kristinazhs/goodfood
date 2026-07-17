import Link from "next/link";
import { Field } from "@/components/ui/field";

export default function AdminLogin() {
  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-6 text-center">
        <div className="font-display text-[30px] font-bold text-brand-dark">
          GoodFood
        </div>
        <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.6px] text-muted">
          Admin · Internal team only
        </div>
      </div>

      <div className="rounded-[22px] border-[1.5px] border-sage-line bg-white p-6">
        <h1 className="font-display text-lg font-semibold">Sign in</h1>
        <p className="mt-1 text-[12.5px] leading-[1.5] text-muted">
          Access is role-gated. Business and consumer accounts cannot sign in
          here.
        </p>
        <div className="mt-5 flex flex-col gap-3.5">
          <Field label="Work e-mail" type="email" placeholder="you@goodfood.app" />
          <Field label="Password" type="password" placeholder="••••••••" />
        </div>
        <Link
          href="/admin"
          className="mt-5 block rounded-full bg-brand py-3 text-center text-[13px] font-bold text-white"
        >
          Sign in
        </Link>
      </div>

      <div className="mt-5 text-center text-[11px] text-muted">
        🚧 Prototype · authentication is illustrative, no data is sent
      </div>
    </div>
  );
}
