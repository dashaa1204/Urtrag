import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getConversation,
  getOwnReview,
  getShipment,
  getTrip,
  getUserName,
  hasMessageFrom,
  listMessages,
  markConversationRead,
} from "@/lib/data";
import { formatDate, formatKg } from "@/lib/format";
import ConversationView from "@/views/messages/conversation-view";

export const metadata: Metadata = { title: "Харилцан яриа" };

export default async function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  const { id } = await params;
  const user = await requireUser("/messages");

  const conversation = getConversation(Number(id));
  if (!conversation || (conversation.starter_id !== user.id && conversation.owner_id !== user.id)) {
    notFound();
  }

  markConversationRead(conversation.id, user.id);

  const otherId = conversation.starter_id === user.id ? conversation.owner_id : conversation.starter_id;
  const otherName = getUserName(otherId) ?? "Хэрэглэгч";

  let listingTitle: string;
  let listingHref: string;
  if (conversation.listing_type === "trip") {
    const trip = getTrip(conversation.listing_id);
    listingTitle = trip ? `Аялал · ${formatDate(trip.travel_date)}` : "Аялал";
    listingHref = `/trips/${conversation.listing_id}`;
  } else {
    const shipment = getShipment(conversation.listing_id);
    listingTitle = shipment ? `Ачаа · ${formatKg(shipment.weight_kg)}` : "Ачаа";
    listingHref = `/shipments/${conversation.listing_id}`;
  }

  return (
    <ConversationView
      conversation={conversation}
      messages={listMessages(conversation.id)}
      currentUserId={user.id}
      otherName={otherName}
      listingTitle={listingTitle}
      listingHref={listingHref}
      canReview={hasMessageFrom(conversation.id, otherId)}
      ownReview={getOwnReview(conversation.id, user.id)}
    />
  );
}
