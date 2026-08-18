import type { ListingStat } from "@/lib/listing";

/** Дэлгэрэнгүй хуудасны гурван гол үзүүлэлт. */
export function ListingStats({ stats }: { stats: ListingStat[] }) {
  return (
    <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl bg-ink/5 p-3 sm:p-4">
          <dt className="text-xs text-ink-soft">{stat.label}</dt>
          <dd
            className={`mt-1 font-semibold ${stat.small ? "text-sm" : ""} ${
              stat.highlight ? "text-stamp" : "text-ink"
            }`}
          >
            {stat.value}
          </dd>

          {stat.bar ? (
            <>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10"
                role="img"
                aria-label={stat.bar.caption}
              >
                <div
                  className="h-full rounded-full bg-ink/60"
                  style={{ width: `${Math.min(100, Math.round(stat.bar.ratio * 100))}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-ink-soft">{stat.bar.caption}</p>
            </>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
