import type { Review, UserProfile, UserRating } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { formatDate } from "@/lib/format";
import { LISTING_COPY } from "@/constant/listings";
import {
  Avatar,
  Card,
  ListingGrid,
  PageContainer,
  RatingSummary,
  SectionHeader,
} from "@/components/ui";
import { ReviewList } from "./components";

interface UserProfileViewProps {
  profile: UserProfile;
  rating: UserRating;
  reviews: Review[];
  trips: ListingSummary[];
  shipments: ListingSummary[];
}

export default function UserProfileView({ profile, rating, reviews, trips, shipments }: UserProfileViewProps) {
  return (
    <PageContainer width="list">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={profile.name} size="lg" />
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold text-ink">{profile.name}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
              <RatingSummary rating={rating} />
              <span>· Гишүүн болсон: {formatDate(profile.created_at)}</span>
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-6 space-y-6">
        {reviews.length > 0 ? <ReviewList reviews={reviews} /> : null}

        {trips.length > 0 ? (
          <section>
            <SectionHeader title={LISTING_COPY.trip.profileTitle} />
            <ListingGrid listings={trips} columns={2} />
          </section>
        ) : null}

        {shipments.length > 0 ? (
          <section>
            <SectionHeader title={LISTING_COPY.shipment.profileTitle} />
            <ListingGrid listings={shipments} columns={2} />
          </section>
        ) : null}
      </div>
    </PageContainer>
  );
}
