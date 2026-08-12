import Link from "next/link";
import type { ListingSummary } from "@/lib/listing";

/** Аялал ба ачааны зарын нэгдсэн карт. */
export function ListingCard({ listing }: { listing: ListingSummary }) {
  return (
    <Link
      href={listing.href}
      className="block rounded-xl border-2 border-ink/12 bg-card p-4 transition duration-150 ease-out hover:-translate-y-px hover:border-ink/35"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 break-words text-sm font-semibold text-ink">{listing.title}</span>
        <span className="shrink-0 text-xs">{listing.flags}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
        {listing.meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
        {listing.price ? <span className="font-bold text-stamp">{listing.price}</span> : null}
      </div>

      {listing.body ? (
        <p className="mt-2 line-clamp-2 break-words text-sm text-ink-soft">{listing.body}</p>
      ) : null}

      <p className="mt-2 text-xs text-ink-soft/70">{listing.userName}</p>
    </Link>
  );
}
