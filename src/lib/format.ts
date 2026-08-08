// Клиент, сервер хоёуланд нь ашиглагдах форматын туслахууд (серверийн хамааралгүй).

import type { Direction } from "@/types";

export function directionCities(direction: Direction, fromCity?: string | null, toCity?: string | null): string {
  const defaults = direction === "at-mn" ? ["Австри", "Монгол"] : ["Монгол", "Австри"];
  return `${fromCity || defaults[0]} → ${toCity || defaults[1]}`;
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
