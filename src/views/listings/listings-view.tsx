import Link from "next/link";
import type { Direction, ListingType } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { LISTING_COPY } from "@/constant/listings";
import {
  btnPrimary,
  DirectionFilter,
  EmptyState,
  ListingGrid,
  PageContainer,
  PageHeader,
} from "@/components/ui";

/** /trips ба /shipments хоёрын хуваалцсан жагсаалтын хуудас. */
export default function ListingsView({
  type,
  listings,
  direction,
}: {
  type: ListingType;
  listings: ListingSummary[];
  direction?: Direction;
}) {
  const copy = LISTING_COPY[type];

  return (
    <PageContainer>
      <PageHeader
        title={copy.listTitle}
        description={copy.listDescription}
        action={
          <Link href={copy.createHref} className={`${btnPrimary} w-full sm:w-auto`}>
            {copy.createLabel}
          </Link>
        }
      />

      <div className="mb-6">
        <DirectionFilter current={direction} basePath={copy.basePath} />
      </div>

      {listings.length === 0 ? (
        <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
      ) : (
        <ListingGrid listings={listings} />
      )}
    </PageContainer>
  );
}
