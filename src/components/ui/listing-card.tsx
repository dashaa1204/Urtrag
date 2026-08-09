import Link from "next/link";
import type { ListingSummary } from "@/lib/listing";

/** Аялал ба ачааны зарын нэгдсэн карт. */
export function ListingCard({ listing }: { listing: ListingSummary }) {
  return (
    <Link
      href={listing.href}
      className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 break-words text-sm font-semibold text-slate-900">{listing.title}</span>
        <span className="shrink-0 text-xs">{listing.directionShort}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
        {listing.meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
        {listing.price ? <span className="font-semibold text-indigo-600">{listing.price}</span> : null}
      </div>

      {listing.body ? (
        <p className="mt-2 line-clamp-2 break-words text-sm text-slate-500">{listing.body}</p>
      ) : null}

      <p className="mt-2 text-xs text-slate-400">{listing.userName}</p>
    </Link>
  );
}
