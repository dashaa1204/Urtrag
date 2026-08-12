import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShipment, getUserRating } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { shipmentSummary } from "@/lib/listing";
import { formatDate, formatKg, routeTitle } from "@/lib/format";
import { SITE } from "@/constant/site";
import { ListingDetailView } from "@/views/listings";

/** Зар бүр өөрийн гарчиг, тайлбартай байх нь хайлтад индексжихийн үндсэн нөхцөл. */
export async function generateMetadata({ params }: PageProps<"/shipments/[id]">): Promise<Metadata> {
  const { id } = await params;
  const shipment = Number.isInteger(Number(id)) ? await getShipment(Number(id)) : null;
  if (!shipment) return { title: "Ачааны хүсэлт", robots: { index: false, follow: false } };

  const route = routeTitle(shipment);
  const title = `${route} · ${formatKg(shipment.weight_kg)} ачаа`;
  const deadline = shipment.deadline_date ? ` ${formatDate(shipment.deadline_date)} дотор хүргүүлнэ.` : "";
  const description = `${route} чиглэлд ${formatKg(shipment.weight_kg)} ачаа илгээх хүсэлт.${deadline} Энэ чиглэлд аялж байвал мессежээр холбогдоорой.`;

  return {
    title,
    description,
    alternates: { canonical: `/shipments/${shipment.id}` },
    openGraph: { title, description, images: [SITE.ogImage], url: `/shipments/${shipment.id}` },
    robots: shipment.status === "active" ? undefined : { index: false, follow: true },
  };
}

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
