"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { cancelarPedido } from "@/lib/pedido-actions";

// C5 — cancelling is irreversible and takes money back out of a shop's day,
// so it asks once before doing it. The confirmation names what happens to the
// money, because "cancelar" alone doesn't say whether the refund is automatic.

function BotaoConfirmar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 flex-1 rounded-xl bg-alert text-[13.5px] font-bold text-white disabled:opacity-60"
    >
      {pending ? "Cancelando…" : "Sim, cancelar"}
    </button>
  );
}

export function CancelarPedido({
  orderId,
  horaLimite,
}: {
  orderId: string;
  horaLimite: string;
}) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="h-11 w-full text-[13px] font-semibold text-muted underline"
      >
        Cancelar e receber reembolso (até {horaLimite})
      </button>
    );
  }

  return (
    <div className="rounded-2xl border-[1.5px] border-sage-line bg-white p-4">
      <p className="text-sm font-bold leading-[1.3]">Cancelar esta reserva?</p>
      <p className="mt-1.5 text-[12.5px] font-medium leading-[1.45] text-muted">
        O valor volta integralmente para você, e a sacola fica disponível para
        outra pessoa. Depois das {horaLimite} não dá mais para cancelar.
      </p>

      <div className="mt-3.5 flex gap-2.5">
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="h-11 flex-1 rounded-xl border-[1.5px] border-sage-line bg-white text-[13.5px] font-bold text-[#4a4a44]"
        >
          Manter reserva
        </button>
        <form action={cancelarPedido} className="flex flex-1">
          <input type="hidden" name="orderId" value={orderId} />
          <BotaoConfirmar />
        </form>
      </div>
    </div>
  );
}
