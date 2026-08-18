import type { ListingDeal, SessionUser, UserRating } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { Card, PageContainer, StatusBadge } from "@/components/ui";
import { ListingContact, ListingOwner, ListingShare, ListingStats } from "./components";

/** Аялал ба ачааны зарын хуваалцсан дэлгэрэнгүй хуудас. */
export default function ListingDetailView({
  listing,
  viewer,
  ownerRating,
  matches,
  matchesBlocked,
  conversationId,
  deals,
  justCreated,
}: {
  listing: ListingSummary;
  viewer: SessionUser | null;
  ownerRating: UserRating;
  /** Үзэгчийн сонгож болох хос зарууд — хүсэлт илгээхэд нэгийг нь сонгоно. */
  matches: ListingSummary[];
  /** Чиглэлд нь зартай ч аль нь ч тохирохгүй байгаа эсэх. */
  matchesBlocked: boolean;
  /** Үзэгч энэ зар дээр аль хэдийн яриа эхлүүлсэн бол түүний id. */
  conversationId: number | null;
  /** Зар дээр тохирсон хэлцлүүд — аялалд олон байж болно. */
  deals: ListingDeal[];
  /** Эзэн нь зараа дөнгөж нийтлээд ирсэн эсэх — хуваалцахыг онцолно. */
  justCreated?: boolean;
}) {
  // Хаагдсан, өнгөрсөн, дүүрсэн зарыг тараах утгагүй — хүн орж ирээд л
  // "боломжгүй" гэсэн хариу авна.
  const shareable = listing.status === "active" && !listing.expired && !listing.matched;
  // Шинэ зарыг ring-ээр онцолно. Card нь border ба bg-ээ өөрөө зарладаг тул
  // тэдгээрийг дарж бичвэл аль нь ялахыг Tailwind-ийн ангиллын дараалал
  // шийднэ — ring нь өөр шинж чанар учир зөрчилдөхгүй.
  const share = shareable ? (
    <Card className={`mt-6 ${justCreated ? "ring-2 ring-stamp/50" : ""}`}>
      <ListingShare
        listing={listing}
        isOwner={viewer?.id === listing.userId}
        justCreated={justCreated}
      />
    </Card>
  ) : null;

  return (
    <PageContainer width="reading">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-ink-soft">{listing.kicker}</span>
          <StatusBadge
            status={listing.status}
            matched={listing.matched}
            matchedLabel={listing.fullLabel}
            expired={listing.expired}
          />
        </div>

        <h1 className="mt-2 break-words text-xl font-bold text-ink sm:text-2xl">{listing.title}</h1>

        <ListingStats stats={listing.stats} />

        {listing.body ? (
          <p className="mt-6 whitespace-pre-wrap break-words text-sm text-ink-soft">{listing.body}</p>
        ) : null}

        <ListingOwner listing={listing} rating={ownerRating} />
      </Card>

      {/* Шинэ зар дээр хуваалцах нь эхний алхам тул холбоо барихаас дээр гарна. */}
      {justCreated ? share : null}

      <Card className="mt-6">
        <ListingContact
          listing={listing}
          viewer={viewer}
          matches={matches}
          matchesBlocked={matchesBlocked}
          conversationId={conversationId}
          deals={deals}
        />
      </Card>

      {justCreated ? null : share}
    </PageContainer>
  );
}
