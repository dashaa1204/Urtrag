import type { ListingDeal, SessionUser, UserRating } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { Card, PageContainer, StatusBadge } from "@/components/ui";
import { ListingContact, ListingOwner, ListingStats } from "./components";

/** Аялал ба ачааны зарын хуваалцсан дэлгэрэнгүй хуудас. */
export default function ListingDetailView({
  listing,
  viewer,
  ownerRating,
  matches,
  hasCommittedMatches,
  conversationId,
  deal,
}: {
  listing: ListingSummary;
  viewer: SessionUser | null;
  ownerRating: UserRating;
  /** Үзэгчийн сул хос зарууд — хүсэлт илгээхэд нэгийг нь сонгоно. */
  matches: ListingSummary[];
  /** Тохирох зартай ч бүгд нь өөр хүнтэй тохирчихсон эсэх. */
  hasCommittedMatches: boolean;
  /** Үзэгч энэ зар дээр аль хэдийн яриа эхлүүлсэн бол түүний id. */
  conversationId: number | null;
  /** Зар дээр тохирсон хэлцэл. */
  deal: ListingDeal | null;
}) {
  return (
    <PageContainer width="reading">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-ink-soft">{listing.kicker}</span>
          <StatusBadge status={listing.status} matched={deal !== null} />
        </div>

        <h1 className="mt-2 break-words text-xl font-bold text-ink sm:text-2xl">{listing.title}</h1>

        <ListingStats stats={listing.stats} />

        {listing.body ? (
          <p className="mt-6 whitespace-pre-wrap break-words text-sm text-ink-soft">{listing.body}</p>
        ) : null}

        <ListingOwner listing={listing} rating={ownerRating} />
      </Card>

      <Card className="mt-6">
        <ListingContact
          listing={listing}
          viewer={viewer}
          matches={matches}
          hasCommittedMatches={hasCommittedMatches}
          conversationId={conversationId}
          deal={deal}
        />
      </Card>
    </PageContainer>
  );
}
