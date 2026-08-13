import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { internalPath } from "@/lib/nav";
import { ListingFormView } from "@/views/listings";
import { ShipmentForm } from "@/views/shipments/components";

export const metadata: Metadata = { title: "Ачаа илгээх хүсэлт", robots: { index: false, follow: false }, };

export default async function ShipmentNewPage({ searchParams }: PageProps<"/shipments/new">) {
  const { next, from, to } = await searchParams;
  // Аялалын зар дээрээс "ачаа оруулах" гэж ирвэл чиглэл нь урьдчилж бөглөгдөж,
  // хадгалсны дараа тэр зар руугаа буцна.
  const back = internalPath(next) ?? undefined;
  await requireUser(back ? `/shipments/new?next=${encodeURIComponent(back)}` : "/shipments/new");

  return (
    <ListingFormView type="shipment" mode="new">
      <ShipmentForm
        next={back}
        from={typeof from === "string" ? from : undefined}
        to={typeof to === "string" ? to : undefined}
      />
    </ListingFormView>
  );
}
