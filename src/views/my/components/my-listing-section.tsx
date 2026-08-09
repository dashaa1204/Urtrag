import Link from "next/link";
import type { ListingType } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { LISTING_COPY } from "@/constant/listings";
import { btnPrimary, btnSm, EmptyState, Panel, SectionHeader } from "@/components/ui";
import { MyListingRow } from "./my-listing-row";

/** Аялал эсвэл ачааны нэг хэсэг — хоёулаа ижил бүтэцтэй. */
export function MyListingSection({ type, listings }: { type: ListingType; listings: ListingSummary[] }) {
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
        <EmptyState title={copy.myEmpty} />
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
