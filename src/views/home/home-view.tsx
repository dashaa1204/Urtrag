import Link from "next/link";
import type { Shipment, Trip } from "@/types";
import { ShipmentCard, TripCard } from "@/components/ui";
import { Hero, HowItWorks } from "./components";

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <Link href={href} className="text-sm font-semibold text-indigo-600 hover:underline">
        Бүгдийг үзэх →
      </Link>
    </div>
  );
}

export default function HomeView({ trips, shipments }: { trips: Trip[]; shipments: Shipment[] }) {
  return (
    <>
      <Hero />
      <HowItWorks />

      <section className="mx-auto w-full max-w-5xl px-4 pb-12">
        <SectionHeader title="Сүүлийн аялалууд" href="/trips" />
        {trips.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Одоогоор идэвхтэй аялал алга. Эхнийх нь та байгаарай! ✈️
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-16">
        <SectionHeader title="Сүүлийн ачаанууд" href="/shipments" />
        {shipments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Одоогоор ачааны хүсэлт алга. Эхнийх нь та байгаарай! 📦
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {shipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
