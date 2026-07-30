export type CategoriaId =
  | "tudo"
  | "padaria"
  | "doceria"
  | "refeicao"
  | "mercado";

export interface ConteudoSacola {
  emoji: string;
  label: string;
  tag: "Provável" | "Possível";
}

export interface Sacola {
  /** The BAG id — what /consumidor/sacola/[id] resolves. */
  id: string;
  /**
   * Today's offer of that bag. NOT the same as `id`: a shop can publish the
   * same bag for two windows, which made two cards share one React key and
   * silently drop one of them. Use this wherever a list needs identity.
   */
  listingId: string | null;
  nome: string;
  loja: string;
  distancia: string;
  emoji: string;
  /** The shop that sells it — links to its public page. */
  lojaId: string;
  /** The SHOP's photo (not the bag's) — used by the map's shop plaque. */
  lojaFotoUrl: string | null;
  corThumb: string;
  /** Shop-window photo; null falls back to the striped placeholder. */
  fotoUrl: string | null;
  precoOriginal: number;
  preco: number;
  desconto: string;
  janela: string;
  /** "hoje" | "amanhã" | "02 ago" — which day the window falls on. */
  dia: string;
  /** True when the pickup is today. Urgency and "hoje" labels depend on it. */
  ehHoje: boolean;
  janelaNota: string;
  timer: string;
  /** Units on the shelf right now (drives the stock plaque on the card). */
  disponivel: number;
  /** How many were published today — "resta 1 de 8 hoje". */
  total: number;
  /** ISO start/end of the pickup window; null when there's no active listing. */
  janelaInicio: string | null;
  janelaFim: string | null;
  /** Real average, or null when the shop has no reviews yet. */
  avaliacao: number | null;
  avaliacoesTotal: number;
  endereco: string;
  descricao: string;
  conteudos: ConteudoSacola[];
  /** Declared allergens, e.g. ["gluten","leite"]. Empty when none declared. */
  alergenos: string[];
  categoria: Exclude<CategoriaId, "tudo">;
  destaque?: boolean;
  lat?: number | null;
  lng?: number | null;
}

export interface SacolaLoja {
  id: string;
  nome: string;
  emoji: string;
  corThumb: string;
  preco: number;
  retiradaLabel: string;
  ativa: number;
  reservada: number;
  retirada: number;
  naoRetirada: number;
  receita: number;
  alerta?: boolean;
  /** True when this window falls outside the shop's registered hours. */
  foraDoHorario?: boolean;
}

// pedido recebido pelo estabelecimento (visão do painel)
export interface PedidoLoja {
  id: string;
  codigo: string;
  cliente: string;
  nomeSacola: string;
  emoji: string;
  data: string;
  janela: string;
  qtd: number;
  total: number;
  status: "reservado" | "retirado" | "nao_retirado";
}

export interface Pedido {
  id: string;
  codigo: string;
  sacolaId: string;
  nomeSacola: string;
  loja: string;
  emoji: string;
  data: string;
  qtd: number;
  total: number;
  status: "reservado" | "retirado" | "nao_retirado";
}
