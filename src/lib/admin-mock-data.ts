// Seed data for the internal admin dashboard.
// Shaped as accessor functions over typed records so the pages can later be
// wired to real aggregation queries (Supabase/API) without changing the UI.

export type BusinessCategory = "padaria" | "restaurante" | "supermercado";
export type BusinessStatus = "active" | "inactive" | "pending";

export interface Kpi {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendGood: boolean;
  hint?: string;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface SalesBreakdown {
  label: string;
  gmv: number;
  bags: number;
}

export interface AdminBusiness {
  id: string;
  name: string;
  emoji: string;
  category: BusinessCategory;
  neighborhood: string;
  joinDate: string;
  totalSales: number;
  activeListings: number;
  noShowRate: number;
  rating: number;
  status: BusinessStatus;
}

export interface ConsumerSegment {
  name: string;
  share: number;
  description: string;
}

export interface OpsFlag {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  area: string;
}

export function getHeadlineKpis(): Kpi[] {
  return [
    {
      id: "gmv",
      label: "Total GMV (30d)",
      value: "R$ 48,230",
      trend: "+14% vs. prev. 30d",
      trendGood: true,
    },
    {
      id: "bags-sold",
      label: "Sacolas sold (30d)",
      value: "2,147",
      trend: "+11% vs. prev. 30d",
      trendGood: true,
    },
    {
      id: "active-businesses",
      label: "Active businesses",
      value: "10",
      trend: "+2 this month",
      trendGood: true,
    },
    {
      id: "no-show",
      label: "No-show rate",
      value: "5.2%",
      trend: "+0.8pp vs. prev. 30d",
      trendGood: false,
      hint: "Reserved bags never picked up",
    },
  ];
}

export function getSecondaryKpis(): Kpi[] {
  return [
    {
      id: "active-consumers",
      label: "Active consumers",
      value: "1,834",
      trend: "+9% vs. prev. 30d",
      trendGood: true,
    },
    {
      id: "bags-rescued",
      label: "Bags rescued from waste",
      value: "2,034",
      trend: "≈ 3.2t of food",
      trendGood: true,
    },
    {
      id: "aov",
      label: "Average order value",
      value: "R$ 22.46",
      trend: "+R$ 0.90 vs. prev. 30d",
      trendGood: true,
    },
    {
      id: "co2",
      label: "CO₂-eq avoided",
      value: "7.7t",
      trend: "+13% vs. prev. 30d",
      trendGood: true,
    },
  ];
}

// last 14 days of platform sales (bags sold per day)
export function getSalesByDay(): SeriesPoint[] {
  return [
    { label: "04/07", value: 58 },
    { label: "05/07", value: 74 },
    { label: "06/07", value: 66 },
    { label: "07/07", value: 52 },
    { label: "08/07", value: 61 },
    { label: "09/07", value: 70 },
    { label: "10/07", value: 83 },
    { label: "11/07", value: 79 },
    { label: "12/07", value: 91 },
    { label: "13/07", value: 68 },
    { label: "14/07", value: 63 },
    { label: "15/07", value: 76 },
    { label: "16/07", value: 88 },
    { label: "17/07", value: 41 },
  ];
}

export function getSalesByNeighborhood(): SalesBreakdown[] {
  return [
    { label: "Bom Fim", gmv: 12840, bags: 594 },
    { label: "Moinhos de Vento", gmv: 9310, bags: 371 },
    { label: "Cidade Baixa", gmv: 7620, bags: 356 },
    { label: "Centro Histórico", gmv: 6980, bags: 322 },
    { label: "Menino Deus", gmv: 5040, bags: 231 },
    { label: "Petrópolis", gmv: 3890, bags: 168 },
    { label: "Outros", gmv: 2550, bags: 105 },
  ];
}

export function getSalesByCategory(): SalesBreakdown[] {
  return [
    { label: "Padaria", gmv: 21870, bags: 1074 },
    { label: "Restaurante", gmv: 16230, bags: 689 },
    { label: "Supermercado", gmv: 10130, bags: 384 },
  ];
}

export const adminBusinesses: AdminBusiness[] = [
  {
    id: "domenica",
    name: "Domenica Casa de Pães",
    emoji: "🥖",
    category: "padaria",
    neighborhood: "Bom Fim",
    joinDate: "12/03/2026",
    totalSales: 8640,
    activeListings: 5,
    noShowRate: 3.1,
    rating: 4.8,
    status: "active",
  },
  {
    id: "madrecita",
    name: "Madrecita Bistrô",
    emoji: "🥗",
    category: "restaurante",
    neighborhood: "Bom Fim",
    joinDate: "02/04/2026",
    totalSales: 6120,
    activeListings: 2,
    noShowRate: 4.4,
    rating: 4.7,
    status: "active",
  },
  {
    id: "estrela",
    name: "Panificadora Estrela",
    emoji: "🍞",
    category: "padaria",
    neighborhood: "Bom Fim",
    joinDate: "18/03/2026",
    totalSales: 5480,
    activeListings: 3,
    noShowRate: 5.0,
    rating: 4.6,
    status: "active",
  },
  {
    id: "zaffari-moinhos",
    name: "Mercado Zaffari Moinhos",
    emoji: "🧀",
    category: "supermercado",
    neighborhood: "Moinhos de Vento",
    joinDate: "27/04/2026",
    totalSales: 7210,
    activeListings: 4,
    noShowRate: 4.1,
    rating: 4.5,
    status: "active",
  },
  {
    id: "cafe-tuim",
    name: "Café Tuim",
    emoji: "☕",
    category: "restaurante",
    neighborhood: "Cidade Baixa",
    joinDate: "05/05/2026",
    totalSales: 3980,
    activeListings: 2,
    noShowRate: 6.2,
    rating: 4.4,
    status: "active",
  },
  {
    id: "padoca-centro",
    name: "Padoca do Centro",
    emoji: "🥐",
    category: "padaria",
    neighborhood: "Centro Histórico",
    joinDate: "11/05/2026",
    totalSales: 4310,
    activeListings: 3,
    noShowRate: 11.8,
    rating: 4.2,
    status: "active",
  },
  {
    id: "verde-vivo",
    name: "Verde Vivo Orgânicos",
    emoji: "🥬",
    category: "supermercado",
    neighborhood: "Menino Deus",
    joinDate: "22/05/2026",
    totalSales: 2870,
    activeListings: 2,
    noShowRate: 3.8,
    rating: 4.6,
    status: "active",
  },
  {
    id: "nona-rosa",
    name: "Cantina Nona Rosa",
    emoji: "🍝",
    category: "restaurante",
    neighborhood: "Petrópolis",
    joinDate: "30/05/2026",
    totalSales: 3120,
    activeListings: 2,
    noShowRate: 5.5,
    rating: 4.7,
    status: "active",
  },
  {
    id: "pao-da-vila",
    name: "Pão da Vila",
    emoji: "🥯",
    category: "padaria",
    neighborhood: "Floresta",
    joinDate: "09/06/2026",
    totalSales: 1980,
    activeListings: 2,
    noShowRate: 13.4,
    rating: 4.1,
    status: "active",
  },
  {
    id: "emporio-aux",
    name: "Empório Auxiliadora",
    emoji: "🛒",
    category: "supermercado",
    neighborhood: "Auxiliadora",
    joinDate: "14/06/2026",
    totalSales: 2410,
    activeListings: 3,
    noShowRate: 4.9,
    rating: 4.3,
    status: "active",
  },
  {
    id: "sabor-do-sul",
    name: "Sabor do Sul Restaurante",
    emoji: "🍛",
    category: "restaurante",
    neighborhood: "Centro Histórico",
    joinDate: "28/06/2026",
    totalSales: 640,
    activeListings: 0,
    noShowRate: 0,
    rating: 0,
    status: "inactive",
  },
  {
    id: "amelie",
    name: "Doceria Amélie",
    emoji: "🧁",
    category: "padaria",
    neighborhood: "Moinhos de Vento",
    joinDate: "15/07/2026",
    totalSales: 0,
    activeListings: 0,
    noShowRate: 0,
    rating: 0,
    status: "pending",
  },
];

export function getBusiness(id: string): AdminBusiness | undefined {
  return adminBusinesses.find((b) => b.id === id);
}

// consumer signups per week (last 8 weeks)
export function getSignupsByWeek(): SeriesPoint[] {
  return [
    { label: "W21", value: 84 },
    { label: "W22", value: 102 },
    { label: "W23", value: 96 },
    { label: "W24", value: 131 },
    { label: "W25", value: 118 },
    { label: "W26", value: 149 },
    { label: "W27", value: 163 },
    { label: "W28", value: 171 },
  ];
}

export function getConsumerSegments(): ConsumerSegment[] {
  return [
    {
      name: "Saver",
      share: 46,
      description: "Price-first; buys whatever is cheapest nearby",
    },
    {
      name: "Conscious Consumer",
      share: 33,
      description: "Motivated by waste reduction; loyal to favorites",
    },
    {
      name: "Explorer",
      share: 21,
      description: "Treats bags as discovery; tries new places weekly",
    },
  ];
}

export function getConsumerStats() {
  return {
    total: 2412,
    active30d: 1834,
    churned: 578,
    ordersPerUser: 3.4,
    topNeighborhoods: ["Bom Fim", "Cidade Baixa", "Moinhos de Vento"],
  };
}

export function getListingsStats() {
  return {
    activeNow: 37,
    reservedNow: 118,
    fillRate: 82,
    expiredUnsold7d: 6,
    avgDiscount: 41,
  };
}

export function getOpsFlags(): OpsFlag[] {
  return [
    {
      severity: "high",
      title: "Pão da Vila — no-show rate 13.4%",
      detail: "Above 10% threshold for 3 consecutive weeks. Suggest pickup-window review.",
      area: "No-shows",
    },
    {
      severity: "high",
      title: "Padoca do Centro — no-show rate 11.8%",
      detail: "Above 10% threshold for 2 consecutive weeks.",
      area: "No-shows",
    },
    {
      severity: "medium",
      title: "4 listings expiring unsold today",
      detail: "Café Tuim (2), Empório Auxiliadora (1), Verde Vivo (1) — windows close within 2h.",
      area: "Listings",
    },
    {
      severity: "medium",
      title: "1 payment confirmation failure",
      detail: "Order GF-5102 at Mercado Zaffari Moinhos — pay-at-pickup not registered by the business.",
      area: "Payments",
    },
    {
      severity: "low",
      title: "1 business awaiting approval",
      detail: "Doceria Amélie (Moinhos de Vento) — submitted 15/07, documents complete.",
      area: "Moderation",
    },
    {
      severity: "low",
      title: "2 reviews reported by businesses",
      detail: "Awaiting moderation decision (offensive-language reports).",
      area: "Moderation",
    },
  ];
}

export function getImpactStats() {
  return {
    foodRescuedKg: 3218,
    co2AvoidedKg: 7723,
    consumerSavings: 34160,
    bagsRescued: 2034,
    mealsEquivalent: 8045,
  };
}

// monthly impact series (kg of food rescued)
export function getImpactByMonth(): SeriesPoint[] {
  return [
    { label: "Mar", value: 214 },
    { label: "Abr", value: 388 },
    { label: "Mai", value: 542 },
    { label: "Jun", value: 799 },
    { label: "Jul", value: 1275 },
  ];
}
