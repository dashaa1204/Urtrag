import type { Review, SessionUser, UserRating } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import {
  DASHBOARD_TABS,
  dashboardHref,
  LISTING_FILTERS,
  matchesFilter,
  type DashboardTab,
  type ListingFilter,
} from "@/constant/dashboard";
import { EmptyState, PageContainer, ReviewList, SegmentedNav } from "@/components/ui";
import { BoardingPass, ListingPanel } from "./components";

interface DashboardViewProps {
  user: SessionUser;
  rating: UserRating;
  reviews: Review[];
  trips: ListingSummary[];
  shipments: ListingSummary[];
  tab: DashboardTab;
  filter: ListingFilter;
  identityVerified: boolean;
}

export default function DashboardView({
  user,
  rating,
  reviews,
  trips,
  shipments,
  tab,
  filter,
  identityVerified,
}: DashboardViewProps) {
  const counts = { trips: trips.length, shipments: shipments.length, reviews: reviews.length };
  const listings = tab === "shipments" ? shipments : trips;

  const tabItems = DASHBOARD_TABS.map((item) => ({
    ...item,
    href: dashboardHref(item.key),
    count: counts[item.key === "reviews" ? "reviews" : item.key],
  }));

  // Ачаанд огноо өнгөрөх ойлголт байхгүй тул тэр шүүлтүүрийг харуулахгүй.
  //
  // Табууд тоогоо харуулж байхад шүүлтүүрүүд харуулдаггүй байсан — гэтэл
  // "хэдэн зарын минь хугацаа өнгөрчихсөн бэ" гэдэг нь энэ хуудсан дээрх
  // хамгийн үйлдэл шаардсан тоо, тэрийг мэдэхийн тулд дарж үзэхээс өөр арга
  // байсангүй.
  const filterItems = LISTING_FILTERS.filter(
    (item) => item.key !== "expired" || tab === "trips"
  ).map((item) => ({
    ...item,
    href: dashboardHref(tab, item.key),
    count: listings.filter((listing) => matchesFilter(listing, item.key)).length,
  }));

  return (
    <PageContainer width="list">
      <BoardingPass user={user} rating={rating} identityVerified={identityVerified} />

      <div className="mt-6 space-y-2">
        <SegmentedNav items={tabItems} active={tab} ariaLabel="Хэсэг" />
        {tab === "reviews" ? null : (
          <SegmentedNav items={filterItems} active={filter} ariaLabel="Зарын төлөв" wrap />
        )}
      </div>

      <div className="mt-6">
        {tab === "reviews" ? (
          reviews.length > 0 ? (
            <ReviewList reviews={reviews} title={`Миний авсан үнэлгээ (${reviews.length})`} />
          ) : (
            <EmptyState
              title="Танд одоогоор үнэлгээ алга."
              description="Хэн нэгэнтэй мессежээр тохиролцож, ачаагаа хүргэсний дараа үнэлгээ өгөлцөнө."
            />
          )
        ) : (
          <ListingPanel
            type={tab === "shipments" ? "shipment" : "trip"}
            listings={listings.filter((listing) => matchesFilter(listing, filter))}
            filter={filter}
          />
        )}
      </div>
    </PageContainer>
  );
}
