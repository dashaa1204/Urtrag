import Link from "next/link";
import type { ListingSummary } from "@/lib/listing";
import { adminCloseListing, adminDeleteListing, adminReopenListing } from "@/lib/admin-actions";
import { btnDanger, btnSecondary, btnSm, PanelRow, StatusBadge } from "@/components/ui";
import { ListingActionForm } from "@/views/listings";
import { AdminUserCell } from "./admin-user-cell";

/**
 * Хянагчийн зарын мөр.
 *
 * back өгвөл үйлдлийн товчнууд гарна — тоймд зөвхөн харах тул өгөхгүй. Буцах
 * зам нь тухайн үеийн шүүлтүүр, хуудсыг агуулна: зар хааж байгаад жагсаалтын
 * эхэнд шидэгдэх нь ажлын урсгалыг тасалдаг.
 */
export function AdminListingRow({ listing, back }: { listing: ListingSummary; back?: string }) {
  const meta = [...listing.meta, listing.price].filter(Boolean).join(" · ");
  const shared = { type: listing.type, id: listing.id, back };
  const neutralCls = `${btnSecondary} ${btnSm}`;

  return (
    <PanelRow className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Link href={listing.href} className="min-w-0 hover:underline sm:flex-1">
        <p className="truncate text-sm font-medium text-ink">
          <span aria-hidden className="mr-1.5">
            {listing.flags}
          </span>
          {listing.title}
        </p>
        <p className="truncate text-xs text-ink-soft">{meta}</p>
      </Link>

      <div className="sm:w-44 sm:shrink-0">
        <AdminUserCell
          id={listing.userId}
          name={listing.userName}
          avatarPath={listing.userAvatar}
          size="xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <StatusBadge
          status={listing.status}
          matched={listing.matched}
          matchedLabel={listing.fullLabel}
          expired={listing.expired}
        />

        {back ? (
          <>
            {listing.status === "active" ? (
              <ListingActionForm action={adminCloseListing} {...shared} className={neutralCls}>
                Хаах
              </ListingActionForm>
            ) : listing.expired ? null : (
              <ListingActionForm action={adminReopenListing} {...shared} className={neutralCls}>
                Нээх
              </ListingActionForm>
            )}

            <ListingActionForm
              action={adminDeleteListing}
              {...shared}
              className={`${btnDanger} ${btnSm}`}
              confirmMessage={`"${listing.title}" зарыг бүр мөсөн устгах уу? Холбогдсон хэлцлүүд цуцлагдана.`}
            >
              Устгах
            </ListingActionForm>
          </>
        ) : null}
      </div>
    </PanelRow>
  );
}
