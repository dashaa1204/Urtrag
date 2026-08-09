import type { SessionUser, UserRating } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { Card, PageContainer, StatusBadge } from "@/components/ui";
import { ListingContact, ListingOwner, ListingStats } from "./components";

/** Аялал ба ачааны зарын хуваалцсан дэлгэрэнгүй хуудас. */
export default function ListingDetailView({
  listing,
  viewer,
  ownerRating,
}: {
  listing: ListingSummary;
  viewer: SessionUser | null;
  ownerRating: UserRating;
}) {
  return (
    <PageContainer width="reading">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-slate-500">{listing.kicker}</span>
          <StatusBadge status={listing.status} />
        </div>

        <h1 className="mt-2 break-words text-xl font-bold text-slate-900 sm:text-2xl">{listing.title}</h1>

        <ListingStats stats={listing.stats} />

        {listing.body ? (
          <p className="mt-6 whitespace-pre-wrap break-words text-sm text-slate-600">{listing.body}</p>
        ) : null}

        <ListingOwner listing={listing} rating={ownerRating} />
      </Card>

      <Card className="mt-6">
        <ListingContact listing={listing} viewer={viewer} />
      </Card>
    </PageContainer>
  );
}
