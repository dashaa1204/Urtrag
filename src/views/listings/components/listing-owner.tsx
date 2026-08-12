import Link from "next/link";
import type { UserRating } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { LocalTime, RatingSummary } from "@/components/ui";

/** Зарын эзний нэр, үнэлгээ, нийтэлсэн огноо. */
export function ListingOwner({ listing, rating }: { listing: ListingSummary; rating: UserRating }) {
  return (
    <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
      Зарын эзэн:{" "}
      <Link href={`/users/${listing.userId}`} className="font-medium text-stamp hover:underline">
        {listing.userName}
      </Link>
      <RatingSummary rating={rating} />
      <span>
        · Нийтэлсэн: <LocalTime iso={listing.createdAt} dateOnly />
      </span>
    </p>
  );
}
