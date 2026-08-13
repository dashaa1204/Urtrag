import type { ListingType } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { MATCH_COPY } from "@/constant/listings";

/**
 * Хүсэлт илгээхдээ өөрийн аль зараа хавсаргахаа сонгоно. Радио товч тул
 * JS-гүйгээр ажиллаж, мессежийн формтой хамт илгээгдэнэ.
 *
 * type нь ХОС зарын төрөл — жагсаалт нь эзний зарын эсрэг төрөлтэй байна.
 */
export function ListingMatchPicker({
  listings,
  type,
}: {
  listings: ListingSummary[];
  type: ListingType;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{MATCH_COPY[type].pickLabel}</legend>

      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {listings.map((listing, index) => (
          <label
            key={listing.id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-ink/12 bg-card p-3 transition has-[:checked]:border-ink/60 has-[:checked]:bg-ink/5"
          >
            <input
              type="radio"
              name="match_listing_id"
              value={listing.id}
              defaultChecked={index === 0}
              className="mt-0.5 size-4 shrink-0 accent-ink"
              required
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="min-w-0 break-words text-sm font-semibold text-ink">{listing.title}</span>
                <span className="shrink-0 text-xs">{listing.flags}</span>
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                {listing.meta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
                {listing.price ? <span className="font-bold text-stamp">{listing.price}</span> : null}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
