import type { ListingSummary } from "@/lib/listing";
import { Hero, HowItWorks, LatestListings } from "./components";

export default function HomeView({
  trips,
  shipments,
}: {
  trips: ListingSummary[];
  shipments: ListingSummary[];
}) {
  return (
    <>
      <Hero />
      <HowItWorks />

      <section className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
        <LatestListings type="trip" listings={trips} />
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-12 md:pb-16">
        <LatestListings type="shipment" listings={shipments} />
      </section>
    </>
  );
}
