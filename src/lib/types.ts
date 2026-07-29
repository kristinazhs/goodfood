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
  id: string;
  nome: string;
  loja: string;
  distancia: string;
  emoji: string;
  /** The shop that sells it — links to its public page. */
  lojaId: string;
  corThumb: string;
  /** Shop-window photo; null falls back to the striped placeholder. */
  fotoUrl: string | null;
  precoOriginal: number;
  preco: number;
  desconto: string;
  janela: string;
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
