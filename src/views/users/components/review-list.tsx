import type { Review } from "@/types";
import { LocalTime, Panel, PanelRow, SectionHeader, Stars } from "@/components/ui";

/** Хэрэглэгчийн авсан үнэлгээнүүд. */
export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <section>
      <SectionHeader title={`Үнэлгээнүүд (${reviews.length})`} />
      <Panel>
        {reviews.map((review) => (
          <PanelRow key={review.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">
                {review.reviewer_name} <Stars rating={review.rating} />
              </p>
              <span className="text-xs text-ink-soft/70">
                <LocalTime iso={review.created_at} dateOnly />
              </span>
            </div>
            {review.comment ? (
              <p className="mt-1 break-words text-sm text-ink-soft">{review.comment}</p>
            ) : null}
          </PanelRow>
        ))}
      </Panel>
    </section>
  );
}
