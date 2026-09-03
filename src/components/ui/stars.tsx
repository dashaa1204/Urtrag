import type { UserRating } from "@/types";

/** Бүхэл тоон үнэлгээг одоор харуулна: ★★★★☆ */
export function Stars({ rating }: { rating: number }) {
  const filled = Math.min(Math.max(Math.round(rating), 0), 5);
  return (
    <span className="text-amber-500" aria-label={`${filled}/5 үнэлгээ`}>
      {"★".repeat(filled)}
      <span className="text-ink/20">{"☆".repeat(5 - filled)}</span>
    </span>
  );
}

/** Дундаж үнэлгээний товч харагдац: ★ 4.5 (3) */
export function RatingSummary({ rating }: { rating: UserRating }) {
  if (rating.count === 0) {
    return <span className="text-xs text-ink-soft">Үнэлгээгүй</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-amber-500">★</span>
      <span className="font-semibold text-ink">{rating.avg.toFixed(1)}</span>
      <span className="text-ink-soft">({rating.count})</span>
    </span>
  );
}
