"use client";

import { useActionState, useRef, useState } from "react";
import { FotoSacola } from "@/components/consumidor/foto-sacola";
import { brl } from "@/lib/format";
import { publicarSacola, type PublishState } from "@/lib/parceiro-actions";
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

export function CriarSacolaForm({ modelos }: { modelos: Modelo[] }) {
  const [state, action, pending] = useActionState<PublishState, FormData>(
    publicarSacola,
    {},
  );

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
  // The recommended 50–70% band is the PRICE as a share of the window value,
  // not the discount: the design labels −38% as "dentro da faixa", and
  // 27,90 / 45,00 = 62%. Checking the discount against 50–70 would have
  // called every healthy price too cheap.
  const share = pO > 0 && p > 0 ? Math.round((p / pO) * 100) : 0;
  const dentroDaFaixa = share >= 50 && share <= 70;

  return (
    <form action={action} className="pb-6">
      <input type="hidden" name="bagId" value={bagId} />
      <input type="hidden" name="fotoUrl" value={fotoUrl} />
      <input
        type="hidden"
        name="conteudos"
        value={JSON.stringify(conteudos)}
      />

      {modelos.length > 0 && (
        <section className="mt-4">
          <div className="pb-2 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
            Caminho rápido
          </div>
          <div className="flex flex-col gap-2">
            {modelos.map((m) => (
              <button
                key={m.bagId}
                type="button"
                onClick={() => aplicarModelo(m)}
                className={`flex items-center gap-3 rounded-[14px] border-[1.5px] bg-white p-3 text-left transition-colors ${
                  bagId === m.bagId ? "border-brand" : "border-sage-line"
                }`}
              >
                <FotoSacola src={m.fotoUrl} size={44} radius={10} alt="" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {m.nome}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {m.quantidade} un · {brl(m.preco)} · {m.janelaInicio} –{" "}
                    {m.janelaFim}
                    {m.usos > 0 ? ` · usado ${m.usos}×` : ""}
                  </span>
                </span>
                {m.publicadoHoje ? (
                  <span className="shrink-0 rounded-md bg-sage px-2 py-1 text-[11px] font-bold text-brand-dark">
                    hoje
                  </span>
                ) : (
                  <span className="shrink-0 text-[13px] font-bold text-brand-dark">
                    Usar
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Escolha um modelo para preencher tudo — ou ajuste abaixo.
          </p>
        </section>
      )}

      <section className="mt-5">
        <div className="pb-2 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
          Foto
        </div>
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
          className="flex w-full items-center gap-3 rounded-[18px] border-[1.5px] border-sage-line bg-white p-3 text-left"
        >
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoUrl}
              alt="Foto da sacola"
              className="h-[64px] w-[64px] shrink-0 rounded-xl object-cover"
            />
          ) : (
            <span
              className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-xl text-xl"
              style={{
                background:
                  "repeating-linear-gradient(135deg,#e4ede3 0 8px,#eff5ef 8px 16px)",
              }}
            >
              📷
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">
              {enviandoFoto
                ? "Enviando…"
                : fotoUrl
                  ? "Trocar foto"
                  : "Sacolas com foto vendem mais"}
            </span>
            <span className="mt-0.5 block text-xs leading-[1.4] text-muted">
              Uma foto real da vitrine basta — não precisa ser da sacola
              montada.
            </span>
          </span>
        </button>
        {erroFoto && (
          <p className="mt-2 text-xs font-semibold text-alert">{erroFoto}</p>
        )}
      </section>

      <section className="mt-5 flex flex-col gap-3.5">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-[#4a4a44]">
            Nome da sacola
          </span>
          <input
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Ex.: Sacola Surpresa Doce"
            className="h-[52px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] outline-none focus:border-brand"
          />
        </label>

        <div>
          <span className="mb-1.5 block text-[13px] font-bold text-[#4a4a44]">
            Tipo
          </span>
          <input type="hidden" name="categoria" value={categoria} />
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCategoria(t.id)}
                aria-pressed={categoria === t.id}
                className={`inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-semibold ${
                  categoria === t.id
                    ? "bg-brand-dark text-white"
                    : "border-[1.5px] border-sage-line bg-white text-charcoal"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-[#4a4a44]">
              Valor de vitrine
            </span>
            <input
              name="precoOriginal"
              value={precoOriginal}
              onChange={(e) => setPrecoOriginal(e.target.value)}
              inputMode="decimal"
              placeholder="45,00"
              className="h-[52px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-[#4a4a44]">
              Preço na GoodFood
            </span>
            <input
              name="preco"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              inputMode="decimal"
              required
              placeholder="27,90"
              className="h-[52px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] outline-none focus:border-brand"
            />
          </label>
        </div>

        {/* Price with feedback instead of guesswork. */}
        {pct > 0 && (
          <p
            className={`text-[12.5px] font-semibold ${
              dentroDaFaixa ? "text-brand-dark" : "text-terracotta-dark"
            }`}
          >
            −{pct}% ·{" "}
            {dentroDaFaixa
              ? "dentro da faixa recomendada (50–70%)"
              : share > 70
                ? `preço em ${share}% do valor de vitrine — a faixa que mais vende é 50–70%`
                : `preço em ${share}% do valor de vitrine — abaixo da faixa de 50–70%`}
          </p>
        )}

        <div>
          <span className="mb-1.5 block text-[13px] font-bold text-[#4a4a44]">
            Quantidade
          </span>
          <div className="flex items-center gap-0.5 overflow-hidden rounded-[14px] border-[1.5px] border-sage-line bg-white">
            <button
              type="button"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              aria-label="Menos"
              className="h-[52px] w-12 text-xl font-bold text-muted"
            >
              −
            </button>
            <span className="min-w-[32px] text-center text-base font-bold">
              {quantidade}
            </span>
            <button
              type="button"
              onClick={() => setQuantidade((q) => Math.min(99, q + 1))}
              aria-label="Mais"
              className="h-[52px] w-12 text-xl font-bold text-brand-dark"
            >
              +
            </button>
            <input type="hidden" name="quantidade" value={quantidade} />
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-bold text-[#4a4a44]">
            Janela de retirada
          </span>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              name="janelaInicio"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="h-[52px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] outline-none focus:border-brand"
            />
            <input
              type="time"
              name="janelaFim"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="h-[52px] w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14.5px] outline-none focus:border-brand"
            />
          </div>
        </div>
      </section>

      <ConteudoEditor conteudos={conteudos} onChange={setConteudos} />

      <section className="mt-5">
        <div className="pb-2 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
          Alérgenos
        </div>
        <div className="flex flex-wrap gap-2">
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
                className={`inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-semibold ${
                  on
                    ? "bg-alert-bg text-alert"
                    : "border-[1.5px] border-sage-line bg-white text-charcoal"
                }`}
              >
                {ROTULO_ALERGENO[a]}
              </button>
            );
          })}
        </div>
        {alergenos.map((a) => (
          <input key={a} type="hidden" name="alergenos" value={a} />
        ))}
      </section>

      {/* Preview: the partner sees the effect of their choices before publishing. */}
      <section className="mt-5">
        <div className="pb-2 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
          Como o cliente vai ver
        </div>
        <div className="flex gap-[13px] rounded-[18px] border-[1.5px] border-sage-line bg-white p-[11px]">
          <FotoSacola src={fotoUrl || null} quantidade={quantidade} alt="" />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="truncate font-display text-base font-semibold leading-[1.3]">
              {nome || "Nome da sacola"}
            </div>
            <div className="mt-0.5 truncate text-[13px] font-medium text-muted">
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
      </section>

      {state.error && (
        <p className="mt-4 rounded-[10px] bg-alert-bg px-3 py-2 text-[12.5px] font-semibold text-alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 h-[54px] w-full rounded-2xl bg-brand text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending
          ? "Publicando…"
          : `Publicar ${quantidade} ${quantidade === 1 ? "sacola" : "sacolas"}`}
      </button>
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
  const [novo, setNovo] = useState("");

  return (
    <section className="mt-5">
      <div className="pb-2 text-xs font-extrabold uppercase leading-none tracking-[0.7px] text-muted">
        O que pode vir na sacola
      </div>

      <div className="flex flex-col gap-2">
        {conteudos.map((c, i) => (
          <div
            key={`${c.label}-${i}`}
            className="flex items-center gap-2 rounded-xl border-[1.5px] border-sage-line bg-white p-2.5"
          >
            {/* wraps rather than truncates: you have to be able to read what
                you promised the customer */}
            <span className="min-w-0 flex-1 text-[13.5px] font-semibold leading-[1.3]">
              {c.label}
            </span>
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
                className={`inline-flex h-6 shrink-0 items-center rounded-[7px] px-2 text-xs font-bold ${
                  c.tag === t
                    ? "bg-sage text-brand-dark"
                    : "bg-[#f2efe8] text-muted"
                }`}
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onChange(conteudos.filter((_, j) => j !== i))}
              aria-label={`Remover ${c.label}`}
              className="shrink-0 px-1 text-base leading-none text-muted"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (novo.trim()) {
                onChange([...conteudos, { label: novo.trim(), tag: "Provável" }]);
                setNovo("");
              }
            }
          }}
          placeholder="Ex.: Croissants amanteigados"
          className="h-[46px] flex-1 rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 text-[14px] outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={() => {
            if (!novo.trim()) return;
            onChange([...conteudos, { label: novo.trim(), tag: "Provável" }]);
            setNovo("");
          }}
          className="h-[46px] shrink-0 rounded-[14px] bg-sage px-4 text-sm font-bold text-brand-dark"
        >
          Adicionar
        </button>
      </div>

      <p className="mt-2 text-xs leading-[1.45] text-muted">
        O cliente vê esta lista antes de reservar — é o que substitui a foto do
        conteúdo numa sacola surpresa.
      </p>
    </section>
  );
}
