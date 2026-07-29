"use client";

import { useActionState, useRef, useState } from "react";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import type { Horarios } from "@/lib/horarios";
import {
  salvarPerfilPublico,
  type PublishState,
} from "@/lib/parceiro-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase";

// H — what a customer sees before deciding to trust a shop with dinner.
// Same weekday editor as signup, so hours are edited the way they were
// entered; the schedule is what Hoje reads to say "aberta até 19h30".

const DIAS = [
  { id: "seg", label: "Seg" },
  { id: "ter", label: "Ter" },
  { id: "qua", label: "Qua" },
  { id: "qui", label: "Qui" },
  { id: "sex", label: "Sex" },
  { id: "sab", label: "Sáb" },
  { id: "dom", label: "Dom" },
];

interface Horario {
  aberto: boolean;
  inicio: string;
  fim: string;
}

const CAMPO =
  "h-[50px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] font-medium outline-none focus:border-brand";
const ROTULO =
  "mb-[7px] block text-[13px] font-bold leading-none text-[#4a4a44]";

function normalizar(h: Horarios): Record<string, Horario> {
  return Object.fromEntries(
    DIAS.map((d) => {
      const v = h[d.id as keyof Horarios];
      return [
        d.id,
        {
          aberto: v?.aberto ?? d.id !== "dom",
          inicio: v?.inicio ?? "07:00",
          fim: v?.fim ?? "19:30",
        },
      ];
    }),
  );
}

export function PerfilPublicoForm({
  descricao: descricaoInicial,
  fotoUrl: fotoInicial,
  horarios: horariosIniciais,
}: {
  descricao: string | null;
  fotoUrl: string | null;
  horarios: Horarios;
}) {
  const [state, action, pending] = useActionState<PublishState, FormData>(
    salvarPerfilPublico,
    {},
  );

  const [descricao, setDescricao] = useState(descricaoInicial ?? "");
  const [fotoUrl, setFotoUrl] = useState(fotoInicial ?? "");
  const [horarios, setHorarios] = useState(normalizar(horariosIniciais));
  const [enviando, setEnviando] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const arquivo = useRef<HTMLInputElement>(null);

  function alterar(id: string, patch: Partial<Horario>) {
    setHorarios((h) => ({ ...h, [id]: { ...h[id], ...patch } }));
  }

  async function enviarFoto(file: File) {
    setErroFoto(null);
    if (file.size > 5_000_000) {
      setErroFoto("Imagem muito grande (máx. 5 MB).");
      return;
    }
    setEnviando(true);
    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const caminho = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("lojas")
      .upload(caminho, file, { upsert: false, contentType: file.type });
    setEnviando(false);
    if (error) {
      setErroFoto("Não foi possível enviar a foto. Tente outra imagem.");
      return;
    }
    const { data } = supabase.storage.from("lojas").getPublicUrl(caminho);
    setFotoUrl(data.publicUrl);
  }

  return (
    <form action={action} className="flex flex-1 flex-col">
      <input type="hidden" name="fotoUrl" value={fotoUrl} />
      <input type="hidden" name="horarios" value={JSON.stringify(horarios)} />

      {/* Foto */}
      <div className="flex items-stretch gap-3">
        <FotoSacola src={fotoUrl || null} size={96} radius={16} legenda={"foto\nloja"} alt="" />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <span className={ROTULO}>Foto da loja</span>
          <p className="mb-2 text-[12.5px] font-medium leading-[1.4] text-muted">
            A fachada ou a vitrine. É a primeira coisa que o cliente vê.
          </p>
          <input
            ref={arquivo}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) enviarFoto(f);
            }}
          />
          <button
            type="button"
            onClick={() => arquivo.current?.click()}
            disabled={enviando}
            className="h-10 self-start rounded-xl border-[1.5px] border-sage-line bg-white px-3.5 text-[13px] font-bold text-brand-dark disabled:opacity-60"
          >
            {enviando ? "Enviando…" : fotoUrl ? "Trocar foto" : "Enviar foto"}
          </button>
          {erroFoto && (
            <p className="mt-1.5 text-[12px] font-semibold text-alert">
              {erroFoto}
            </p>
          )}
        </div>
      </div>

      {/* Descrição */}
      <label className="mt-[18px] block">
        <span className={ROTULO}>Descrição</span>
        <textarea
          name="descricao"
          rows={4}
          maxLength={400}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Conte em duas frases o que sua loja faz e o que costuma ter na sacola."
          className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white p-3.5 text-[14.5px] font-medium leading-[1.5] outline-none focus:border-brand"
        />
        <span className="mt-[5px] block text-[12px] font-medium text-muted">
          {descricao.length}/400
        </span>
      </label>

      {/* Horários */}
      <div className="mt-[18px]">
        <span className={ROTULO}>Horário de funcionamento</span>
        <p className="mb-2.5 text-[12.5px] font-medium leading-[1.4] text-muted">
          É o que decide se a loja aparece como aberta, e o que avisa quando
          uma sacola cai fora do horário.
        </p>

        <div className="flex flex-col gap-2">
          {DIAS.map((d) => {
            const h = horarios[d.id];
            return (
              <div
                key={d.id}
                className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-sage-line bg-white px-3 py-2.5"
              >
                <span className="w-9 shrink-0 text-[13px] font-bold">
                  {d.label}
                </span>

                {h.aberto ? (
                  <span className="flex min-w-0 flex-1 items-center gap-1.5">
                    <input
                      type="time"
                      value={h.inicio}
                      aria-label={`Abre ${d.label}`}
                      onChange={(e) => alterar(d.id, { inicio: e.target.value })}
                      className="min-w-0 flex-1 rounded-lg border-[1.5px] border-sage-line px-2 py-1.5 text-[13px] font-medium outline-none focus:border-brand"
                    />
                    <span className="text-[13px] text-muted">–</span>
                    <input
                      type="time"
                      value={h.fim}
                      aria-label={`Fecha ${d.label}`}
                      onChange={(e) => alterar(d.id, { fim: e.target.value })}
                      className="min-w-0 flex-1 rounded-lg border-[1.5px] border-sage-line px-2 py-1.5 text-[13px] font-medium outline-none focus:border-brand"
                    />
                  </span>
                ) : (
                  <span className="flex-1 text-[13px] font-medium text-muted">
                    Fechado
                  </span>
                )}

                <button
                  type="button"
                  role="switch"
                  aria-checked={h.aberto}
                  aria-label={`${d.label} aberto`}
                  onClick={() => alterar(d.id, { aberto: !h.aberto })}
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                    h.aberto ? "bg-brand" : "bg-sage-line"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white transition-transform ${
                      h.aberto ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {state.error && (
        <p className="mt-4 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || enviando}
        className="mt-6 h-[52px] w-full rounded-[14px] bg-brand text-base font-bold text-white disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar perfil público"}
      </button>
    </form>
  );
}
