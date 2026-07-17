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

// desktop — painel do parceiro
export const navPainel: NavItem[] = [
  { href: "/painel", icon: "🏠", label: "Dashboard" },
  { href: "/painel/sacolas", icon: "🛍️", label: "Minhas sacolas" },
  { href: "/painel/pedidos", icon: "🧾", label: "Pedidos" },
  { href: "/painel/relatorios", icon: "📊", label: "Relatórios" },
  { href: "/painel/configuracoes", icon: "⚙️", label: "Configurações" },
];

// desktop — admin dashboard (internal, English)
export const navAdmin: NavItem[] = [
  { href: "/admin", icon: "📈", label: "Overview" },
  { href: "/admin/sales", icon: "💰", label: "Sales" },
  { href: "/admin/businesses", icon: "🏪", label: "Businesses" },
  { href: "/admin/consumers", icon: "👥", label: "Consumers" },
  { href: "/admin/listings", icon: "🛍️", label: "Listings" },
  { href: "/admin/operations", icon: "🚦", label: "Operations" },
  { href: "/admin/impact", icon: "🌱", label: "Impact" },
];
