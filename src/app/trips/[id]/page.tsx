import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  committedListingIds,
  findConversation,
  getListingDeal,
  getTrip,
  getUserRating,
  userActiveShipments,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { sameRoute, shipmentSummary, tripSummary, type ListingSummary } from "@/lib/listing";
import { formatDate, formatKg, formatPrice, routeTitle } from "@/lib/format";
import { SITE } from "@/constant/site";
import { ListingDetailView } from "@/views/listings";

/** Зар бүр өөрийн гарчиг, тайлбартай байх нь хайлтад индексжихийн үндсэн нөхцөл. */
export async function generateMetadata({ params }: PageProps<"/trips/[id]">): Promise<Metadata> {
  const { id } = await params;
  const trip = Number.isInteger(Number(id)) ? await getTrip(Number(id)) : null;
  if (!trip) return { title: "Аялалын зар", robots: { index: false, follow: false } };

  const route = routeTitle(trip);
  const title = `${route} · ${formatDate(trip.travel_date)}`;
  const description = `${route} чиглэлд ${formatDate(trip.travel_date)}-нд аялах хүн ${formatKg(
    trip.available_kg
  )} ачаа авах боломжтой. Үнэ: ${formatPrice(trip.price_per_kg)}/кг. Мессежээр шууд тохиролцоорой.`;

  return {
    title,
    description,
    alternates: { canonical: `/trips/${trip.id}` },
    openGraph: { title, description, images: [SITE.ogImage], url: `/trips/${trip.id}` },
    robots: trip.status === "active" ? undefined : { index: false, follow: true },
  };
}

export default async function TripDetailPage({ params }: PageProps<"/trips/[id]">) {
  const { id } = await params;
  const tripId = Number(id);
  if (!Number.isInteger(tripId)) notFound();

  const trip = await getTrip(tripId);
  if (!trip) notFound();

  const [viewer, ownerRating, deal] = await Promise.all([
    getCurrentUser(),
    getUserRating(trip.user_id),
    getListingDeal("trip", trip.id),
  ]);

  const listing = tripSummary(trip);

  // Аялалын зар руу ачаагаараа хандана — үзэгчийн ижил чиглэлийн, өөр хүнтэй
  // тохироогүй ачааны заруудыг сонгуулахаар бэлдэнэ.
  let matches: ListingSummary[] = [];
  let hasCommittedMatches = false;
  let conversationId: number | null = null;
  if (viewer && viewer.id !== trip.user_id && trip.status === "active") {
    const [shipments, existing] = await Promise.all([
      userActiveShipments(viewer.id),
      findConversation("trip", trip.id, viewer.id),
    ]);
    const onRoute = shipments.map(shipmentSummary).filter((match) => sameRoute(match, listing));
    const committed = await committedListingIds(
      "shipment",
      onRoute.map((match) => match.id)
    );
    matches = onRoute.filter((match) => !committed.has(match.id));
    hasCommittedMatches = committed.size > 0;
    conversationId = existing;
  }

  return (
    <ListingDetailView
      listing={listing}
      viewer={viewer}
      ownerRating={ownerRating}
      matches={matches}
      hasCommittedMatches={hasCommittedMatches}
      conversationId={conversationId}
      deal={deal}
    />
  );
}
