import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listingIdFromSlug } from "@/lib/nav";
import { requireUser } from "@/lib/auth";
import { getTrip } from "@/lib/data";
import { ListingFormView } from "@/views/listings";
import { TripForm } from "@/views/trips/components";

export const metadata: Metadata = { title: "Аялалын зар засах", robots: { index: false, follow: false }, };

export default async function TripEditPage({ params }: PageProps<"/trips/[id]/edit">) {
  const { id } = await params;
  const tripId = listingIdFromSlug("trip", id);
  if (tripId === null) notFound();

  const user = await requireUser();
  const trip = await getTrip(tripId);
  if (!trip || trip.user_id !== user.id) notFound();

  return (
    <ListingFormView type="trip" mode="edit">
      <TripForm trip={trip} />
    </ListingFormView>
  );
}
