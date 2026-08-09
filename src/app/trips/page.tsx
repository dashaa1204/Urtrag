import type { Metadata } from "next";
import { listTrips } from "@/lib/data";
import { tripSummary } from "@/lib/listing";
import { isDirection } from "@/constant/directions";
import { ListingsView } from "@/views/listings";

export const metadata: Metadata = { title: "Аялалууд" };

export default async function TripsPage({ searchParams }: PageProps<"/trips">) {
  const { direction } = await searchParams;
  const filter = isDirection(direction) ? direction : undefined;
  const trips = await listTrips({ direction: filter });

  return <ListingsView type="trip" listings={trips.map(tripSummary)} direction={filter} />;
}
