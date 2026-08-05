import type { Metadata } from "next";
import { listShipments } from "@/lib/data";
import { isDirection } from "@/constant/directions";
import ShipmentsView from "@/views/shipments/shipments-view";

export const metadata: Metadata = { title: "Ачаанууд" };

export default async function ShipmentsPage({ searchParams }: PageProps<"/shipments">) {
  const { direction } = await searchParams;
  const filter = isDirection(direction) ? direction : undefined;
  return <ShipmentsView shipments={listShipments({ direction: filter })} direction={filter} />;
}
