import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getConversation,
  getOwnReview,
  getShipment,
  getTrip,
  getUserProfile,
  hasMessageFrom,
  listMessages,
  markConversationRead,
} from "@/lib/data";
import { avatarUrl } from "@/lib/avatar";
import { counterpartType, listingPath } from "@/lib/listing";
import { formatDate, formatKg } from "@/lib/format";
import ConversationView from "@/views/messages/conversation-view";

export const metadata: Metadata = { title: "Харилцан яриа", robots: { index: false, follow: false }, };

export default async function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  const { id } = await params;
  const conversationId = Number(id);
  if (!Number.isInteger(conversationId)) notFound();

  const user = await requireUser("/messages");

  const conversation = await getConversation(conversationId);
  if (!conversation || (conversation.starter_id !== user.id && conversation.owner_id !== user.id)) {
    notFound();
  }

  const hadUnread = await markConversationRead(conversation.id, user.id);

  const otherId = conversation.starter_id === user.id ? conversation.owner_id : conversation.starter_id;

  const [other, messages, canReview, ownReview] = await Promise.all([
    getUserProfile(otherId),
    listMessages(conversation.id),
    hasMessageFrom(conversation.id, otherId),
    getOwnReview(conversation.id, user.id),
  ]);

  let listingTitle: string;
  let listingHref: string;
  if (conversation.listing_type === "trip") {
    const trip = await getTrip(conversation.listing_id);
    listingTitle = trip ? `Аялал · ${formatDate(trip.travel_date)}` : "Аялал";
    listingHref = `/trips/${conversation.listing_id}`;
  } else {
    const shipment = await getShipment(conversation.listing_id);
    listingTitle = shipment ? `Ачаа · ${formatKg(shipment.weight_kg)}` : "Ачаа";
    listingHref = `/shipments/${conversation.listing_id}`;
  }

  // Яриа эхлүүлэгчийн хос зар. Устсан эсвэл хуучин ярианд байхгүй байж болно.
  const otherName = other?.name ?? "Хэрэглэгч";
  const matchType = counterpartType(conversation.listing_type);
  const matchId = conversation.matched_listing_id;
  const matchLabel = conversation.starter_id === user.id ? "Таны зар" : `${otherName}-ийн зар`;
  let match: { label: string; title: string; href: string } | null = null;
  if (matchId !== null) {
    if (matchType === "trip") {
      const trip = await getTrip(matchId);
      if (trip) {
        match = {
          label: matchLabel,
          title: `Аялал · ${formatDate(trip.travel_date)}`,
          href: listingPath("trip", trip.id),
        };
      }
    } else {
      const shipment = await getShipment(matchId);
      if (shipment) {
        match = {
          label: matchLabel,
          title: `Ачаа · ${formatKg(shipment.weight_kg)}`,
          href: listingPath("shipment", shipment.id),
        };
      }
    }
  }

  return (
    <ConversationView
      conversation={conversation}
      messages={messages}
      currentUserId={user.id}
      otherId={otherId}
      otherName={otherName}
      otherAvatar={avatarUrl(other?.avatar_path)}
      listingTitle={listingTitle}
      listingHref={listingHref}
      match={match}
      canReview={canReview}
      ownReview={ownReview}
      hadUnread={hadUnread}
    />
  );
}
