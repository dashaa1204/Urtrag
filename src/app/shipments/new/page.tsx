import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ListingFormView } from "@/views/listings";
import { ShipmentForm } from "@/views/shipments/components";

export const metadata: Metadata = { title: "Ачаа илгээх хүсэлт", robots: { index: false, follow: false }, };

export default async function ShipmentNewPage() {
  await requireUser("/shipments/new");

  return (
    <ListingFormView type="shipment" mode="new">
      <ShipmentForm />
    </ListingFormView>
  );
}
