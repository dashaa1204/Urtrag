import type { Direction } from "@/types";

export const DIRECTIONS: Record<Direction, { label: string; short: string }> = {
  "at-mn": { label: "Австри → Монгол", short: "🇦🇹 → 🇲🇳" },
  "mn-at": { label: "Монгол → Австри", short: "🇲🇳 → 🇦🇹" },
};

export function isDirection(value: unknown): value is Direction {
  return value === "at-mn" || value === "mn-at";
}
