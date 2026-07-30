"use client";

import Link from "next/link";
import { useState } from "react";
import { IconPin } from "@/components/ui/icons";
import { definirPrincipal } from "@/lib/endereco-actions";
import type { Endereco } from "@/lib/enderecos";

// C1 — the address at the top of the feed. It carried a ▾ from the first
// mockup and did nothing, which is the worst kind of control: it promises
// exactly the thing people want here — "measure this from somewhere else".
//
// Tapping it opens the saved addresses (Casa, Trabalho…) and a way to write a
// new one. Choosing one sets it as principal, so every distance in the app
// moves with it, not just this screen.

export function SeletorEndereco({
  label,
  enderecos,
}: {
  label: string;
  enderecos: Endereco[];
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-expanded={aberto}
        aria-label={`Endereço: ${label}. Trocar`}
        className="mt-[7px] flex h-6 max-w-full items-center gap-[5px] text-[13px] font-semibold text-muted"
      >
        <IconPin active size={14} />
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 text-[#8d8d84]">▾</span>
      </button>

      {aberto && (
        <div className="fixed inset-0 z-[1200]">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-black/25"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[22px] bg-white px-5 pb-6 pt-4 shadow-[0_-2px_24px_rgba(0,0,0,0.18)]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-sage-line" />
            <div className="font-display text-lg font-semibold">
              Medir distâncias de onde?
            </div>
            <p className="mt-1 text-[12.5px] font-medium leading-[1.4] text-muted">
              Vale para o feed, o mapa e o tempo a pé de cada loja.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {enderecos.length === 0 && (
                <p className="rounded-xl bg-[#f7f5ef] px-3.5 py-3 text-[13px] font-medium leading-[1.45] text-muted">
                  Você ainda não salvou nenhum endereço. Por enquanto as
                  distâncias saem do centro de Porto Alegre.
                </p>
              )}

              {enderecos.map((e) => {
                const semCoordenadas = e.lat == null || e.lng == null;
                return (
                  <form
                    key={e.id}
                    action={definirPrincipal}
                    className="contents"
                  >
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="voltar" value="/consumidor" />
                    <button
                      type="submit"
                      disabled={semCoordenadas || e.principal}
                      className={`flex w-full items-center gap-3 rounded-2xl border-[1.5px] px-3.5 py-3 text-left disabled:opacity-60 ${
                        e.principal
                          ? "border-brand bg-sage/40"
                          : "border-sage-line bg-white"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-bold leading-[1.25]">
                          {e.rotulo}
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px] font-medium leading-[1.35] text-muted">
                          {e.endereco}
                        </span>
                        {/* Said out loud: otherwise choosing it would silently
                            keep the distances where they already were. */}
                        {semCoordenadas && (
                          <span className="mt-1 block text-[11.5px] font-semibold leading-[1.3] text-terracotta-dark">
                            Sem localização no mapa — não dá para medir daqui
                          </span>
                        )}
                      </span>
                      {e.principal && (
                        <span className="shrink-0 text-[11.5px] font-bold leading-none text-brand-dark">
                          em uso
                        </span>
                      )}
                    </button>
                  </form>
                );
              })}

              <Link
                href="/consumidor/perfil/enderecos"
                onClick={() => setAberto(false)}
                className="flex h-12 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-sage-line text-[13.5px] font-bold text-brand-dark"
              >
                <span className="text-[17px] leading-none">+</span> Escrever um
                endereço
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
