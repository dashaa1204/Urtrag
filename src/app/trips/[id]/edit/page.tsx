import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTrip } from "@/lib/data";
import TripEditView from "@/views/trips/trip-edit-view";

export const metadata: Metadata = { title: "Аялалын зар засах" };

export default async function TripEditPage({ params }: PageProps<"/trips/[id]/edit">) {
  const { id } = await params;
  const tripId = Number(id);
  if (!Number.isInteger(tripId)) notFound();

  const user = await requireUser();
  const trip = await getTrip(tripId);
  if (!trip || trip.user_id !== user.id) notFound();
  return <TripEditView trip={trip} />;
}
