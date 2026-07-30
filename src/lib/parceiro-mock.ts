// ---------------------------------------------------------------------------
// MOCK DATA — P4 (Desempenho e avaliações) ONLY.
//
// This screen is deliberately NOT connected to Supabase. It exists so the
// partner-facing pitch can show what the dashboard will look like, and the
// numbers below are the design's own example values.
//
// Why it isn't wired up yet: most of what P4 shows can't be computed truthfully
// today. "média do RS: 89%" needs aggregate data across establishments that
// doesn't exist; "sábado rende 2,3×" needs weeks of orders per shop; the
// ratings need a reviews table that is still empty. Deriving those from one
// shop's handful of test orders would produce confident-looking noise.
//
// When it is connected, delete this file — nothing else should import it.
// ---------------------------------------------------------------------------

export interface DiaBarra {
  dia: string;
  altura: number; // percentage of the tallest day
  destaque?: boolean;
}

export const PERIODOS = ["7 dias", "30 dias", "Ano"] as const;

export const REPASSE = {
  titulo: "Repasse dos últimos 7 dias",
  valor: "R$ 542,60",
  variacao: "↑ 18% vs. semana anterior",
  sacolas: "28 sacolas",
};

export const SEMANA: DiaBarra[] = [
  { dia: "Seg", altura: 38 },
  { dia: "Ter", altura: 52 },
  { dia: "Qua", altura: 30 },
  { dia: "Qui", altura: 65 },
  { dia: "Sex", altura: 58 },
  { dia: "Sáb", altura: 100, destaque: true },
  { dia: "Dom", altura: 72 },
];

export interface Metrica {
  valor: string;
  rotulo: string;
  nota: string;
  tom: "brand" | "muted" | "alerta";
}

export const METRICAS: Metrica[] = [
  {
    valor: "94%",
    rotulo: "taxa de retirada",
    nota: "média do RS: 89%",
    tom: "brand",
  },
  {
    valor: "R$ 19,38",
    rotulo: "ticket médio",
    nota: "estável",
    tom: "muted",
  },
  {
    valor: "7%",
    rotulo: "sobra não vendida",
    nota: "2 sacolas na semana",
    tom: "alerta",
  },
  {
    valor: "42 kg",
    rotulo: "comida resgatada",
    nota: "≈ 101 kg CO₂",
    tom: "brand",
  },
];

export interface AvaliacaoMock {
  autor: string;
  quando: string;
  nota: number;
  texto: string;
  sacola?: string;
  /** A poor rating is actionable: it leads with the reply. */
  critica?: boolean;
  aviso?: string;
}

export const RESUMO_AVALIACOES = "4,8 · 132 no total";

export const AVALIACOES: AvaliacaoMock[] = [
  {
    autor: "Carla S.",
    quando: "hoje",
    nota: 5,
    texto:
      "Veio croissant, pão de fermentação e dois muffins. Valeu muito a pena!",
    sacola: "Surpresa Doce",
  },
  {
    autor: "Marcos R.",
    quando: "ontem",
    nota: 2,
    texto: "Cheguei 18:55 e já não tinha nada da sacola doce.",
    critica: true,
    aviso: "Responder em 24h protege sua nota",
  },
];
