import type { ListingSummary } from "@/lib/listing";
import { listingShareText, listingShareUrl } from "@/lib/share";
import { ShareButtons } from "@/components/ui";

/**
 * Дэлгэрэнгүй хуудасны "хуваалцах" блок.
 *
 * Зар нийтлээд л хүлээх биш, өөрөө тараах нь энэ платформ дээр хамгийн хурдан
 * ажилладаг суваг: аялагчийн танилууд дунд яг тэр чиглэлийн хүн байх магадлал
 * өндөр. Тиймээс зар үүсгэсний дараа энэ блок эхлээд онцолж харагдана.
 */
export function ListingShare({
  listing,
  isOwner,
  justCreated,
}: {
  listing: ListingSummary;
  isOwner: boolean;
  /** Дөнгөж нийтлэгдсэн зар — баяр хүргээд шууд хуваалцахыг урина. */
  justCreated?: boolean;
}) {
  const copy = justCreated
    ? {
        title: "Зар нийтлэгдлээ 🎉",
        hint: "Одоо танилууддаа хуваалцвал хамаагүй хурдан хүн олдоно.",
      }
    : isOwner
      ? {
          title: "Зараа хуваалцах",
          hint: "Facebook, Telegram дээрээ тавихад тухайн чиглэлийн хүмүүст хүрнэ.",
        }
      : {
          title: "Танилдаа илгээх",
          hint: "Энэ зар танай найз, хамаатанд яг хэрэг болж магадгүй.",
        };

  return (
    <>
      <div className="mb-3">
        <h2 className={`font-semibold ${justCreated ? "text-stamp" : "text-ink"}`}>{copy.title}</h2>
        <p className="mt-0.5 text-sm text-ink-soft">{copy.hint}</p>
      </div>
      <ShareButtons
        url={listingShareUrl(listing)}
        text={listingShareText(listing)}
        title={listing.title}
      />
    </>
  );
}
