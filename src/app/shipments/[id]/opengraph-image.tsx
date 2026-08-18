import { listingIdFromSlug } from "@/lib/nav";
import { getShipment } from "@/lib/data";
import { formatDate, routeEnds } from "@/lib/format";
import { SITE } from "@/constant/site";
import {
  fallbackOgImage,
  listingOgImage,
  ogEur,
  ogKg,
  OG_CONTENT_TYPE,
  OG_SIZE,
} from "@/components/og/listing-og";

export const alt = `${SITE.name} — parcel looking for a traveler`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Ачааны хүсэлтийг сошиалд хуваалцахад гарах зураг. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipmentId = listingIdFromSlug("shipment", id);
  const shipment = shipmentId === null ? null : await getShipment(shipmentId);
  if (!shipment) return fallbackOgImage();

  return listingOgImage({
    kicker: "Parcel",
    ...routeEnds(shipment),
    facts: [
      ogKg(shipment.weight_kg),
      shipment.deadline_date ? `by ${formatDate(shipment.deadline_date)}` : "Date open",
      shipment.offer_price ? `${ogEur(shipment.offer_price)} / kg` : "Price open",
    ],
  });
}
