import { ShipmentForm } from "./components";

export default function ShipmentNewView() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Ачаа илгээх хүсэлт</h1>
        <p className="mb-6 text-sm text-slate-500">
          Ачааныхаа мэдээллийг оруулбал тухайн чиглэлд аялах хүмүүс тантай мессежээр холбогдоно.
        </p>
        <ShipmentForm />
      </div>
    </div>
  );
}
