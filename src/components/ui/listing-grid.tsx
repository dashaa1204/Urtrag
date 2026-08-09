import type { ListingSummary } from "@/lib/listing";
import { ListingCard } from "./listing-card";

/** Зарын картуудын нийтлэг тор. Хажуу талдаа зайтай хуудсанд `columns={2}`. */
export function ListingGrid({ listings, columns = 3 }: { listings: ListingSummary[]; columns?: 2 | 3 }) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
      {listings.map((listing) => (
        <ListingCard key={`${listing.type}-${listing.id}`} listing={listing} />
      ))}
    </div>
  );
}
