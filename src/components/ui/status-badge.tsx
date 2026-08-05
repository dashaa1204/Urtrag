import type { ListingStatus } from "@/types";

export function StatusBadge({ status }: { status: ListingStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Идэвхтэй
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
      Хаагдсан
    </span>
  );
}
