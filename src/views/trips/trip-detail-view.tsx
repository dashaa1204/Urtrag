import Link from "next/link";
import type { SessionUser, Trip, UserRating } from "@/types";
import { closeListing } from "@/lib/actions";
import { DIRECTIONS } from "@/constant/directions";
import { directionCities, formatDate, formatKg, formatPrice } from "@/lib/format";
import { btnSecondary, LocalTime, MessageForm, RatingSummary, StatusBadge } from "@/components/ui";

export default function TripDetailView({
  trip,
  viewer,
  ownerRating,
}: {
  trip: Trip;
  viewer: SessionUser | null;
  ownerRating: UserRating;
}) {
  const isOwner = viewer?.id === trip.user_id;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-slate-500">
            {DIRECTIONS[trip.direction].short} · Аялалын зар
          </span>
          <StatusBadge status={trip.status} />
        </div>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {directionCities(trip.direction, trip.from_city, trip.to_city)}
        </h1>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs text-slate-500">Аялах огноо</dt>
            <dd className="mt-1 font-semibold text-slate-900">{formatDate(trip.travel_date)}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs text-slate-500">Сул жин</dt>
            <dd className="mt-1 font-semibold text-slate-900">{formatKg(trip.available_kg)}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs text-slate-500">1 кг-ийн үнэ</dt>
            <dd className="mt-1 font-semibold text-indigo-600">{formatPrice(trip.price_per_kg)}</dd>
          </div>
        </dl>

        {trip.notes ? <p className="mt-6 whitespace-pre-wrap text-sm text-slate-600">{trip.notes}</p> : null}

        <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          Зарын эзэн:{" "}
          <Link href={`/users/${trip.user_id}`} className="font-medium text-indigo-600 hover:underline">
            {trip.user_name}
          </Link>
          <RatingSummary rating={ownerRating} />
          <span>· Нийтэлсэн: <LocalTime iso={trip.created_at} dateOnly /></span>
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isOwner ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Энэ бол таны зар. Ачаагаа авчихсан бол зараа хаагаарай.</p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/trips/${trip.id}/edit`} className={btnSecondary}>
                Засах
              </Link>
              {trip.status === "active" ? (
                <form action={closeListing}>
                  <input type="hidden" name="type" value="trip" />
                  <input type="hidden" name="id" value={trip.id} />
                  <button type="submit" className={btnSecondary}>
                    Зар хаах
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ) : trip.status === "closed" ? (
          <p className="text-sm text-slate-500">Энэ зар хаагдсан байна.</p>
        ) : viewer ? (
          <>
            <h2 className="mb-3 font-semibold text-slate-900">{trip.user_name}-тай холбогдох</h2>
            <MessageForm
              listingType="trip"
              listingId={trip.id}
              placeholder="Сайн байна уу? Би ачаа илгээх гэсэн юм..."
            />
          </>
        ) : (
          <p className="text-sm text-slate-600">
            Аялагчтай холбогдохын тулд{" "}
            <Link href={`/login?next=/trips/${trip.id}`} className="font-semibold text-indigo-600 hover:underline">
              нэвтэрч орно уу
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
