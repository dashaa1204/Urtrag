import Link from "next/link";
import { closeListing, deleteListing, reopenListing } from "@/lib/actions";
import type { ListingSummary } from "@/lib/listing";
import { btnDanger, btnSecondary, btnSm } from "@/components/ui";
import { ListingActionForm } from "@/views/listings";

/** "Миний зар" мөрийн үйлдлүүд. */
export function ListingActions({ listing }: { listing: ListingSummary }) {
  const neutralCls = `${btnSecondary} ${btnSm}`;
  const shared = { type: listing.type, id: listing.id };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link href={listing.editHref} className={neutralCls}>
        Засах
      </Link>

      {listing.status === "active" ? (
        <ListingActionForm action={closeListing} {...shared} className={neutralCls}>
          Хаах
        </ListingActionForm>
      ) : listing.expired ? null : (
        <ListingActionForm action={reopenListing} {...shared} className={neutralCls}>
          Дахин нээх
        </ListingActionForm>
      )}

      {/* Устгах нь буцаагдахгүй, харин хажуугийн "Хаах" нь буцаагддаг. Хоёул
          ижил хэмжээтэй, зөвхөн өнгөөрөө ялгардаг байсан нь дэргэдэх товчийг
          андуурах хамгийн түгээмэл алдааг урьж байсан — тусгаарлах зурвас ба
          нэмэлт зай нь тэр хоёрыг өөр бүлэг болгож байна. */}
      <span aria-hidden className="ml-1 h-5 w-px shrink-0 bg-ink/15" />

      <ListingActionForm
        action={deleteListing}
        {...shared}
        className={`${btnDanger} ${btnSm}`}
        // Тодорхой зүйлийг нэрлэнэ. "Энэ зарыг" гэдэг нь ижил төстэй дөрвөн
        // мөрийн аль нэгэн дээр дарсны дараа гарч ирэх системийн цонхонд юу ч
        // хэлэхгүй — хэрэглэгч аль зараа устгаж байгаагаа шалгах аргагүй.
        confirmMessage={`«${listing.title}» зарыг бүр мөсөн устгах уу? Үүнийг буцаах боломжгүй.`}
      >
        Устгах
      </ListingActionForm>
    </div>
  );
}
