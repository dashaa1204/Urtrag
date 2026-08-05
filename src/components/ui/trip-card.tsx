import Link from "next/link";
import type { Trip } from "@/types";
import { DIRECTIONS } from "@/constant/directions";
import { directionCities, formatDate, formatKg, formatPrice } from "@/lib/format";

export function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 break-words text-sm font-semibold text-slate-900">
          {directionCities(trip.direction, trip.from_city, trip.to_city)}
        </span>
        <span className="shrink-0 text-xs">{DIRECTIONS[trip.direction].short}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
        <span>🗓 {formatDate(trip.travel_date)}</span>
        <span>{formatKg(trip.available_kg)} сул</span>
        <span className="font-semibold text-indigo-600">{formatPrice(trip.price_per_kg)}/кг</span>
      </div>
      {trip.notes ? (
        <p className="mt-2 line-clamp-2 break-words text-sm text-slate-500">{trip.notes}</p>
      ) : null}
      <p className="mt-2 text-xs text-slate-400">{trip.user_name}</p>
    </Link>
  );
}
