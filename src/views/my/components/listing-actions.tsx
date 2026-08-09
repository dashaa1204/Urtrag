import Link from "next/link";
import { closeListing, deleteListing, reopenListing } from "@/lib/actions";
import type { ListingSummary } from "@/lib/listing";
import { btnDanger, btnSecondary, btnSm } from "@/components/ui";
import { ListingActionForm } from "@/views/listings";

/** "Миний зар" мөрийн үйлдлүүд. */
export function ListingActions({ listing }: { listing: ListingSummary }) {
  const neutralCls = `${btnSecondary} ${btnSm}`;
  const shared = { type: listing.type, id: listing.id };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link href={listing.editHref} className={neutralCls}>
        Засах
      </Link>

      {listing.status === "active" ? (
        <ListingActionForm action={closeListing} {...shared} className={neutralCls}>
          Хаах
        </ListingActionForm>
      ) : listing.expired ? null : (
        <ListingActionForm action={reopenListing} {...shared} className={neutralCls}>
          Дахин нээх
        </ListingActionForm>
      )}

      <ListingActionForm
        action={deleteListing}
        {...shared}
        className={`${btnDanger} ${btnSm}`}
        confirmMessage="Энэ зарыг бүр мөсөн устгах уу?"
      >
        Устгах
      </ListingActionForm>
    </div>
  );
}
