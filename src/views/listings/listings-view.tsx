import Link from "next/link";
import type { ListingType } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { LISTING_COPY } from "@/constant/listings";
import {
  btnPrimary,
  EmptyState,
  ListingGrid,
  PageContainer,
  PageHeader,
  RouteFilter,
} from "@/components/ui";

/** /trips ба /shipments хоёрын хуваалцсан жагсаалтын хуудас. */
export default function ListingsView({
  type,
  listings,
  fromCountry,
  toCountry,
}: {
  type: ListingType;
  listings: ListingSummary[];
  fromCountry?: string;
  toCountry?: string;
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
        <RouteFilter basePath={copy.basePath} fromCountry={fromCountry} toCountry={toCountry} />
      </div>

      {listings.length === 0 ? (
        <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
      ) : (
        <ListingGrid listings={listings} />
      )}
    </PageContainer>
  );
}
