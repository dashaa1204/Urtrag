import type { ListingStat } from "@/lib/listing";

/** Дэлгэрэнгүй хуудасны гурван гол үзүүлэлт. */
export function ListingStats({ stats }: { stats: ListingStat[] }) {
  return (
    <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl bg-slate-50 p-3 sm:p-4">
          <dt className="text-xs text-slate-500">{stat.label}</dt>
          <dd
            className={`mt-1 font-semibold ${stat.small ? "text-sm" : ""} ${
              stat.highlight ? "text-indigo-600" : "text-slate-900"
            }`}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
