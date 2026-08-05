import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getShipment } from "@/lib/data";
import ShipmentEditView from "@/views/shipments/shipment-edit-view";

export const metadata: Metadata = { title: "Ачааны хүсэлт засах" };

export default async function ShipmentEditPage({ params }: PageProps<"/shipments/[id]/edit">) {
  const { id } = await params;
  const user = await requireUser();
  const shipment = getShipment(Number(id));
  if (!shipment || shipment.user_id !== user.id) notFound();
  return <ShipmentEditView shipment={shipment} />;
}
