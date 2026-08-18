import Link from "next/link";
import { btnSecondary, btnSm } from "@/components/ui";

/**
 * Хуудас урагшлуулах холбоос.
 *
 * Нийт мөрийн тоог тоолохгүй тул "5-аас 2 дахь" гэж бичихгүй — дараагийн хуудас
 * БАЙГАА эсэхийг л мэднэ (нэг илүү мөр татсанаар). Самбарт үүнээс илүү нь
 * шаардлагагүй, харин COUNT нь хүснэгт томрох тусам үнэтэй болно.
 */
export function AdminPager({
  page,
  hasMore,
  hrefFor,
}: {
  page: number;
  hasMore: boolean;
  hrefFor: (page: number) => string;
}) {
  if (page === 1 && !hasMore) return null;
  const cls = `${btnSecondary} ${btnSm}`;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cls}>
          ← Өмнөх
        </Link>
      ) : (
        <span />
      )}

      <span className="text-sm text-ink-soft">{page}-р хуудас</span>

      {hasMore ? (
        <Link href={hrefFor(page + 1)} className={cls}>
          Дараах →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
