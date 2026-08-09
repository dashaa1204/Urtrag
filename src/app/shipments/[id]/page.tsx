import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShipment, getUserRating } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { shipmentSummary } from "@/lib/listing";
import { ListingDetailView } from "@/views/listings";

export const metadata: Metadata = { title: "Ачааны хүсэлт" };

export default async function ShipmentDetailPage({ params }: PageProps<"/shipments/[id]">) {
  const { id } = await params;
  const shipmentId = Number(id);
  if (!Number.isInteger(shipmentId)) notFound();

  const shipment = await getShipment(shipmentId);
  if (!shipment) notFound();

  const [viewer, ownerRating] = await Promise.all([getCurrentUser(), getUserRating(shipment.user_id)]);
  return (
    <ListingDetailView listing={shipmentSummary(shipment)} viewer={viewer} ownerRating={ownerRating} />
  );
}
