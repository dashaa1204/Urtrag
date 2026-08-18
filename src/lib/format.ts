// Клиент, сервер хоёуланд нь ашиглагдах форматын туслахууд (серверийн хамааралгүй).

import { countryFlag, countryName } from "@/constant/cities";

/** Зар бүр дээр байдаг чиглэлийн хэсэг. */
export interface Route {
  from_country: string;
  to_country: string;
  from_city: string | null;
  to_city: string | null;
}

function place(city: string | null, code: string): string {
  return city || countryName(code);
}

/** Чиглэлийн хоёр үзүүр салангид — OG зураг зэрэг мөр биш байрлалд хэрэгтэй. */
export function routeEnds(route: Route): { from: string; to: string } {
  return {
    from: place(route.from_city, route.from_country),
    to: place(route.to_city, route.to_country),
  };
}

/** "Vienna → Ulaanbaatar" — хот хоосон хуучин зарт улсын нэр гарна. */
export function routeTitle(route: Route): string {
  const { from, to } = routeEnds(route);
  return `${from} → ${to}`;
}

/** "🇦🇹 → 🇲🇳" */
export function routeFlags(route: Route): string {
  return `${countryFlag(route.from_country)} → ${countryFlag(route.to_country)}`;
}

/** "2026-08-15" эсвэл Date → "2026.08.15" */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const iso = typeof value === "string" ? value : value.toISOString();
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${y}.${m}.${d}`;
}

export function formatPrice(eur: number): string {
  return `${Number.isInteger(eur) ? eur : eur.toFixed(2)}€`;
}

export function formatKg(kg: number): string {
  return `${Number.isInteger(kg) ? kg : kg.toFixed(1)}кг`;
}
