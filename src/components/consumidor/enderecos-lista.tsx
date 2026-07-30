"use client";

import { useState } from "react";
import { EnderecoForm } from "@/components/consumidor/endereco-form";
import {
  definirPrincipal,
  removerEndereco,
} from "@/lib/endereco-actions";
import type { Endereco } from "@/lib/enderecos";

// C7 — the list of saved addresses. The one marked principal is the origin
// for every distance and walking time in the app, so it is labelled as such
// rather than just highlighted: "Principal" alone wouldn't say what it does.

export function EnderecosLista({ enderecos }: { enderecos: Endereco[] }) {
  const [adicionando, setAdicionando] = useState(enderecos.length === 0);
  const [editando, setEditando] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2.5">
      {enderecos.map((e) =>
        editando === e.id ? (
          <EnderecoForm
            key={e.id}
            endereco={e}
            primeiro={enderecos.length === 1}
            onFechar={() => setEditando(null)}
          />
        ) : (
          <div
            key={e.id}
            className={`rounded-2xl border-[1.5px] bg-white p-[13px] ${
              e.principal ? "border-brand" : "border-sage-line"
            }`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-bold leading-none">
                    {e.rotulo}
                  </span>
                  {e.principal && (
                    <span className="inline-flex h-[19px] items-center rounded-md bg-sage px-1.5 text-[11px] font-bold leading-none text-brand-dark">
                      distâncias daqui
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[13px] leading-[1.4] text-[#4a4a44]">
                  {e.endereco}
                  {e.complemento ? ` · ${e.complemento}` : ""}
                </p>
                {/* Said out loud, because otherwise the distances silently
                    fall back to the city centre and look simply wrong. */}
                {(e.lat == null || e.lng == null) && (
                  <p className="mt-1.5 text-[12px] font-semibold leading-[1.35] text-terracotta-dark">
                    Não conseguimos localizar este endereço no mapa, então as
                    distâncias não saem dele. Tente incluir o número.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {!e.principal && e.lat != null && e.lng != null && (
                <form action={definirPrincipal} className="flex-1">
                  <input type="hidden" name="id" value={e.id} />
                  <button
                    type="submit"
                    className="h-10 w-full rounded-xl bg-sage text-[13px] font-bold text-brand-dark"
                  >
                    Usar este
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={() => setEditando(e.id)}
                className="h-10 flex-1 rounded-xl border-[1.5px] border-sage-line bg-white text-[13px] font-bold text-[#4a4a44]"
              >
                Editar
              </button>
              <form action={removerEndereco} className="shrink-0">
                <input type="hidden" name="id" value={e.id} />
                <button
                  type="submit"
                  className="h-10 rounded-xl border-[1.5px] border-sage-line bg-white px-3.5 text-[13px] font-bold text-muted"
                >
                  Remover
                </button>
              </form>
            </div>
          </div>
        ),
      )}

      {adicionando ? (
        <EnderecoForm
          primeiro={enderecos.length === 0}
          onFechar={
            enderecos.length === 0 ? undefined : () => setAdicionando(false)
          }
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdicionando(true)}
          className="flex h-12 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-sage-line text-[13.5px] font-bold text-brand-dark"
        >
          <span className="text-[17px] leading-none">+</span> Novo endereço
        </button>
      )}
    </div>
  );
}
