"use client";

import { useActionState, useRef, useState } from "react";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import { brl } from "@/lib/format";
import {
  publicarSacola,
  salvarModelo,
  type PublishState,
} from "@/lib/parceiro-actions";
import type { Modelo } from "@/lib/parceiro";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const TIPOS = [
  { id: "padaria", label: "Padaria" },
  { id: "doceria", label: "Doceria" },
  { id: "refeicao", label: "Refeição" },
  { id: "mercado", label: "Mercado" },
];

const ALERGENOS = ["gluten", "leite", "ovos", "nozes", "soja", "peixe"];
const ROTULO_ALERGENO: Record<string, string> = {
  gluten: "Glúten",
  leite: "Leite",
  ovos: "Ovos",
  nozes: "Nozes",
  soja: "Soja",
  peixe: "Peixe",
};

interface Conteudo {
  label: string;
  tag: string;
}

function parseNum(v: string): number {
  const s = v.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/** 27.9 -> "27,90" — money always shows both decimals in the field. */
function paraCampo(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

const CAMPO =
  "h-[50px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] font-medium outline-none focus:border-brand";
const ROTULO = "mb-[7px] block text-[13px] font-bold leading-none text-[#4a4a44]";

export function CriarSacolaForm({
  modelos,
  salvo = false,
}: {
  modelos: Modelo[];
  salvo?: boolean;
}) {
  const [state, action, pending] = useActionState<PublishState, FormData>(
    publicarSacola,
    {},
  );
  const [estadoModelo, acaoModelo, salvando] = useActionState<
    PublishState,
    FormData
  >(salvarModelo, {});

  const [bagId, setBagId] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("padaria");
  const [precoOriginal, setPrecoOriginal] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState(5);
  const [inicio, setInicio] = useState("18:00");
  const [fim, setFim] = useState("19:00");
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [alergenos, setAlergenos] = useState<string[]>([]);
  const [fotoUrl, setFotoUrl] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const arquivo = useRef<HTMLInputElement>(null);

  function aplicarModelo(m: Modelo) {
    setBagId(m.bagId);
    setNome(m.nome);
    setCategoria(m.categoria);
    setPreco(paraCampo(m.preco));
    setPrecoOriginal(m.precoOriginal != null ? paraCampo(m.precoOriginal) : "");
    setQuantidade(m.quantidade);
    setInicio(m.janelaInicio);
    setFim(m.janelaFim);
    setConteudos(m.conteudos);
    setAlergenos(m.alergenos);
    setFotoUrl(m.fotoUrl ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function enviarFoto(file: File) {
    setErroFoto(null);
    if (file.size > 5_000_000) {
      setErroFoto("Imagem muito grande (máx. 5 MB).");
      return;
    }
    setEnviandoFoto(true);
    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const caminho = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("sacolas")
      .upload(caminho, file, { upsert: false, contentType: file.type });
    setEnviandoFoto(false);
    if (error) {
      setErroFoto("Não foi possível enviar a foto. Tente outra imagem.");
      return;
    }
    const { data } = supabase.storage.from("sacolas").getPublicUrl(caminho);
    setFotoUrl(data.publicUrl);
  }

  const pO = parseNum(precoOriginal);
  const p = parseNum(preco);
  const pct = pO > 0 && p > 0 ? Math.round((1 - p / pO) * 100) : 0;
  const economia = pO > p && p > 0 ? pO - p : 0;
  // NOTE: the design also shows a "faixa recomendada (50–70%)" next to this.
  // Left out on purpose — we have no sales data to support a recommended
  // band, and a made-up benchmark would push shops to price against nothing.
  // Bring it back when there are enough completed orders to derive it.

  const erro = state.error || estadoModelo.error;

  const camposOcultos = (
    <>
      <input type="hidden" name="bagId" value={bagId} />
      <input type="hidden" name="fotoUrl" value={fotoUrl} />
      <input type="hidden" name="conteudos" value={JSON.stringify(conteudos)} />
      <input type="hidden" name="categoria" value={categoria} />
      <input type="hidden" name="quantidade" value={quantidade} />
      {alergenos.map((a) => (
        <input key={a} type="hidden" name="alergenos" value={a} />
      ))}
    </>
  );

  return (
    <form action={action} id="form-publicar" className="flex flex-1 flex-col">
      {camposOcultos}

      <div className="px-5">
        {/* Caminho rápido — publishing is a daily chore, so a saved model
            fills the whole form in one tap. */}
        {modelos.length > 0 && (
          <>
            <div className="rounded-[18px] bg-sage p-3.5">
              <div className="text-xs font-bold uppercase leading-none tracking-[0.7px] text-brand-dark">
                Caminho rápido
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.5] text-charcoal">
                Escolha um modelo salvo para preencher tudo.
              </p>

              <div className="mt-3 flex flex-col gap-2">
                {modelos.map((m) => (
                  <div
                    key={m.bagId}
                    className={`flex items-center gap-2.5 rounded-[13px] bg-white p-2.5 ${
                      bagId === m.bagId ? "ring-2 ring-brand" : ""
                    }`}
                  >
                    <FotoSacola src={m.fotoUrl} size={40} radius={9} alt="" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-bold leading-[1.25]">
                        {m.nome}
                      </div>
                      <div className="mt-0.5 truncate text-[12px] leading-[1.3] text-muted">
                        {m.quantidade} un · {brl(m.preco)} · {m.janelaInicio} –{" "}
                        {m.janelaFim}
                        {m.usos > 0 ? ` · usado ${m.usos}×` : ""}
                      </div>
                      {/* status, not a control */}
                      {m.publicadoHoje && (
                        <div className="mt-0.5 text-[11.5px] font-semibold leading-none text-brand-dark">
                          já publicada hoje
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => aplicarModelo(m)}
                      className="h-9 shrink-0 rounded-[11px] bg-brand px-3.5 text-[13px] font-bold text-white"
                    >
                      Usar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-[18px] flex items-center gap-3">
              <span className="h-px flex-1 bg-sage-line" />
              <span className="text-[12.5px] font-semibold leading-none text-muted">
                ou ajuste abaixo
              </span>
              <span className="h-px flex-1 bg-sage-line" />
            </div>
          </>
        )}

        {salvo && (
          <p className="mt-4 rounded-xl bg-sage px-3.5 py-3 text-[13px] font-bold text-brand-dark">
            Modelo salvo. Ele aparece no caminho rápido acima.
          </p>
        )}

        {/* Foto — 96px slot beside the reason it matters */}
        <div className="mt-[18px] flex items-stretch gap-3">
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
            disabled={enviandoFoto}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border-2 border-dashed border-sage-line bg-white"
          >
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoUrl}
                alt="Foto da sacola"
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                  <rect x="3" y="5.5" width="16" height="12" rx="2" fill="none" stroke="#6b6b62" strokeWidth="1.7" />
                  <circle cx="11" cy="11.5" r="3.2" fill="none" stroke="#6b6b62" strokeWidth="1.7" />
                </svg>
                <span className="text-xs font-bold text-muted">
                  {enviandoFoto ? "Enviando…" : "Foto"}
                </span>
              </>
            )}
          </button>
          <div className="flex-1 rounded-2xl border-[1.5px] border-sage-line bg-white p-3">
            <div className="text-[12.5px] font-bold leading-[1.4]">
              Sacolas com foto vendem mais
            </div>
            <div className="mt-1 text-[12.5px] leading-[1.45] text-muted">
              Uma foto real da vitrine basta — não precisa ser da sacola
              montada.
            </div>
            {erroFoto && (
              <div className="mt-1.5 text-xs font-semibold text-alert">
                {erroFoto}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3.5">
          <label className="block">
            <span className={ROTULO}>Nome da sacola</span>
            <input
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex.: Sacola Surpresa Doce"
              className={CAMPO}
            />
          </label>

          <div>
            <span className={ROTULO}>Tipo</span>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCategoria(t.id)}
                  aria-pressed={categoria === t.id}
                  className={`inline-flex h-10 items-center rounded-full px-3.5 text-[13.5px] ${
                    categoria === t.id
                      ? "bg-brand-dark font-bold text-white"
                      : "border-[1.5px] border-sage-line bg-white font-semibold text-charcoal"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex-1">
              <span className={ROTULO}>Valor de vitrine</span>
              <input
                name="precoOriginal"
                value={precoOriginal}
                onChange={(e) => setPrecoOriginal(e.target.value)}
                inputMode="decimal"
                placeholder="45,00"
                className={CAMPO}
              />
            </label>
            <label className="flex-1">
              <span className={ROTULO}>Preço na GoodFood</span>
              {/* the decisive field, so it carries the brand border */}
              <input
                name="preco"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                inputMode="decimal"
                required
                placeholder="27,90"
                className="h-[50px] w-full rounded-[14px] border-2 border-brand bg-white px-3.5 text-[14.5px] font-bold outline-none"
              />
            </label>
          </div>

          {/* Plain arithmetic on the two prices above — no recommendation. */}
          {pct > 0 && (
            <div className="rounded-xl bg-sage px-3.5 py-[11px] text-[13px] font-semibold leading-[1.4] text-brand-dark">
              −{pct}% · o cliente economiza {brl(economia)}
            </div>
          )}

          <label className="block">
            <span className={ROTULO}>Quantidade</span>
            <span className="flex h-[50px] items-center justify-between rounded-[14px] border-[1.5px] border-sage-line bg-white pl-3.5 pr-2">
              <span className="text-[14.5px] font-semibold">{quantidade}</span>
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                  aria-label="Menos"
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#f2efe8] text-[17px] font-bold text-muted"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setQuantidade((q) => Math.min(99, q + 1))}
                  aria-label="Mais"
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-sage text-[17px] font-bold text-brand-dark"
                >
                  +
                </button>
              </span>
            </span>
          </label>

          <div>
            <span className={ROTULO}>Janela de retirada</span>
            <div className="flex gap-3">
              <input
                type="time"
                name="janelaInicio"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className={CAMPO}
              />
              <input
                type="time"
                name="janelaFim"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
                className={CAMPO}
              />
            </div>
          </div>

          <ConteudoEditor conteudos={conteudos} onChange={setConteudos} />

          <div>
            <span className={ROTULO}>Alérgenos</span>
            <div className="flex flex-wrap gap-[7px]">
              {ALERGENOS.map((a) => {
                const on = alergenos.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      setAlergenos((xs) =>
                        on ? xs.filter((x) => x !== a) : [...xs, a],
                      )
                    }
                    aria-pressed={on}
                    className={`inline-flex h-9 items-center rounded-full px-[13px] text-[13px] ${
                      on
                        ? "bg-brand-dark font-bold text-white"
                        : "border-[1.5px] border-sage-line bg-white font-semibold text-[#4a4a44]"
                    }`}
                  >
                    {ROTULO_ALERGENO[a]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
          Como o cliente vai ver
        </div>
        <div className="mt-2.5 flex gap-[13px] rounded-[18px] border-[1.5px] border-sage-line bg-white p-[11px]">
          <FotoSacola src={fotoUrl || null} quantidade={quantidade} alt="" />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="truncate font-display text-base font-semibold leading-[1.3]">
              {nome || "Nome da sacola"}
            </div>
            <div className="mt-0.5 truncate text-[13px] font-medium leading-[1.3] text-muted">
              Sua loja
            </div>
            <div className="mt-auto flex items-end justify-between gap-2 pt-[9px]">
              <span className="inline-flex h-[26px] items-center rounded-lg bg-sage px-[9px] text-xs font-bold leading-none text-brand-dark">
                {inicio.replace(":", "h")} – {fim.replace(":", "h")}
              </span>
              <div className="shrink-0 text-right">
                {pO > p && p > 0 && (
                  <div className="text-[11px] font-medium leading-none text-[#8d8d84] line-through">
                    {brl(pO)}
                  </div>
                )}
                <div className="mt-0.5 font-display text-[17px] font-bold leading-none">
                  {p > 0 ? brl(p) : "R$ —"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {erro && (
          <p className="mt-4 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
            {erro}
          </p>
        )}

        <div className="h-[18px]" />
      </div>

      {/* Saving a template and putting it on sale today are different
          intentions, so they're different buttons. */}
      <div className="sticky bottom-0 mt-auto flex gap-2.5 border-t border-sage-line bg-white px-5 pb-5 pt-3.5">
        <button
          type="submit"
          formAction={acaoModelo}
          disabled={salvando || pending}
          className="h-[52px] shrink-0 rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 text-[14.5px] font-bold text-[#4a4a44] disabled:opacity-60"
        >
          {salvando ? "Salvando…" : "Salvar modelo"}
        </button>
        <button
          type="submit"
          disabled={pending || salvando}
          className="h-[52px] flex-1 rounded-[14px] bg-brand text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending
            ? "Publicando…"
            : `Publicar ${quantidade} ${quantidade === 1 ? "sacola" : "sacolas"}`}
        </button>
      </div>
    </form>
  );
}

// "O que pode vir" — the list that replaces a photo of the contents.
function ConteudoEditor({
  conteudos,
  onChange,
}: {
  conteudos: Conteudo[];
  onChange: (c: Conteudo[]) => void;
}) {
  return (
    <div>
      <span className={ROTULO}>O que pode vir na sacola</span>
      <div className="flex flex-col gap-2">
        {conteudos.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-sage-line bg-white px-3 py-2.5"
          >
            <input
              value={c.label}
              onChange={(e) =>
                onChange(
                  conteudos.map((x, j) =>
                    j === i ? { ...x, label: e.target.value } : x,
                  ),
                )
              }
              placeholder="Ex.: Croissants amanteigados"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium leading-[1.3] outline-none"
            />
            <span className="flex shrink-0 gap-1">
              {["Provável", "Possível"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    onChange(
                      conteudos.map((x, j) => (j === i ? { ...x, tag: t } : x)),
                    )
                  }
                  aria-pressed={c.tag === t}
                  className={`inline-flex h-[26px] items-center rounded-lg px-[9px] text-xs font-bold ${
                    c.tag === t
                      ? "bg-brand-dark text-white"
                      : "bg-[#f2efe8] text-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </span>
            <button
              type="button"
              onClick={() => onChange(conteudos.filter((_, j) => j !== i))}
              aria-label={`Remover ${c.label || "item"}`}
              className="shrink-0 text-base leading-none text-muted"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange([...conteudos, { label: "", tag: "Provável" }])}
          className="flex h-11 items-center gap-2 rounded-xl border-[1.5px] border-dashed border-sage-line px-3 text-[13px] font-bold text-brand-dark"
        >
          <span className="text-base leading-none">+</span> Adicionar item
        </button>
      </div>
      <p className="mt-2 text-[12.5px] leading-[1.45] text-muted">
        O cliente vê esta lista antes de reservar — é o que substitui a foto do
        conteúdo numa sacola surpresa.
      </p>
    </div>
  );
}
