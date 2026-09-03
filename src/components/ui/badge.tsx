import type { ReactNode } from "react";
import type { ListingStatus } from "@/types";

const toneCls = {
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-ink/8 text-ink-soft",
  amber: "bg-amber-50 text-amber-700",
  indigo: "bg-ink/10 text-ink",
};

/** Богино төлөвийн шошго. */
export function Badge({ tone = "slate", children }: { tone?: keyof typeof toneCls; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneCls[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * matched — зар хүчинтэй ч шинэ хүсэлт хүлээж авахаа больсон. Ачаанд "Тохирсон",
 * аялалд "Дүүрсэн" гэсэн утгатай тул шошгыг дуудагч тал өгнө (ListingSummary).
 */
export function StatusBadge({
  status,
  matched,
  matchedLabel = "Тохирсон",
  expired,
}: {
  status: ListingStatus;
  matched?: boolean;
  matchedLabel?: string;
  /** Аялалын огноо өнгөрсөн — хаагаагүй ч шинэ хүсэлт хүлээж авахгүй. */
  expired?: boolean;
}) {
  if (status !== "active") return <Badge tone="slate">Хаагдсан</Badge>;
  // Огноо өнгөрсөн нь "тохирсон"-оос илүү чухал мэдээлэл: тэр зар цаашид
  // ямар ч байдлаар ажиллахгүй.
  if (expired) return <Badge tone="amber">Огноо өнгөрсөн</Badge>;
  return matched ? <Badge tone="amber">{matchedLabel}</Badge> : <Badge tone="green">Идэвхтэй</Badge>;
}

// red-600, биш red-500: тоо нь 11px bold цагаан бичигтэй тул red-500 дээр
// 3.76:1 болж AA-г давдаггүй байсан. red-600 нь 4.83:1.
const countToneCls = {
  red: "bg-red-600",
  indigo: "bg-ink",
};

/**
 * Уншаагүй мессежийн тоо. Байрлалыг дуудаж буй тал className-ээр өгнө
 * (навбарт дүрсний булан дээр absolute, жагсаалтад мөрийн төгсгөлд).
 */
export function CountBadge({
  count,
  tone = "red",
  className = "",
}: {
  count: number;
  tone?: keyof typeof countToneCls;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <span
      className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white ${countToneCls[tone]} ${className}`}
    >
      {count}
    </span>
  );
}
