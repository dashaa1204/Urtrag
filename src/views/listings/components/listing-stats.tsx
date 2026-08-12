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
        </div>
      ))}
    </dl>
  );
}
