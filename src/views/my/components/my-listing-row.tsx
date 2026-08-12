import Link from "next/link";
import type { ListingSummary } from "@/lib/listing";
import { Badge, PanelRow, StatusBadge } from "@/components/ui";
import { ListingActions } from "./listing-actions";

/** "Миний зар" жагсаалтын нэг мөр. */
export function MyListingRow({ listing }: { listing: ListingSummary }) {
  const meta = [...listing.meta, listing.price].filter(Boolean).join(" · ");

  return (
    <PanelRow className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Link href={listing.href} className="min-w-0 hover:underline sm:flex-1">
        <p className="truncate text-sm font-medium text-ink">{listing.title}</p>
        <p className="truncate text-xs text-ink-soft">{meta}</p>
      </Link>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        {listing.expired && listing.status === "active" ? (
          <Badge tone="amber">Огноо өнгөрсөн</Badge>
        ) : (
          <StatusBadge status={listing.status} />
        )}
        <ListingActions listing={listing} />
      </div>
    </PanelRow>
  );
}
