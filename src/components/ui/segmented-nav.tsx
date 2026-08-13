import Link from "next/link";

export interface SegmentedItem {
  key: string;
  label: string;
  href: string;
  /** Шошгын ард гарах тоо (0 бол харуулахгүй). */
  count?: number;
}

/**
 * Холбоосон таб. Сонголт нь URL-д үлддэг тул серверийн хуудсыг шууд соливол
 * хангалттай — клиент төлөв, JS шаардахгүй.
 */
export function SegmentedNav({
  items,
  active,
  ariaLabel,
}: {
  items: SegmentedItem[];
  active: string;
  ariaLabel: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex gap-1 overflow-x-auto rounded-xl border-2 border-ink/12 bg-ink/5 p-1"
    >
      {items.map((item) => {
        const current = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={current ? "page" : undefined}
            scroll={false}
            className={`min-h-9 flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
              current
                ? "bg-card text-ink shadow-sm"
                : "text-ink-soft hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {item.label}
            {item.count ? <span className="ml-1.5 text-xs text-ink-soft/70">{item.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
