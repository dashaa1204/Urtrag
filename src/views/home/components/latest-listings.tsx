import Link from "next/link";
import type { ListingType } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { LISTING_COPY } from "@/constant/listings";
import { EmptyState, ListingGrid, SectionHeader } from "@/components/ui";

/** Нүүр хуудасны "сүүлийн зарууд" хэсэг — аялал, ачаа хоёуланд нь. */
export function LatestListings({ type, listings }: { type: ListingType; listings: ListingSummary[] }) {
  const copy = LISTING_COPY[type];

  return (
    <>
      <SectionHeader
        size="lg"
        title={copy.homeTitle}
        action={
          <Link href={copy.basePath} className="text-sm font-semibold text-indigo-600 hover:underline">
            Бүгдийг үзэх →
          </Link>
        }
      />
      {listings.length === 0 ? (
        <EmptyState title={copy.homeEmpty} />
      ) : (
        <ListingGrid listings={listings} />
      )}
    </>
  );
}
