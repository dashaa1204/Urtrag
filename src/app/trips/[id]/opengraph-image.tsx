import { listingIdFromSlug } from "@/lib/nav";
import { getTrip } from "@/lib/data";
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

export const alt = `${SITE.name} — trip with free luggage space`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Аялалын зарыг сошиалд хуваалцахад гарах зураг. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tripId = listingIdFromSlug("trip", id);
  const trip = tripId === null ? null : await getTrip(tripId);
  if (!trip) return fallbackOgImage();

  return listingOgImage({
    kicker: "Trip",
    ...routeEnds(trip),
    facts: [
      formatDate(trip.travel_date),
      `${ogKg(trip.available_kg)} free`,
      `${ogEur(trip.price_per_kg)} / kg`,
    ],
  });
}
