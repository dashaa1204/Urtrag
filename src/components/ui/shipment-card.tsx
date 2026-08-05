import Link from "next/link";
import type { Shipment } from "@/types";
import { DIRECTIONS } from "@/constant/directions";
import { directionCities, formatDate, formatKg, formatPrice } from "@/lib/format";

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <Link
      href={`/shipments/${shipment.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 break-words text-sm font-semibold text-slate-900">
          {directionCities(shipment.direction, shipment.from_city, shipment.to_city)}
        </span>
        <span className="shrink-0 text-xs">{DIRECTIONS[shipment.direction].short}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
        <span>{formatKg(shipment.weight_kg)}</span>
        {shipment.deadline_date ? <span>🗓 {formatDate(shipment.deadline_date)} дотор</span> : null}
        {shipment.offer_price ? (
          <span className="font-semibold text-indigo-600">{formatPrice(shipment.offer_price)}/кг санал</span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 break-words text-sm text-slate-500">{shipment.description}</p>
      <p className="mt-2 text-xs text-slate-400">{shipment.user_name}</p>
    </Link>
  );
}
