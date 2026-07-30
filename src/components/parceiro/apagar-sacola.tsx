"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { encerrarOuApagarListing } from "@/lib/parceiro-actions";

// E/I — take a published sacola down.
//
// Two different acts behind one control, because the honest one depends on
// whether anyone is holding a bag:
//
//   nobody reserved  -> delete it outright; nothing is lost
//   someone reserved -> "encerrar": stop new sales, and the people who
//                       already paid keep their bags and their codes
//
// Deleting under a paying customer would take food they paid for, with no
// refund path wired up yet. The database agrees: orders.listing_id is
// ON DELETE RESTRICT.

function Botao({ apagar }: { apagar: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`h-11 flex-1 rounded-xl text-[13.5px] font-bold text-white disabled:opacity-60 ${
        apagar ? "bg-alert" : "bg-brand"
      }`}
    >
      {pending
        ? "Aguarde…"
        : apagar
          ? "Sim, apagar"
          : "Sim, encerrar vendas"}
    </button>
  );
}

export function ApagarSacola({
  listingId,
  temReservas,
}: {
  listingId: string;
  temReservas: boolean;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const apagar = !temReservas;

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="flex min-h-11 items-center gap-3 rounded-2xl border-[1.5px] border-sage-line bg-white px-[15px] py-3.5 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold leading-[1.3] text-alert">
            {apagar ? "Apagar esta publicação" : "Encerrar vendas"}
          </span>
          <span className="mt-0.5 block text-[12.5px] font-medium leading-[1.35] text-muted">
            {apagar
              ? "Ninguém reservou ainda, então ela sai sem deixar rastro"
              : "Tira do app, e quem já pagou continua com a sacola"}
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border-[1.5px] border-sage-line bg-white p-4">
      <p className="text-sm font-bold leading-[1.3]">
        {apagar ? "Apagar esta publicação?" : "Encerrar as vendas?"}
      </p>
      <p className="mt-1.5 text-[12.5px] font-medium leading-[1.45] text-muted">
        {apagar
          ? "Ela sai do app agora. O modelo continua salvo em Loja, então você pode publicar de novo quando quiser."
          : "Ela sai do app e não recebe novas reservas. Quem já pagou mantém a sacola e o código — você ainda precisa entregar essas."}
      </p>

      <div className="mt-3.5 flex gap-2.5">
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="h-11 flex-1 rounded-xl border-[1.5px] border-sage-line bg-white text-[13.5px] font-bold text-[#4a4a44]"
        >
          Voltar
        </button>
        <form action={encerrarOuApagarListing} className="flex flex-1">
          <input type="hidden" name="listingId" value={listingId} />
          <Botao apagar={apagar} />
        </form>
      </div>
    </div>
  );
}
