// Нийтэд харагдах хаягийг угсрах, гаднаас (URL, форм) ирсэн параметрийг цэвэрлэх
// туслахууд.
//
// Угсралт ба задралыг ЗААВАЛ нэг дор байлгана: хаягийн хэлбэр өөрчлөгдөхөд
// хоёулаа хамт өөрчлөгдөх ёстой, эс бөгөөс өчигдөр тараасан холбоос маргааш
// 404 болно.

import type { ListingType } from "@/types";
import { routeEnds, type Route } from "@/lib/format";
import { publicCode, readPublicCode } from "@/lib/public-id";

/**
 * Зарын хаяг угсрахад хэрэгтэй хэсэг. Trip, Shipment хоёулаа үүнийг хангадаг
 * тул хуучин дуудагчид хэвээрээ. Бүтэн зар татах шаардлагагүй газраас
 * (жишээ нь хянагчийн жагсаалтын хэсэгчилсэн мөр) шууд дамжуулж болно.
 */
export interface ListingRef extends Route {
  id: number;
  /** Аялалын хаягт огноо ордог. */
  travel_date?: string;
  /** Ачааны хаягт жин ордог. */
  weight_kg?: number;
}

/**
 * "Хаашаа буцах" замыг цэвэрлэнэ. Зөвхөн дотоод зам зөвшөөрөгдөнө.
 *
 * "//" ба "/\" хоёулаа өөр домэйн руу заана — браузарууд урвуу ташуу зураасыг
 * ташуу зураас болгон хөрвүүлдэг тул "/\evil.com" нь "//evil.com" болж,
 * нээлттэй redirect үүснэ.
 */
export function internalPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  if (value[1] === "/" || value[1] === "\\") return null;
  return value;
}

/**
 * Формын нуугдмал талбарын id-г эерэг бүхэл тоо болгож задлана.
 *
 * URL-д ХЭРЭГЛЭХГҮЙ — тэнд нийтийн код явна (listingSlug). Энэ нь зөвхөн
 * өөрсдийн формоос буцаж ирсэн утганд зориулагдсан.
 *
 * Number()-д шууд найдаж болохгүй: Number("") нь 0 буцаадаг тул талбар огт
 * байхгүй үед Number.isInteger() шалгалтыг давдаг. Мөн "1e3" → 1000,
 * "0x10" → 16 болж хувирдаг тул нэг зар олон хаягаар нээгдэнэ. Зөвхөн цэвэр
 * цифрийг зөвшөөрнө.
 */
export function numericId(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * Замд хайлтын параметрийг нь буцааж наана. Хуучирсан хаягаас шинэ рүү
 * шилжүүлэхэд "?new=1" зэрэг тэмдэглэгээ замдаа алдагдах ёсгүй.
 */
export function withQuery(
  path: string,
  query: Record<string, string | string[] | undefined>
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) for (const item of value) params.append(key, item);
    else if (value !== undefined) params.set(key, value);
  }
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

/** Латин биш тэмдэгт, хоосон зайг хаягт тохирох хэлбэрт оруулна. */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    // Диакритик тэмдэг (ä, é, ř) — үсгээ үлдээгээд тэмдгийг нь хаяна.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 3 → "3kg", 3.5 → "3-5kg" (хаягт цэг байх нь өргөтгөл мэт харагддаг). */
function kgSlug(kg: number): string {
  return `${String(Number.isInteger(kg) ? kg : kg.toFixed(1)).replace(".", "-")}kg`;
}

/**
 * Зарын хаягийн сүүлчийн хэсэг: "vienna-ulaanbaatar-20260820-3FQEVZ".
 *
 * Урд талын үгс нь ЧИМЭГЛЭЛ — хайлтын систем, хүн хоёрт зар юуны тухай
 * болохыг хэлнэ. Зарыг олох ажлыг зөвхөн сүүлчийн код гүйцэтгэдэг тул зар
 * засагдаж, чиглэл нь өөрчлөгдсөн ч хуучин холбоос ажилласан хэвээр байна
 * (дэлгэрэнгүй хуудас нь шинэ хаяг руу нь 308-аар шилжүүлнэ).
 */
export function listingSlug(type: ListingType, listing: ListingRef): string | null {
  const code = publicCode(type, listing.id);
  if (!code) return null;

  const { from, to } = routeEnds(listing);
  // type ба зарын хэлбэр үргэлж хамт явна — дуудагч тал хоёуланг нь мэднэ.
  // Тохирох талбар нь дутуу ирвэл чимэглэлийн тэр хэсэг л дутна: зарыг олох
  // ажлыг зөвхөн сүүлийн код гүйцэтгэдэг тул холбоос ажилласан хэвээр байна.
  const detail =
    type === "trip"
      ? (listing.travel_date ?? "").slice(0, 10).replaceAll("-", "")
      : listing.weight_kg === undefined
        ? ""
        : kgSlug(listing.weight_kg);

  const words = [slugify(from), slugify(to), detail].filter(Boolean).join("-");
  return words ? `${words}-${code}` : code;
}

/** Зарын бүрэн зам. Хот нь латин үсгээр бичигдээгүй бол зөвхөн код үлдэнэ. */
export function listingPath(type: ListingType, listing: ListingRef): string {
  const slug = listingSlug(type, listing);
  // Код зөвхөн дугаар нь хязгаараас хэтэрсэн үед үүсэхгүй. Тэр үед хагас
  // дутуу хаяг өгөхөөс зогсох нь дээр — эс бөгөөс жагсаалт дүүрэн эвдэрсэн
  // холбоос чимээгүй тарна.
  if (!slug) throw new Error(`Зарын дугаар нийтийн код болохгүй байна: ${type}#${listing.id}`);
  return `${type === "trip" ? "/trips" : "/shipments"}/${slug}`;
}

/**
 * Хаягийн хэсгээс зарын дотоод id-г уншина.
 *
 * Зөвхөн хамгийн сүүлийн зураасны АРД байгаа код чухал — чимэглэл хэсэг нь
 * буруу, хуучирсан, огт байхгүй ч (жишээ нь "/trips/3FQEVZ") зар олдоно.
 */
export function listingIdFromSlug(type: ListingType, slug: unknown): number | null {
  if (typeof slug !== "string") return null;
  return readPublicCode(type, slug.slice(slug.lastIndexOf("-") + 1));
}

/**
 * Ярианы зам. Яриа нь нийтэд нээлттэй биш тул чимэглэл хэсэггүй — оролцогч
 * хоёрын нэр, зарын чиглэлийг хаягт бичих нь илүүц задруулалт.
 */
export function conversationPath(id: number): string {
  const code = publicCode("conversation", id);
  if (!code) throw new Error(`Ярианы дугаар нийтийн код болохгүй байна: ${id}`);
  return `/messages/${code}`;
}

export function conversationIdFromCode(code: unknown): number | null {
  if (typeof code !== "string") return null;
  return readPublicCode("conversation", code);
}
