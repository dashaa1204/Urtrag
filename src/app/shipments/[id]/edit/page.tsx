import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getShipment } from "@/lib/data";
import { ListingFormView } from "@/views/listings";
import { ShipmentForm } from "@/views/shipments/components";

export const metadata: Metadata = { title: "Ачааны хүсэлт засах", robots: { index: false, follow: false }, };

export default async function ShipmentEditPage({ params }: PageProps<"/shipments/[id]/edit">) {
  const { id } = await params;
  const shipmentId = Number(id);
  if (!Number.isInteger(shipmentId)) notFound();

  const user = await requireUser();
  const shipment = await getShipment(shipmentId);
  if (!shipment || shipment.user_id !== user.id) notFound();

  return (
    <ListingFormView type="shipment" mode="edit">
      <ShipmentForm shipment={shipment} />
    </ListingFormView>
  );
}
