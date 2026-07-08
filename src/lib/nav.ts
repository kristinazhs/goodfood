export interface NavItem {
  href: string;
  icon: string;
  label: string;
}

export const navConsumidor: NavItem[] = [
  { href: "/consumidor", icon: "🛍️", label: "Início" },
  { href: "/consumidor/descobrir", icon: "🗺️", label: "Descobrir" },
  { href: "/consumidor/pedidos", icon: "🧾", label: "Pedidos" },
  { href: "/consumidor/perfil", icon: "👤", label: "Perfil" },
];

export const navParceiro: NavItem[] = [
  { href: "/parceiro", icon: "🛍️", label: "Sacolas" },
  { href: "/parceiro/desempenho", icon: "📊", label: "Desempenho" },
  { href: "/parceiro/avaliacoes", icon: "💬", label: "Avaliações" },
  { href: "/parceiro/perfil", icon: "⚙️", label: "Loja" },
];
