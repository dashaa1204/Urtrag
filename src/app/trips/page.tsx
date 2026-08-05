import type { Metadata } from "next";
import { listTrips } from "@/lib/data";
import { isDirection } from "@/constant/directions";
import TripsView from "@/views/trips/trips-view";

export const metadata: Metadata = { title: "Аялалууд" };

export default async function TripsPage({ searchParams }: PageProps<"/trips">) {
  const { direction } = await searchParams;
  const filter = isDirection(direction) ? direction : undefined;
  return <TripsView trips={listTrips({ direction: filter })} direction={filter} />;
}
