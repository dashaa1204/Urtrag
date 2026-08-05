import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import TripNewView from "@/views/trips/trip-new-view";

export const metadata: Metadata = { title: "Аялал зарлах" };

export default async function TripNewPage() {
  await requireUser("/trips/new");
  return <TripNewView />;
}
