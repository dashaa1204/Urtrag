import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  committedListingIds,
  findConversation,
  getListingDeal,
  getShipment,
  getUserRating,
  userActiveTrips,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { sameRoute, shipmentSummary, tripSummary, type ListingSummary } from "@/lib/listing";
import { formatDate, formatKg, routeTitle } from "@/lib/format";
import { SITE } from "@/constant/site";
import { ListingDetailView } from "@/views/listings";

/** Зар бүр өөрийн гарчиг, тайлбартай байх нь хайлтад индексжихийн үндсэн нөхцөл. */
export async function generateMetadata({ params }: PageProps<"/shipments/[id]">): Promise<Metadata> {
  const { id } = await params;
  const shipment = Number.isInteger(Number(id)) ? await getShipment(Number(id)) : null;
  if (!shipment) return { title: "Ачааны хүсэлт", robots: { index: false, follow: false } };

  const route = routeTitle(shipment);
  const title = `${route} · ${formatKg(shipment.weight_kg)} ачаа`;
  const deadline = shipment.deadline_date ? ` ${formatDate(shipment.deadline_date)} дотор хүргүүлнэ.` : "";
  const description = `${route} чиглэлд ${formatKg(shipment.weight_kg)} ачаа илгээх хүсэлт.${deadline} Энэ чиглэлд аялж байвал мессежээр холбогдоорой.`;

  return {
    title,
    description,
    alternates: { canonical: `/shipments/${shipment.id}` },
    openGraph: { title, description, images: [SITE.ogImage], url: `/shipments/${shipment.id}` },
    robots: shipment.status === "active" ? undefined : { index: false, follow: true },
  };
}

export default async function ShipmentDetailPage({ params }: PageProps<"/shipments/[id]">) {
  const { id } = await params;
  const shipmentId = Number(id);
  if (!Number.isInteger(shipmentId)) notFound();

  const shipment = await getShipment(shipmentId);
  if (!shipment) notFound();

  const [viewer, ownerRating, deal] = await Promise.all([
    getCurrentUser(),
    getUserRating(shipment.user_id),
    getListingDeal("shipment", shipment.id),
  ]);

  const listing = shipmentSummary(shipment);

  // Ачааны зар руу аялалаараа хандана — үзэгчийн ижил чиглэлийн, өөр хүнтэй
  // тохироогүй аялалуудыг сонгуулахаар бэлдэнэ.
  let matches: ListingSummary[] = [];
  let hasCommittedMatches = false;
  let conversationId: number | null = null;
  if (viewer && viewer.id !== shipment.user_id && shipment.status === "active") {
    const [trips, existing] = await Promise.all([
      userActiveTrips(viewer.id),
      findConversation("shipment", shipment.id, viewer.id),
    ]);
    const onRoute = trips.map(tripSummary).filter((match) => sameRoute(match, listing));
    const committed = await committedListingIds(
      "trip",
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
