import Link from "next/link";
import type { ListingDeal, ListingType, SessionUser } from "@/types";
import { counterpartType, type ListingSummary } from "@/lib/listing";
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
export function ListingContact({
  listing,
  viewer,
  matches,
  hasCommittedMatches,
  conversationId,
  deal,
}: {
  listing: ListingSummary;
  viewer: SessionUser | null;
  /** Үзэгчийн сул байгаа хос зарууд — эдгээрээс сонгож хүсэлт илгээнэ. */
  matches: ListingSummary[];
  /** Тохирох зартай ч бүгд нь өөр хүнтэй тохирчихсон эсэх. */
  hasCommittedMatches: boolean;
  /** Энэ зар дээр аль хэдийн эхэлсэн яриа. */
  conversationId: number | null;
  /** Энэ зар дээр тохирсон хэлцэл. */
  deal: ListingDeal | null;
}) {
  const conversationLink = conversationId ? (
    <Link href={`/messages/${conversationId}`} className="text-sm text-ink-soft hover:text-ink">
      Харилцан яриа →
    </Link>
  ) : null;

  if (viewer?.id === listing.userId) {
    return (
      <>
        {deal ? (
          <p className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Энэ зар тохирсон байна. Болихоор бол харилцан ярианаасаа цуцлаарай.
            <Link href={`/messages/${deal.conversation_id}`} className="font-semibold hover:underline">
              Харилцан яриа →
            </Link>
          </p>
        ) : null}
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
  if (deal && (deal.starter_id === viewer.id || deal.owner_id === viewer.id)) {
    return (
      <p className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-soft">
        Та энэ зартай тохирсон байна.
        <Link
          href={`/messages/${deal.conversation_id}`}
          className="font-semibold text-stamp hover:underline"
        >
          Харилцан яриа →
        </Link>
      </p>
    );
  }

  // Зарыг жагсаалтаас нуухгүй: тохиролцоо цуцлагдвал дараагийн хүн хэрэгтэй
  // болно. Гэхдээ хүлээлт үүсгэхгүйн тулд төлөвийг нь ил хэлнэ.
  const takenNotice = deal ? (
    <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
      Энэ зар өөр хүсэлттэй тохирчихсон байна. Хүсэлтээ илгээж болно — тэр
      тохиролцоо цуцлагдвал эзэн нь тантай холбогдоно.
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
        {takenNotice}
        <MessageForm
          listingType={listing.type}
          listingId={listing.id}
          placeholder={listing.contactPlaceholder}
        />
      </>
    );
  }

  // Хүсэлт илгээхийн тулд ижил ЧИГЛЭЛИЙН, сул хос зар (аялал ↔ ачаа) байх ёстой.
  const matchType = counterpartType(listing.type);
  if (matches.length === 0) {
    const copy = MATCH_COPY[matchType];
    return (
      <>
        {takenNotice}
        <EmptyState
          title={hasCommittedMatches ? copy.committedTitle : copy.emptyTitle}
          description={
            hasCommittedMatches ? copy.committedDescription : copy.emptyDescription(listing.title)
          }
          action={
            <Link href={createMatchHref(listing, matchType)} className={btnPrimary}>
              {LISTING_COPY[matchType].createLabel}
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <h2 className="mb-3 font-semibold text-ink">{listing.userName}-тай холбогдох</h2>
      {takenNotice}
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
