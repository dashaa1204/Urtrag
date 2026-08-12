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

export function StatusBadge({ status }: { status: ListingStatus }) {
  return status === "active" ? <Badge tone="green">Идэвхтэй</Badge> : <Badge tone="slate">Хаагдсан</Badge>;
}

const countToneCls = {
  red: "bg-red-500",
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
