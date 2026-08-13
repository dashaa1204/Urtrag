import Link from "next/link";
import type { ListingType } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { dashboardHref, type ListingFilter } from "@/constant/dashboard";
import { LISTING_COPY } from "@/constant/listings";
import { btnPrimary, btnSm, EmptyState, Panel, SectionHeader } from "@/components/ui";
import { MyListingRow } from "./my-listing-row";

const linkCls = "text-sm font-semibold text-stamp hover:underline";

/** Идэвхтэй табын жагсаалт. Аялал, ачаа хоёр ижил бүтэцтэй. */
export function ListingPanel({
  type,
  listings,
  filter,
}: {
  type: ListingType;
  listings: ListingSummary[];
  filter: ListingFilter;
}) {
  const copy = LISTING_COPY[type];

  return (
    <section>
      <SectionHeader
        title={copy.myTitle}
        action={
          <Link href={copy.createHref} className={`${btnPrimary} ${btnSm}`}>
            {copy.createLabel}
          </Link>
        }
      />

      {listings.length === 0 ? (
        filter === "all" ? (
          <EmptyState
            title={copy.myEmpty}
            action={
              <Link href={copy.createHref} className={linkCls}>
                {copy.myEmptyAction}
              </Link>
            }
          />
        ) : (
          <EmptyState
            title="Энэ төлөвт тохирох зар алга."
            action={
              <Link href={dashboardHref(type === "trip" ? "trips" : "shipments")} className={linkCls}>
                Бүх зараа харах
              </Link>
            }
          />
        )
      ) : (
        <Panel>
          {listings.map((listing) => (
            <MyListingRow key={listing.id} listing={listing} />
          ))}
        </Panel>
      )}
    </section>
  );
}
