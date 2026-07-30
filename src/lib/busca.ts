import type { Sacola } from "@/lib/types";

// Text matching the way a person types it: "paes" finds "Sacola Mista Pães".

function semAcento(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function normalizar(texto: string): string {
  return semAcento(texto).trim();
}

/** Results start from the 2nd character. */
export const MIN_BUSCA = 2;

/**
 * Crude Portuguese stem, enough to fold the plurals people actually type:
 * "pão" must find "Pães" — the word the shop wrote — and "padarias" must
 * find "Padaria". Substring matching alone can't do this, because "pao"
 * doesn't appear anywhere inside "paes".
 */
function radical(palavra: string): string {
  const p = semAcento(palavra);
  if (p.endsWith("aes") || p.endsWith("oes")) return `${p.slice(0, -3)}ao`;
  if (p.endsWith("ns")) return `${p.slice(0, -2)}m`;
  if (p.endsWith("s") && p.length > 3) return p.slice(0, -1);
  return p;
}

function palavrasDe(texto: string): string[] {
  return semAcento(texto)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Substring match, or every typed word matching some word by stem. */
export function combina(texto: string, q: string): boolean {
  const termo = normalizar(q);
  if (termo.length < MIN_BUSCA) return false;
  if (semAcento(texto).includes(termo)) return true;

  const radicaisTexto = palavrasDe(texto).map(radical);
  return termo
    .split(/\s+/)
    .map(radical)
    .every((r) => radicaisTexto.some((t) => t.startsWith(r)));
}

export function buscarSacolas(sacolas: Sacola[], q: string): Sacola[] {
  if (normalizar(q).length < MIN_BUSCA) return [];
  return sacolas.filter((s) =>
    combina(`${s.nome} ${s.loja} ${s.categoria}`, q),
  );
}

export interface Loja {
  nome: string;
  avaliacao: number | null;
  distancia: string;
  sacolas: number;
  /** Somewhere to go — there's no store page yet, so the shop's own sacola. */
  lojaId: string;
}

/**
 * The "Lojas" group, folded from the sacolas that ALREADY matched — so a
 * search for "pão" lists the bakery behind "Sacola Mista Pães" even though
 * "Panificadora Estrela" contains no form of the word.
 */
export function lojasDe(sacolas: Sacola[]): Loja[] {
  const porLoja = new Map<string, Loja>();
  for (const s of sacolas) {
    const atual = porLoja.get(s.loja);
    if (atual) atual.sacolas += 1;
    else
      porLoja.set(s.loja, {
        nome: s.loja,
        avaliacao: s.avaliacao,
        distancia: s.distancia,
        sacolas: 1,
        lojaId: s.lojaId,
      });
  }
  return [...porLoja.values()];
}

export interface Trecho {
  texto: string;
  marcado: boolean;
}

/**
 * Splits `texto` around the part that matched, so the UI can mark it. Matching
 * ignores accents, so we map positions back onto the ORIGINAL string — that's
 * what lets "paes" highlight the "Pães" as it's really written.
 */
export function destacar(texto: string, termo: string): Trecho[] {
  const t = normalizar(termo);
  if (t.length < MIN_BUSCA) return [{ texto, marcado: false }];

  // Positions map back onto the ORIGINAL string, so "paes" can mark the
  // "Pães" exactly as the shop wrote it.
  let normalizado = "";
  const posicaoOriginal: number[] = [];
  for (let i = 0; i < texto.length; i++) {
    for (const c of semAcento(texto[i])) {
      normalizado += c;
      posicaoOriginal.push(i);
    }
  }
  const original = (i: number) =>
    i < posicaoOriginal.length ? posicaoOriginal[i] : texto.length;

  const marcas: [number, number][] = [];
  const idx = normalizado.indexOf(t);

  if (idx >= 0) {
    marcas.push([original(idx), original(idx + t.length)]);
  } else {
    // Matched by stem, so mark the whole word ("pão" -> "Pães").
    const radicais = t.split(/\s+/).map(radical);
    for (const m of normalizado.matchAll(/[a-z0-9]+/g)) {
      const r = radical(m[0]);
      if (radicais.some((rq) => r.startsWith(rq))) {
        marcas.push([original(m.index), original(m.index + m[0].length)]);
      }
    }
  }

  if (marcas.length === 0) return [{ texto, marcado: false }];

  const partes: Trecho[] = [];
  let cursor = 0;
  for (const [inicio, fim] of marcas) {
    if (inicio > cursor)
      partes.push({ texto: texto.slice(cursor, inicio), marcado: false });
    partes.push({ texto: texto.slice(inicio, fim), marcado: true });
    cursor = fim;
  }
  if (cursor < texto.length)
    partes.push({ texto: texto.slice(cursor), marcado: false });

  return partes.filter((p) => p.texto.length > 0);
}

// ---- Suggestions ---------------------------------------------------------
// "combinam categoria + preço + janela" — each one is a real filter, not a
// decorative chip.

export type SugestaoId = "padaria" | "doceria" | "preco20" | "ate19" | "perto";

export interface Sugestao {
  id: SugestaoId;
  emoji?: string;
  label: string;
}

export const SUGESTOES: Sugestao[] = [
  { id: "padaria", emoji: "🥖", label: "Padaria" },
  { id: "doceria", emoji: "🍰", label: "Doceria" },
  { id: "preco20", label: "Até R$ 20" },
  { id: "ate19", label: "Retirar até 19h" },
  { id: "perto", label: "Perto de mim" },
];

/** Metres back out of the "310m" / "1,3 km" label, for sorting. */
function metros(distancia: string): number {
  if (!distancia) return Number.POSITIVE_INFINITY;
  const n = Number(distancia.replace(/[^\d,]/g, "").replace(",", "."));
  return distancia.includes("km") ? n * 1000 : n;
}

export function aplicarSugestao(
  sacolas: Sacola[],
  id: SugestaoId,
): Sacola[] {
  switch (id) {
    case "padaria":
    case "doceria":
      return sacolas.filter((s) => s.categoria === id);
    case "preco20":
      return sacolas.filter((s) => s.preco <= 20);
    case "ate19":
      return sacolas.filter((s) => {
        if (!s.janelaFim) return false;
        const h = new Date(s.janelaFim).toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          hour12: false,
        });
        return Number(h) <= 19;
      });
    case "perto":
      return [...sacolas].sort(
        (a, b) => metros(a.distancia) - metros(b.distancia),
      );
  }
}
