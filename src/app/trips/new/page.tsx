import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { internalPath } from "@/lib/nav";
import { ListingFormView } from "@/views/listings";
import { TripForm } from "@/views/trips/components";

export const metadata: Metadata = { title: "Аялал зарлах", robots: { index: false, follow: false }, };

export default async function TripNewPage({ searchParams }: PageProps<"/trips/new">) {
  const { next, from, to } = await searchParams;
  // Ачааны зар дээрээс "аялал зарлах" гэж ирвэл чиглэл нь урьдчилж бөглөгдөж,
  // хадгалсны дараа тэр зар руугаа буцна.
  const back = internalPath(next) ?? undefined;
  await requireUser(back ? `/trips/new?next=${encodeURIComponent(back)}` : "/trips/new");

  return (
    <ListingFormView type="trip" mode="new">
      <TripForm
        next={back}
        from={typeof from === "string" ? from : undefined}
        to={typeof to === "string" ? to : undefined}
      />
    </ListingFormView>
  );
}
