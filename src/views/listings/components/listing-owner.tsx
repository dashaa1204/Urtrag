import Link from "next/link";
import type { UserRating } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { avatarUrl } from "@/lib/avatar";
import { Avatar, LocalTime, RatingSummary } from "@/components/ui";

/** Зарын эзний зураг, нэр, үнэлгээ, нийтэлсэн огноо. */
export function ListingOwner({ listing, rating }: { listing: ListingSummary; rating: UserRating }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
      Зарын эзэн:
      <Avatar name={listing.userName} src={avatarUrl(listing.userAvatar)} size="sm" />
      <Link href={`/users/${listing.userId}`} className="font-medium text-stamp hover:underline">
        {listing.userName}
      </Link>
      <RatingSummary rating={rating} />
      <span>
        · Нийтэлсэн: <LocalTime iso={listing.createdAt} dateOnly />
      </span>
    </div>
  );
}
