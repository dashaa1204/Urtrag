import Link from "next/link";
import { closeListing } from "@/lib/actions";
import type { ListingSummary } from "@/lib/listing";
import { btnSecondary } from "@/components/ui";
import { ListingActionForm } from "./listing-action-form";

/** Зарын эзэнд дэлгэрэнгүй хуудсан дээр харагдах удирдлага. */
export function OwnerActions({ listing }: { listing: ListingSummary }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-600">{listing.ownerHint}</p>
      <div className="flex flex-wrap gap-2">
        <Link href={listing.editHref} className={btnSecondary}>
          Засах
        </Link>
        {listing.status === "active" ? (
          <ListingActionForm action={closeListing} type={listing.type} id={listing.id} className={btnSecondary}>
            Зар хаах
          </ListingActionForm>
        ) : null}
      </div>
    </div>
  );
}
