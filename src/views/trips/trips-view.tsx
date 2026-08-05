import Link from "next/link";
import type { Direction, Trip } from "@/types";
import { btnPrimary, DirectionFilter, TripCard } from "@/components/ui";

export default function TripsView({ trips, direction }: { trips: Trip[]; direction?: Direction }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Аялалууд</h1>
          <p className="mt-1 text-sm text-slate-500">Ачаа авч явах боломжтой аялагчид</p>
        </div>
        <Link href="/trips/new" className={btnPrimary}>
          + Аялал зарлах
        </Link>
      </div>

      <div className="mb-6">
        <DirectionFilter current={direction} basePath="/trips" />
      </div>

      {trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">Одоогоор идэвхтэй аялал алга байна.</p>
          <p className="mt-1 text-sm text-slate-400">Та аялахаар төлөвлөж байгаа бол эхний зараа оруулаарай!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
