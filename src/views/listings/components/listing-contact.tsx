import Link from "next/link";
import type { ListingDeal, ListingType, SessionUser } from "@/types";
import { counterpartType, type ListingSummary } from "@/lib/listing";
import { conversationPath } from "@/lib/nav";
import { formatKg } from "@/lib/format";
import { btnPrimary, EmptyState, MessageForm } from "@/components/ui";
import { LISTING_COPY, MATCH_COPY } from "@/constant/listings";
import { ListingMatchPicker } from "./listing-match-picker";
import { OwnerActions } from "./owner-actions";

/**
 * "Зар оруулах" холбоос. Чиглэл нь таарах ёстой тул хот хоёуланг нь урьдчилж
 * бөглөж, хадгалсны дараа энэ зар руу нь буцаана.
 */
function createMatchHref(listing: ListingSummary, matchType: ListingType): string {
  const params = new URLSearchParams({ next: listing.href });
  if (listing.fromCity) params.set("from", listing.fromCity);
  if (listing.toCity) params.set("to", listing.toCity);
  return `${LISTING_COPY[matchType].createHref}?${params}`;
}

/**
 * Дэлгэрэнгүй хуудасны доод хайрцаг. Үзэгч хэн байхаас хамаарч
 * эзний удирдлага, мессежийн форм, эсвэл нэвтрэх урилга харуулна.
 */
/** Эзэнд харагдах тохирсон хэлцлүүдийн хураангуй. */
function DealSummary({ listing, deals }: { listing: ListingSummary; deals: ListingDeal[] }) {
  const isTrip = listing.type === "trip";

  return (
    <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <p className="font-medium">
        {isTrip
          ? `${deals.length} ачаа захиалагдсан${
              listing.remainingKg !== undefined ? ` · ${formatKg(listing.remainingKg)} сул үлдсэн` : ""
            }.`
          : "Энэ зар тохирсон байна. Болихоор бол харилцан ярианаасаа цуцлаарай."}
      </p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {deals.map((deal) => (
          <li key={deal.conversation_id}>
            <Link href={conversationPath(deal.conversation_id)} className="font-semibold hover:underline">
              Харилцан яриа →
            </Link>
            {deal.shipment_kg !== null ? (
              <span className="ml-2 text-amber-800/80">{formatKg(deal.shipment_kg)}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ListingContact({
  listing,
  viewer,
  matches,
  matchesBlocked,
  conversationId,
  deals,
}: {
  listing: ListingSummary;
  viewer: SessionUser | null;
  /** Үзэгчийн сонгож болох хос зарууд — эдгээрээс сонгож хүсэлт илгээнэ. */
  matches: ListingSummary[];
  /** Чиглэлд нь зартай ч аль нь ч тохирохгүй байгаа эсэх. */
  matchesBlocked: boolean;
  /** Энэ зар дээр аль хэдийн эхэлсэн яриа. */
  conversationId: number | null;
  /** Энэ зар дээр тохирсон хэлцлүүд. */
  deals: ListingDeal[];
}) {
  const conversationLink = conversationId ? (
    <Link href={conversationPath(conversationId)} className="text-sm text-ink-soft hover:text-ink">
      Харилцан яриа →
    </Link>
  ) : null;

  if (viewer?.id === listing.userId) {
    return (
      <>
        {deals.length > 0 ? <DealSummary listing={listing} deals={deals} /> : null}
        <OwnerActions listing={listing} />
      </>
    );
  }

  if (listing.status === "closed") {
    return <p className="text-sm text-ink-soft">Энэ зар хаагдсан байна.</p>;
  }

  if (!viewer) {
    return (
      <p className="text-sm text-ink-soft">
        {listing.contactPrompt}{" "}
        <Link
          href={`/login?next=${listing.href}`}
          className="font-semibold text-stamp hover:underline"
        >
          нэвтэрч орно уу
        </Link>
        .
      </p>
    );
  }

  // Хэлцэл нь энэ үзэгчтэй хийгдсэн бол — цуцлах товч нь харилцан яриан дотор.
  const ownDeal = deals.find(
    (deal) => deal.starter_id === viewer.id || deal.owner_id === viewer.id
  );
  if (ownDeal) {
    return (
      <p className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-soft">
        Та энэ зартай тохирсон байна.
        <Link
          href={conversationPath(ownDeal.conversation_id)}
          className="font-semibold text-stamp hover:underline"
        >
          Харилцан яриа →
        </Link>
      </p>
    );
  }

  // Зарыг жагсаалтаас нуухгүй: тохиролцоо цуцлагдвал дараагийн хүн хэрэгтэй
  // болно. Гэхдээ хүлээлт үүсгэхгүйн тулд төлөвийг нь ил хэлнэ.
  const fullNotice = listing.matched ? (
    <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
      {listing.fullNotice}
    </p>
  ) : null;

  // Хос зар нь яриа эхлэхэд нэг л удаа сонгогдоно. Тиймээс хүсэлт илгээчихсэн
  // бол дахин сонгуулахгүй — цаашид энгийн хариу бичнэ.
  if (conversationId !== null) {
    return (
      <>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-ink">{listing.userName}-тай холбогдох</h2>
          {conversationLink}
        </div>
        {fullNotice}
        <MessageForm
          listingType={listing.type}
          listingId={listing.id}
          placeholder={listing.contactPlaceholder}
        />
      </>
    );
  }

  // Нисчихсэн аялал болон дүүрсэн зар дээр шинэ хүсэлт сервер талдаа ч
  // татгалзагдана — форм үзүүлэхгүй. Байгаа яриа дээр хариу бичих нь дээрх
  // салбарт хэвээр үлдэнэ.
  if (listing.expired) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Энэ аялалын огноо өнгөрсөн байна. Шинэ хүсэлт хүлээж авахгүй.
      </p>
    );
  }
  if (listing.matched) return fullNotice;

  // Хүсэлт илгээхийн тулд ижил ЧИГЛЭЛИЙН, багтах хос зар (аялал ↔ ачаа) байх ёстой.
  const matchType = counterpartType(listing.type);
  if (matches.length === 0) {
    const copy = MATCH_COPY[matchType];
    return (
      <EmptyState
        title={matchesBlocked ? copy.blockedTitle : copy.emptyTitle}
        description={matchesBlocked ? copy.blockedDescription : copy.emptyDescription(listing.title)}
        action={
          <Link href={createMatchHref(listing, matchType)} className={btnPrimary}>
            {LISTING_COPY[matchType].createLabel}
          </Link>
        }
      />
    );
  }

  return (
    <>
      <h2 className="mb-3 font-semibold text-ink">{listing.userName}-тай холбогдох</h2>
      <MessageForm
        listingType={listing.type}
        listingId={listing.id}
        placeholder={listing.contactPlaceholder}
      >
        <ListingMatchPicker listings={matches} type={matchType} />
      </MessageForm>
    </>
  );
}
