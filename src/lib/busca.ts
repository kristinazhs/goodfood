import type { Sacola } from "@/lib/types";

// Shared by the search screen and any other place that needs to match text
// the way a person types it: "paes" should find "Sacola Mista Pães".

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Matches on both the sacola name and the shop name. */
export function buscarSacolas(sacolas: Sacola[], q: string): Sacola[] {
  const termo = normalizar(q);
  if (!termo) return sacolas;
  return sacolas.filter((s) =>
    normalizar(`${s.nome} ${s.loja}`).includes(termo),
  );
}
