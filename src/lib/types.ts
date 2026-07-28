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
  corThumb: string;
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
  /** ISO end of the pickup window; null when there's no active listing. */
  janelaFim: string | null;
  avaliacao: number;
  endereco: string;
  descricao: string;
  conteudos: ConteudoSacola[];
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
