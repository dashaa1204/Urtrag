import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { listingIdFromSlug, listingPath, listingSlug, withQuery } from "@/lib/nav";
import {
  committedShipmentIds,
  findConversation,
  listingDeals,
  getTrip,
  getUserRating,
  tripBookedKg,
  userActiveShipments,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { fitsCapacity, sameRoute, shipmentSummary, tripSummary, type ListingSummary } from "@/lib/listing";
import { formatDate, formatKg, formatPrice, routeTitle } from "@/lib/format";
import { ListingDetailView } from "@/views/listings";

/** Зар бүр өөрийн гарчиг, тайлбартай байх нь хайлтад индексжихийн үндсэн нөхцөл. */
export async function generateMetadata({ params }: PageProps<"/trips/[id]">): Promise<Metadata> {
  const { id } = await params;
  const tripId = listingIdFromSlug("trip", id);
  const trip = tripId === null ? null : await getTrip(tripId);
  if (!trip) return { title: "Аялалын зар", robots: { index: false, follow: false } };

  const canonical = listingPath("trip", trip);
  const route = routeTitle(trip);
  const title = `${route} · ${formatDate(trip.travel_date)}`;
  const description = `${route} чиглэлд ${formatDate(trip.travel_date)}-нд аялах хүн ${formatKg(
    trip.available_kg
  )} ачаа авах боломжтой. Үнэ: ${formatPrice(trip.price_per_kg)}/кг. Мессежээр шууд тохиролцоорой.`;

  return {
    title,
    description,
    alternates: { canonical },
    // og:image-ыг зарлахгүй — энэ хавтасны opengraph-image.tsx нь зарын
    // чиглэл, огноог агуулсан зургаа өөрөө үүсгэж хавсаргана.
    openGraph: { title, description, url: canonical },
    robots: trip.status === "active" ? undefined : { index: false, follow: true },
  };
}

export default async function TripDetailPage({ params, searchParams }: PageProps<"/trips/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const tripId = listingIdFromSlug("trip", id);
  if (tripId === null) notFound();

  const trip = await getTrip(tripId);
  if (!trip) notFound();

  // Хаягийн чимэглэл хэсэг хуучирсан (зар засагдаж, огноо нь өөрчлөгдсөн)
  // эсвэл огт байхгүй бол жинхэнэ хаяг руу нь шилжүүлнэ — нэг зар хоёр
  // хаягаар индексжих ёсгүй.
  const slug = listingSlug("trip", trip);
  if (slug && id !== slug) permanentRedirect(withQuery(listingPath("trip", trip), query));

  const [viewer, ownerRating, deals, bookedKg] = await Promise.all([
    getCurrentUser(),
    getUserRating(trip.user_id),
    listingDeals("trip", trip.id),
    tripBookedKg(trip.id),
  ]);

  const listing = tripSummary(trip, bookedKg);
  const remainingKg = listing.remainingKg ?? 0;

  // Аялалын зар руу ачаагаараа хандана — үзэгчийн ижил чиглэлийн, өөр аялагчтай
  // тохироогүй, бас үлдсэн сул жинд БАГТАХ ачаануудыг сонгуулахаар бэлдэнэ.
  let matches: ListingSummary[] = [];
  let matchesBlocked = false;
  let conversationId: number | null = null;
  if (viewer && viewer.id !== trip.user_id && trip.status === "active" && !listing.expired) {
    const [shipments, existing] = await Promise.all([
      userActiveShipments(viewer.id),
      findConversation("trip", trip.id, viewer.id),
    ]);
    const onRoute = shipments.filter((shipment) => sameRoute(shipment, trip));
    const committed = await committedShipmentIds(onRoute.map((shipment) => shipment.id));
    matches = onRoute
      .filter(
        (shipment) =>
          !committed.has(shipment.id) && fitsCapacity(shipment.weight_kg, remainingKg)
      )
      .map((shipment) => shipmentSummary(shipment));
    matchesBlocked = onRoute.length > 0 && matches.length === 0;
    conversationId = existing;
  }

  return (
    <ListingDetailView
      listing={listing}
      viewer={viewer}
      ownerRating={ownerRating}
      matches={matches}
      matchesBlocked={matchesBlocked}
      conversationId={conversationId}
      deals={deals}
      justCreated={query.new === "1" && viewer?.id === trip.user_id}
    />
  );
}
