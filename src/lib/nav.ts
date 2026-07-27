import type { NavIconKey } from "@/components/ui/icons";

export interface NavItem {
  href: string;
  /** Emoji — still used by the desktop sidebars (/painel, /admin). */
  icon: string;
  /** Stroke icon for the mobile bottom nav; falls back to `icon` when absent. */
  iconKey?: NavIconKey;
  label: string;
}

export const navConsumidor: NavItem[] = [
  { href: "/consumidor", icon: "🛍️", iconKey: "home", label: "Início" },
  { href: "/consumidor/descobrir", icon: "🗺️", iconKey: "pin", label: "Descobrir" },
  { href: "/consumidor/pedidos", icon: "🧾", iconKey: "list", label: "Pedidos" },
  { href: "/consumidor/perfil", icon: "👤", iconKey: "user", label: "Perfil" },
];

export const navParceiro: NavItem[] = [
  { href: "/parceiro", icon: "🛍️", iconKey: "home", label: "Sacolas" },
  { href: "/parceiro/desempenho", icon: "📊", iconKey: "chart", label: "Desempenho" },
  { href: "/parceiro/avaliacoes", icon: "💬", iconKey: "star", label: "Avaliações" },
  { href: "/parceiro/perfil", icon: "⚙️", iconKey: "store", label: "Loja" },
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
