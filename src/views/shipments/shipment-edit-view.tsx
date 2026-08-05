import type { Shipment } from "@/types";
import { ShipmentForm } from "./components";

export default function ShipmentEditView({ shipment }: { shipment: Shipment }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Ачааны хүсэлт засах</h1>
        <p className="mb-6 text-sm text-slate-500">Мэдээллээ шинэчлээд хадгална уу.</p>
        <ShipmentForm shipment={shipment} />
      </div>
    </div>
  );
}
