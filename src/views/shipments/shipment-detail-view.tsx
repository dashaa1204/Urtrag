import Link from "next/link";
import type { SessionUser, Shipment, UserRating } from "@/types";
import { closeListing } from "@/lib/actions";
import { DIRECTIONS } from "@/constant/directions";
import { directionCities, formatDate, formatKg, formatPrice } from "@/lib/format";
import { btnSecondary, LocalTime, MessageForm, RatingSummary, StatusBadge } from "@/components/ui";

export default function ShipmentDetailView({
  shipment,
  viewer,
  ownerRating,
}: {
  shipment: Shipment;
  viewer: SessionUser | null;
  ownerRating: UserRating;
}) {
  const isOwner = viewer?.id === shipment.user_id;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-slate-500">
            {DIRECTIONS[shipment.direction].short} · Ачааны хүсэлт
          </span>
          <StatusBadge status={shipment.status} />
        </div>

        <h1 className="mt-2 break-words text-xl font-bold text-slate-900 sm:text-2xl">
          {directionCities(shipment.direction, shipment.from_city, shipment.to_city)}
        </h1>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
            <dt className="text-xs text-slate-500">Жин</dt>
            <dd className="mt-1 font-semibold text-slate-900">{formatKg(shipment.weight_kg)}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
            <dt className="text-xs text-slate-500">Хугацаа</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {shipment.ready_date || shipment.deadline_date
                ? `${formatDate(shipment.ready_date) || "..."} — ${formatDate(shipment.deadline_date) || "..."}`
                : "Тохиролцоно"}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
            <dt className="text-xs text-slate-500">Санал болгох үнэ</dt>
            <dd className="mt-1 font-semibold text-indigo-600">
              {shipment.offer_price ? `${formatPrice(shipment.offer_price)}/кг` : "Тохиролцоно"}
            </dd>
          </div>
        </dl>

        <p className="mt-6 whitespace-pre-wrap break-words text-sm text-slate-600">{shipment.description}</p>

        <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          Зарын эзэн:{" "}
          <Link href={`/users/${shipment.user_id}`} className="font-medium text-indigo-600 hover:underline">
            {shipment.user_name}
          </Link>
          <RatingSummary rating={ownerRating} />
          <span>· Нийтэлсэн: <LocalTime iso={shipment.created_at} dateOnly /></span>
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {isOwner ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Энэ бол таны хүсэлт. Ачаагаа илгээчихсэн бол зараа хаагаарай.</p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/shipments/${shipment.id}/edit`} className={btnSecondary}>
                Засах
              </Link>
              {shipment.status === "active" ? (
                <form action={closeListing}>
                  <input type="hidden" name="type" value="shipment" />
                  <input type="hidden" name="id" value={shipment.id} />
                  <button type="submit" className={btnSecondary}>
                    Зар хаах
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ) : shipment.status === "closed" ? (
          <p className="text-sm text-slate-500">Энэ зар хаагдсан байна.</p>
        ) : viewer ? (
          <>
            <h2 className="mb-3 font-semibold text-slate-900">{shipment.user_name}-тай холбогдох</h2>
            <MessageForm
              listingType="shipment"
              listingId={shipment.id}
              placeholder="Сайн байна уу? Би энэ чиглэлд аялах гэж байгаа юм..."
            />
          </>
        ) : (
          <p className="text-sm text-slate-600">
            Илгээгчтэй холбогдохын тулд{" "}
            <Link
              href={`/login?next=/shipments/${shipment.id}`}
              className="font-semibold text-indigo-600 hover:underline"
            >
              нэвтэрч орно уу
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
