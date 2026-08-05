import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShipment, getUserRating } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import ShipmentDetailView from "@/views/shipments/shipment-detail-view";

export const metadata: Metadata = { title: "Ачааны хүсэлт" };

export default async function ShipmentDetailPage({ params }: PageProps<"/shipments/[id]">) {
  const { id } = await params;
  const shipment = getShipment(Number(id));
  if (!shipment) notFound();
  const viewer = await getCurrentUser();
  return <ShipmentDetailView shipment={shipment} viewer={viewer} ownerRating={getUserRating(shipment.user_id)} />;
}
