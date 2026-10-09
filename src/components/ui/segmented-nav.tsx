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
  wrap = false,
}: {
  items: SegmentedItem[];
  active: string;
  ariaLabel: string;
  /**
   * Урт шошготой олон сонголтыг мөр дамжуулж багтаана. Анхны байдлаараа энэ
   * зурвас нь хэвтээ гүйдэг — гэвч 375px дээр сүүлийн сонголт бүрэн тасарч,
   * гүйдэг гэдэг нь ямар ч дохиогүй болдог. Ийм тохиолдолд нуухаас нугалах нь
   * дээр.
   */
  wrap?: boolean;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={`flex gap-1 rounded-xl border-2 border-ink/12 bg-ink/5 p-1 ${
        wrap ? "flex-wrap" : "overflow-x-auto"
      }`}
    >
      {items.map((item) => {
        const current = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={current ? "page" : undefined}
            scroll={false}
            className={`min-h-9 whitespace-nowrap rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
              wrap ? "grow" : "flex-1"
            } ${
              current
                ? "bg-card text-ink shadow-sm"
                : "text-ink-soft hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {item.label}
            {item.count ? <span className="ml-1.5 text-xs text-ink-soft">{item.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
