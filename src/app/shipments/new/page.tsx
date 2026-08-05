import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import ShipmentNewView from "@/views/shipments/shipment-new-view";

export const metadata: Metadata = { title: "Ачаа илгээх хүсэлт" };

export default async function ShipmentNewPage() {
  await requireUser("/shipments/new");
  return <ShipmentNewView />;
}
