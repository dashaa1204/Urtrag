import Link from "next/link";
import type { Direction, Shipment } from "@/types";
import { btnPrimary, DirectionFilter, ShipmentCard } from "@/components/ui";

export default function ShipmentsView({ shipments, direction }: { shipments: Shipment[]; direction?: Direction }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ачаанууд</h1>
          <p className="mt-1 text-sm text-slate-500">Илгээхээр хүлээгдэж буй ачааны хүсэлтүүд</p>
        </div>
        <Link href="/shipments/new" className={btnPrimary}>
          + Ачаа илгээх хүсэлт
        </Link>
      </div>

      <div className="mb-6">
        <DirectionFilter current={direction} basePath="/shipments" />
      </div>

      {shipments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">Одоогоор идэвхтэй ачааны хүсэлт алга байна.</p>
          <p className="mt-1 text-sm text-slate-400">Та ачаа илгээх гэж байгаа бол эхний хүсэлтээ оруулаарай!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      )}
    </div>
  );
}
