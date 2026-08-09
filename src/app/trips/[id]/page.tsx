import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTrip, getUserRating } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { tripSummary } from "@/lib/listing";
import { ListingDetailView } from "@/views/listings";

export const metadata: Metadata = { title: "Аялалын зар" };

export default async function TripDetailPage({ params }: PageProps<"/trips/[id]">) {
  const { id } = await params;
  const tripId = Number(id);
  if (!Number.isInteger(tripId)) notFound();

  const trip = await getTrip(tripId);
  if (!trip) notFound();

  const [viewer, ownerRating] = await Promise.all([getCurrentUser(), getUserRating(trip.user_id)]);
  return <ListingDetailView listing={tripSummary(trip)} viewer={viewer} ownerRating={ownerRating} />;
}
