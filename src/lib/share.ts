// Зарыг сошиалд тараахад хэрэгтэй холбоос, бичвэрийн бэлтгэл.
//
// Сүлжээ бүр өөр параметр авдаг ч (Facebook зөвхөн холбоос, Telegram холбоос
// + текст) дуудаж буй тал үүнийг мэдэх шаардлагагүй: url ба текстээ өгөөд
// href()-ийг нь дуудна.

import { SITE } from "@/constant/site";
import type { ListingSummary } from "@/lib/listing";

export interface ShareNetwork {
  /** Товч дээрх лого сонгоход ашиглагдана (ui/social-icons.tsx). */
  id: "facebook" | "telegram" | "whatsapp" | "x";
  label: string;
  href: (url: string, text: string) => string;
}

/**
 * Дарааллыг Монголд хэр их хэрэглэгддэгээр нь эрэмбэлэв. Messenger, Instagram,
 * Viber зэрэг апп руу шууд холбоос байхгүй — тэдгээрийг утасны "Хуваалцах"
 * (navigator.share) цэс дамжуулна.
 */
export const SHARE_NETWORKS: ShareNetwork[] = [
  {
    id: "facebook",
    label: "Facebook",
    // Facebook нь урьдчилан бичсэн текстийг зөвшөөрдөггүй — зөвхөн холбоос.
    // Тайлбарыг og:title / og:description-оос нь өөрөө уншина.
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    href: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: (url, text) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    id: "x",
    label: "X",
    href: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
];

/** Зарын бүрэн (домэйнтэй) хаяг — хуваалцахад харьцангуй зам ажиллахгүй. */
export function listingShareUrl(listing: ListingSummary): string {
  return `${SITE.url}${listing.href}`;
}

/**
 * Сошиалд наах бичвэр. Зарын мөрүүд (meta, price) нь картан дээр харагддагтай
 * яг ижил тул хүн юу хуваалцаж байгаагаа урьдчилан таамаглаж чадна.
 */
export function listingShareText(listing: ListingSummary): string {
  const facts = [...listing.meta, listing.price].filter(Boolean).join(" · ");
  const lead =
    listing.type === "trip"
      ? `✈️ ${listing.title} чиглэлд аялж байна — ачаа авч явъя.`
      : `📦 ${listing.title} чиглэлд ачаа явуулах аялагч хайж байна.`;

  return `${lead}\n${facts}\n${SITE.name} (${SITE.nameCyrillic})`;
}
