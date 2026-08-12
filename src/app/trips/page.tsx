import type { Metadata } from "next";
import { listTrips } from "@/lib/data";
import { tripSummary } from "@/lib/listing";
import { isCountryCode } from "@/constant/cities";
import { ListingsView } from "@/views/listings";

export const metadata: Metadata = {
  title: "Аялалууд — ачаа авч явах боломжтой аялагчид",
  description:
    "Ачаа авч явахад бэлэн аялагчдын зар. Хот, улсаараа шүүж, тохирох хүнтэйгээ мессежээр шууд холбогдоорой.",
  // Шүүлтүүр (?from=&to=) давхардсан хуудас үүсгэдэг тул үндсэн зам руу нэгтгэнэ
  alternates: { canonical: "/trips" },
};

export default async function TripsPage({ searchParams }: PageProps<"/trips">) {
  const { from, to } = await searchParams;
  const fromCountry = isCountryCode(from) ? from : undefined;
  const toCountry = isCountryCode(to) ? to : undefined;
  const trips = await listTrips({ fromCountry, toCountry });

  return (
    <ListingsView
      type="trip"
      listings={trips.map(tripSummary)}
      fromCountry={fromCountry}
      toCountry={toCountry}
    />
  );
}
