import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { conversationIdFromCode, listingPath } from "@/lib/nav";
import { requireUser } from "@/lib/auth";
import {
  getConversation,
  getOwnReview,
  getShipment,
  getTrip,
  getUserProfile,
  listMessages,
  markConversationRead,
} from "@/lib/data";
import { avatarUrl } from "@/lib/avatar";
import { counterpartType, travellerId } from "@/lib/listing";
import { formatDate, formatKg } from "@/lib/format";
import type { ListingType } from "@/types";
import ConversationView from "@/views/messages/conversation-view";

export const metadata: Metadata = { title: "Харилцан яриа", robots: { index: false, follow: false }, };

/**
 * Зарын гарчиг, хаяг. Зар устсан бол хаяг нь ч байхгүй тул 404 руу заахын
 * оронд жагсаалт руу — found нь хос зарыг харуулах эсэхийг шийднэ.
 */
async function listingLink(type: ListingType, id: number) {
  if (type === "trip") {
    const trip = await getTrip(id);
    return trip
      ? { found: true, title: `Аялал · ${formatDate(trip.travel_date)}`, href: listingPath("trip", trip) }
      : { found: false, title: "Аялал", href: "/trips" };
  }
  const shipment = await getShipment(id);
  return shipment
    ? { found: true, title: `Ачаа · ${formatKg(shipment.weight_kg)}`, href: listingPath("shipment", shipment) }
    : { found: false, title: "Ачаа", href: "/shipments" };
}

export default async function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  const { id } = await params;
  const conversationId = conversationIdFromCode(id);
  if (conversationId === null) notFound();

  const user = await requireUser("/messages");

  const conversation = await getConversation(conversationId);
  if (!conversation || (conversation.starter_id !== user.id && conversation.owner_id !== user.id)) {
    notFound();
  }

  const otherId = conversation.starter_id === user.id ? conversation.owner_id : conversation.starter_id;
  // Яриа эхлүүлэгчийн хос зар. Устсан эсвэл хуучин ярианд байхгүй байж болно.
  const matchId = conversation.matched_listing_id;

  // Мессеж илгээх болгонд энэ хуудас бүхэлдээ дахин render хийгддэг тул
  // дуудлагууд дараалахгүй — уншсанд тэмдэглэх нь бусдын мессежийг хөндөх тул
  // listMessages-тэй зэрэг явахад "Үзсэн" тэмдэглэгээнд нөлөөлөхгүй.
  const [hadUnread, other, messages, ownReview, listing, matchListing] = await Promise.all([
    markConversationRead(conversation.id, user.id),
    getUserProfile(otherId),
    listMessages(conversation.id),
    getOwnReview(conversation.id, user.id),
    listingLink(conversation.listing_type, conversation.listing_id),
    matchId === null ? null : listingLink(counterpartType(conversation.listing_type), matchId),
  ]);

  // Үнэлгээ нь бодит тохиролцоог илэрхийлнэ. Цуцлагдсан ч нэг удаа тохирсон
  // байсан бол хэвээр нээлттэй — ачаа хүргэгдсэний дараа зар хаагдаж, устаж
  // болно.
  const canReview = conversation.accepted_at !== null;

  const otherName = other?.name ?? "Хэрэглэгч";
  const match = matchListing?.found
    ? {
        label: conversation.starter_id === user.id ? "Таны зар" : `${otherName}-ийн зар`,
        title: matchListing.title,
        href: matchListing.href,
      }
    : null;

  return (
    <ConversationView
      conversation={conversation}
      messages={messages}
      currentUserId={user.id}
      otherId={otherId}
      otherName={otherName}
      otherAvatar={avatarUrl(other?.avatar_path)}
      listingTitle={listing.title}
      listingHref={listing.href}
      match={match}
      canAccept={travellerId(conversation) === user.id}
      canReview={canReview}
      ownReview={ownReview}
      hadUnread={hadUnread}
    />
  );
}
