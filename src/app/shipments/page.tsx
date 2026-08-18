import type { Metadata } from "next";
import { listShipments, shipmentSummaries } from "@/lib/data";
import { isCountryCode } from "@/constant/cities";
import { ListingsView } from "@/views/listings";

export const metadata: Metadata = {
  title: "Ачаанууд — илгээхээр хүлээгдэж буй хүсэлтүүд",
  description:
    "Хүргүүлэхээр хүлээж буй ачааны хүсэлтүүд. Аялж байгаа бол чиглэлээрээ шүүж, сул жингээ ашиглаарай.",
  alternates: { canonical: "/shipments" },
};

export default async function ShipmentsPage({ searchParams }: PageProps<"/shipments">) {
  const { from, to } = await searchParams;
  const fromCountry = isCountryCode(from) ? from : undefined;
  const toCountry = isCountryCode(to) ? to : undefined;
  const shipments = await listShipments({ fromCountry, toCountry });

  return (
    <ListingsView
      type="shipment"
      listings={await shipmentSummaries(shipments)}
      fromCountry={fromCountry}
      toCountry={toCountry}
    />
  );
}
