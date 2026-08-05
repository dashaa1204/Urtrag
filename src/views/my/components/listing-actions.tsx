"use client";

import Link from "next/link";
import { closeListing, deleteListing, reopenListing } from "@/lib/actions";
import type { ListingStatus, ListingType } from "@/types";

const actionBtnCls =
  "inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 sm:min-h-0";

export function ListingActions({
  type,
  id,
  status,
  canReopen,
}: {
  type: ListingType;
  id: number;
  status: ListingStatus;
  canReopen: boolean;
}) {
  const basePath = type === "trip" ? "/trips" : "/shipments";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link href={`${basePath}/${id}/edit`} className={actionBtnCls}>
        Засах
      </Link>

      {status === "active" ? (
        <form action={closeListing}>
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={actionBtnCls}>
            Хаах
          </button>
        </form>
      ) : canReopen ? (
        <form action={reopenListing}>
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={actionBtnCls}>
            Дахин нээх
          </button>
        </form>
      ) : null}

      <form
        action={deleteListing}
        onSubmit={(event) => {
          if (!confirm("Энэ зарыг бүр мөсөн устгах уу?")) event.preventDefault();
        }}
      >
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 sm:min-h-0"
        >
          Устгах
        </button>
      </form>
    </div>
  );
}
