import Link from "next/link";
import type { ListingType } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { LISTING_COPY } from "@/constant/listings";
import { EmptyState, ListingGrid, SectionHeader } from "@/components/ui";

/** Нүүр хуудасны "сүүлийн зарууд" хэсэг — аялал, ачаа хоёуланд нь. */
export function LatestListings({ type, listings }: { type: ListingType; listings: ListingSummary[] }) {
  const copy = LISTING_COPY[type];

  return (
    <>
      <SectionHeader
        size="lg"
        title={copy.homeTitle}
        // py-3 / -my-3 нь товшилтын талбайг 20px-ээс 44px болгож томсгоод,
        // сөрөг margin нь байрлалыг нь хэвээр үлдээнэ. Энэ бол нүүр хуудаснаас
        // жагсаалт руу гарах гол зам — утсан дээр оносон эсэхээ мэдэхгүй
        // товшилт байж болохгүй.
        action={
          <Link
            href={copy.basePath}
            className="-my-3 inline-flex min-h-11 items-center py-3 text-sm font-semibold text-stamp hover:underline"
          >
            Бүгдийг үзэх →
          </Link>
        }
      />
      {listings.length === 0 ? (
        <EmptyState title={copy.homeEmpty} />
      ) : (
        <ListingGrid listings={listings} />
      )}
    </>
  );
}
