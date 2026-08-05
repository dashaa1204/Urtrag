import Link from "next/link";
import type { Shipment, Trip } from "@/types";
import { directionCities, formatDate, formatKg, formatPrice } from "@/lib/format";
import { btnPrimary, StatusBadge } from "@/components/ui";
import { ListingActions } from "./components";

function ExpiredBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
      Огноо өнгөрсөн
    </span>
  );
}

export default function MyListingsView({ trips, shipments }: { trips: Trip[]; shipments: Shipment[] }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Миний зарууд</h1>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Аялалууд</h2>
          <Link href="/trips/new" className={btnPrimary}>
            + Аялал зарлах
          </Link>
        </div>
        {trips.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Та одоогоор аялал зарлаагүй байна.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {trips.map((trip) => {
              const expired = trip.travel_date < today;
              return (
                <div
                  key={trip.id}
                  className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-3"
                >
                  <Link href={`/trips/${trip.id}`} className="min-w-0 sm:flex-1 hover:underline">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {directionCities(trip.direction, trip.from_city, trip.to_city)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(trip.travel_date)} · {formatKg(trip.available_kg)} · {formatPrice(trip.price_per_kg)}/кг
                    </p>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    {expired && trip.status === "active" ? <ExpiredBadge /> : <StatusBadge status={trip.status} />}
                    <ListingActions type="trip" id={trip.id} status={trip.status} canReopen={!expired} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Ачаанууд</h2>
          <Link href="/shipments/new" className={btnPrimary}>
            + Ачаа илгээх хүсэлт
          </Link>
        </div>
        {shipments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Та одоогоор ачааны хүсэлт оруулаагүй байна.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {shipments.map((shipment) => (
              <div
                key={shipment.id}
                className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-3"
              >
                <Link href={`/shipments/${shipment.id}`} className="min-w-0 sm:flex-1 hover:underline">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {directionCities(shipment.direction, shipment.from_city, shipment.to_city)}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {formatKg(shipment.weight_kg)} · {shipment.description}
                  </p>
                </Link>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <StatusBadge status={shipment.status} />
                  <ListingActions type="shipment" id={shipment.id} status={shipment.status} canReopen />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
