import type { Metadata } from "next";
import { listShipments } from "@/lib/data";
import { shipmentSummary } from "@/lib/listing";
import { isDirection } from "@/constant/directions";
import { ListingsView } from "@/views/listings";

export const metadata: Metadata = { title: "Ачаанууд" };

export default async function ShipmentsPage({ searchParams }: PageProps<"/shipments">) {
  const { direction } = await searchParams;
  const filter = isDirection(direction) ? direction : undefined;
  const shipments = await listShipments({ direction: filter });

  return <ListingsView type="shipment" listings={shipments.map(shipmentSummary)} direction={filter} />;
}
