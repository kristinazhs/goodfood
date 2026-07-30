"use client";

import { useActionState, useState } from "react";
import type { Endereco } from "@/lib/enderecos";
import {
  salvarEndereco,
  type EnderecoState,
} from "@/lib/endereco-actions";

const CAMPO =
  "h-[50px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] font-medium outline-none focus:border-brand";
const ROTULO =
  "mb-[7px] block text-[13px] font-bold leading-none text-[#4a4a44]";

const ROTULOS = ["Casa", "Trabalho", "Outro"];

export function EnderecoForm({
  endereco,
  primeiro,
  onFechar,
}: {
  endereco?: Endereco;
  /** The first address someone saves is their principal one by definition. */
  primeiro: boolean;
  onFechar?: () => void;
}) {
  const [state, action, pending] = useActionState<EnderecoState, FormData>(
    salvarEndereco,
    {},
  );
  const [rotulo, setRotulo] = useState(endereco?.rotulo ?? "Casa");

  return (
    <form action={action} className="rounded-2xl border-[1.5px] border-sage-line bg-white p-4">
      {endereco && <input type="hidden" name="id" value={endereco.id} />}
      <input type="hidden" name="rotulo" value={rotulo} />

      <div className="mb-3.5">
        <span className={ROTULO}>Como chamar</span>
        <div className="flex gap-2">
          {ROTULOS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRotulo(r)}
              aria-pressed={rotulo === r}
              className={`h-10 flex-1 rounded-xl text-[13px] font-bold ${
                rotulo === r
                  ? "bg-brand text-white"
                  : "border-[1.5px] border-sage-line bg-white text-[#4a4a44]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className={ROTULO}>Endereço</span>
        <input
          name="endereco"
          required
          defaultValue={endereco?.endereco ?? ""}
          placeholder="ex. Av. Osvaldo Aranha, 540"
          className={CAMPO}
        />
        <span className="mt-[5px] block text-[12px] font-medium leading-[1.35] text-muted">
          Rua e número, em Porto Alegre. É daqui que medimos a distância até
          cada loja.
        </span>
      </label>

      <label className="mt-3.5 block">
        <span className={ROTULO}>Complemento (opcional)</span>
        <input
          name="complemento"
          defaultValue={endereco?.complemento ?? ""}
          placeholder="ex. apto 302"
          className={CAMPO}
        />
      </label>

      {!primeiro && (
        <label className="mt-3.5 flex items-center gap-2.5">
          <input
            type="checkbox"
            name="principal"
            defaultChecked={endereco?.principal ?? false}
            className="h-[18px] w-[18px] shrink-0 accent-[#1a6b3a]"
          />
          <span className="text-[13px] font-medium leading-[1.35]">
            Usar este endereço para calcular as distâncias
          </span>
        </label>
      )}

      {state.error && (
        <p className="mt-3 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
          {state.error}
        </p>
      )}

      <div className="mt-4 flex gap-2.5">
        {onFechar && (
          <button
            type="button"
            onClick={onFechar}
            className="h-11 flex-1 rounded-xl border-[1.5px] border-sage-line bg-white text-[13.5px] font-bold text-[#4a4a44]"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="h-11 flex-1 rounded-xl bg-brand text-[13.5px] font-bold text-white disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar endereço"}
        </button>
      </div>
    </form>
  );
}
