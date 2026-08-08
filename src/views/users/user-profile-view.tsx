import type { Review, Shipment, Trip, UserProfile, UserRating } from "@/types";
import { formatDate } from "@/lib/format";
import { Avatar, LocalTime, RatingSummary, ShipmentCard, Stars, TripCard } from "@/components/ui";

interface UserProfileViewProps {
  profile: UserProfile;
  rating: UserRating;
  reviews: Review[];
  trips: Trip[];
  shipments: Shipment[];
}

export default function UserProfileView({ profile, rating, reviews, trips, shipments }: UserProfileViewProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={profile.name} size="lg" />
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold text-slate-900">{profile.name}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <RatingSummary rating={rating} />
              <span>· Гишүүн болсон: {formatDate(profile.created_at)}</span>
            </p>
          </div>
        </div>
      </div>

      {reviews.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 font-semibold text-slate-900">Үнэлгээнүүд ({reviews.length})</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-slate-100 px-4 py-3 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">
                    {review.reviewer_name} <Stars rating={review.rating} />
                  </p>
                  <span className="text-xs text-slate-400">
                    <LocalTime iso={review.created_at} dateOnly />
                  </span>
                </div>
                {review.comment ? (
                  <p className="mt-1 break-words text-sm text-slate-600">{review.comment}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {trips.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 font-semibold text-slate-900">Идэвхтэй аялалууд</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      ) : null}

      {shipments.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 font-semibold text-slate-900">Идэвхтэй ачаанууд</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {shipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
