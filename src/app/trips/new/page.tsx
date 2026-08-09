import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ListingFormView } from "@/views/listings";
import { TripForm } from "@/views/trips/components";

export const metadata: Metadata = { title: "Аялал зарлах" };

export default async function TripNewPage() {
  await requireUser("/trips/new");

  return (
    <ListingFormView type="trip" mode="new">
      <TripForm />
    </ListingFormView>
  );
}
