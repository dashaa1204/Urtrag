import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { listingIdFromSlug, listingPath, listingSlug, withQuery } from "@/lib/nav";
import {
  findConversation,
  listingDeals,
  getShipment,
  getUserRating,
  tripLoads,
  userActiveTrips,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { fitsCapacity, sameRoute, shipmentSummary, tripSummary, type ListingSummary } from "@/lib/listing";
import { formatDate, formatKg, routeTitle } from "@/lib/format";
import { ListingDetailView } from "@/views/listings";

/** Зар бүр өөрийн гарчиг, тайлбартай байх нь хайлтад индексжихийн үндсэн нөхцөл. */
export async function generateMetadata({ params }: PageProps<"/shipments/[id]">): Promise<Metadata> {
  const { id } = await params;
  const shipmentId = listingIdFromSlug("shipment", id);
  const shipment = shipmentId === null ? null : await getShipment(shipmentId);
  if (!shipment) return { title: "Ачааны хүсэлт", robots: { index: false, follow: false } };

  const canonical = listingPath("shipment", shipment);
  const route = routeTitle(shipment);
  const title = `${route} · ${formatKg(shipment.weight_kg)} ачаа`;
  const deadline = shipment.deadline_date ? ` ${formatDate(shipment.deadline_date)} дотор хүргүүлнэ.` : "";
  const description = `${route} чиглэлд ${formatKg(shipment.weight_kg)} ачаа илгээх хүсэлт.${deadline} Энэ чиглэлд аялж байвал мессежээр холбогдоорой.`;

  return {
    title,
    description,
    alternates: { canonical },
    // og:image-ыг зарлахгүй — энэ хавтасны opengraph-image.tsx нь зарын
    // чиглэл, жинг агуулсан зургаа өөрөө үүсгэж хавсаргана.
    openGraph: { title, description, url: canonical },
    robots: shipment.status === "active" ? undefined : { index: false, follow: true },
  };
}

export default async function ShipmentDetailPage({
  params,
  searchParams,
}: PageProps<"/shipments/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const shipmentId = listingIdFromSlug("shipment", id);
  if (shipmentId === null) notFound();

  const shipment = await getShipment(shipmentId);
  if (!shipment) notFound();

  // Хаягийн чимэглэл хэсэг хуучирсан (жин нь засагдсан) эсвэл огт байхгүй бол
  // жинхэнэ хаяг руу нь шилжүүлнэ — нэг зар хоёр хаягаар индексжих ёсгүй.
  const slug = listingSlug("shipment", shipment);
  if (slug && id !== slug) permanentRedirect(withQuery(listingPath("shipment", shipment), query));

  const [viewer, ownerRating, deals] = await Promise.all([
    getCurrentUser(),
    getUserRating(shipment.user_id),
    listingDeals("shipment", shipment.id),
  ]);

  const listing = shipmentSummary(shipment, deals.length > 0);

  // Ачааны зар руу аялалаараа хандана — үзэгчийн ижил чиглэлийн, энэ ачааг
  // БАГТААХ сул жинтэй аялалуудыг сонгуулахаар бэлдэнэ.
  let matches: ListingSummary[] = [];
  let matchesBlocked = false;
  let conversationId: number | null = null;
  if (viewer && viewer.id !== shipment.user_id && shipment.status === "active") {
    const [trips, existing] = await Promise.all([
      userActiveTrips(viewer.id),
      findConversation("shipment", shipment.id, viewer.id),
    ]);
    const onRoute = trips.filter((trip) => sameRoute(trip, shipment));
    const loads = await tripLoads(onRoute.map((trip) => trip.id));
    // Ачаа хуваагдахгүй тул тохирчихсон бол ямар ч аялал сонгогдохгүй.
    matches = listing.matched
      ? []
      : onRoute
          .filter((trip) =>
            fitsCapacity(shipment.weight_kg, trip.available_kg - (loads.get(trip.id) ?? 0))
          )
          .map((trip) => tripSummary(trip, loads.get(trip.id) ?? 0));
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
      justCreated={query.new === "1" && viewer?.id === shipment.user_id}
    />
  );
}
