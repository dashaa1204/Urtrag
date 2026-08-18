// Trip ба Shipment хоёр нь өөр талбартай ч дэлгэц дээр яг ижил хэлбэрээр харагддаг.
// Тиймээс UI-д хүрэхээсээ өмнө хоёуланг нь энд нэг ListingSummary болгож хөрвүүлнэ —
// карт, дэлгэрэнгүй хуудас, "Миний зар"-ын мөр гурав нь бүгд үүнийг уншина.

import type { Conversation, ListingStatus, ListingType, Shipment, Trip, UserId } from "@/types";
import { formatDate, formatKg, formatPrice, routeFlags, routeTitle, type Route } from "@/lib/format";
import { listingPath } from "@/lib/nav";

export interface ListingStat {
  label: string;
  value: string;
  /** Үнэ гэх мэт онцлох утга индиго өнгөтэй гарна. */
  highlight?: boolean;
  /** Урт утга (огнооны интервал) багтахгүй тул жижиг фонтоор. */
  small?: boolean;
  /**
   * Ахицын зураас — аялалын сул жинд. Тоо уншилгүйгээр "бараг дүүрсэн үү,
   * дөнгөж эхэлж байна уу" гэдгийг шууд харуулна.
   */
  bar?: {
    /** Дүүрсэн хувь, 0–1. */
    ratio: number;
    /** Зураасны доорх тайлбар — "10кг захиалагдсан · 23кг нийт". */
    caption: string;
  };
}

export interface ListingSummary {
  type: ListingType;
  id: number;
  href: string;
  editHref: string;
  /** Чиглэл — ISO 3166-1 alpha-2. Хос зар нь яг ижил чиглэлтэй байх ёстой. */
  fromCountry: string;
  toCountry: string;
  fromCity: string | null;
  toCity: string | null;
  userId: UserId;
  userName: string;
  /** Cloudinary public_id — харуулахын өмнө avatarUrl()-ээр дамжина. */
  userAvatar: string | null;
  status: ListingStatus;
  /** Аялалын огноо өнгөрсөн эсэх (ачаанд үргэлж false). */
  expired: boolean;
  /** Шинэ хүсэлт хүлээж авахаа больсон эсэх — ачаа тохирсон, аялал дүүрсэн. */
  matched: boolean;
  /** matched үед харуулах шошго: аялалд "Дүүрсэн", ачаанд "Тохирсон". */
  fullLabel: string;
  /** matched үед үзэгчид тайлбарлах өгүүлбэр. */
  fullNotice: string;
  /** Аялалд — захиалагдсаныг хассан сул жин. Ачаанд undefined. */
  remainingKg?: number;
  createdAt: Date;
  /** "Vienna → Ulaanbaatar" */
  title: string;
  /** "🇦🇹 → 🇲🇳" */
  flags: string;
  /** Дэлгэрэнгүй хуудасны толгойн жижиг тайлбар. */
  kicker: string;
  /** Картын мэдээллийн мөр. */
  meta: string[];
  /** Мөрийн төгсгөлд индиго өнгөөр гарах үнэ. */
  price?: string;
  /** Нэмэлт тайлбар / ачааны тайлбар. */
  body: string | null;
  /** Дэлгэрэнгүй хуудасны 3 нүд. */
  stats: ListingStat[];
  ownerHint: string;
  contactPlaceholder: string;
  contactPrompt: string;
}

/**
 * Хос зарын төрөл. Аялалын зар руу ачаагаараа, ачааны зар руу аялалаараа
 * хандана — хүсэлт илгээхэд энэ төрлийн зар өөрт нь байх ёстой.
 */
export function counterpartType(type: ListingType): ListingType {
  return type === "trip" ? "shipment" : "trip";
}

/**
 * Хос зар нь нэг чиглэлийнх байх ёстой. Хотоор биш УЛСААР харьцуулна —
 * жагсаалтын шүүлтүүр ч мөн улсаар ажилладаг бөгөөд нэг улсын өөр хотод
 * уулзаж ачаагаа өгөх нь бодит амьдрал дээр байнга тохиолддог.
 */
export function sameRoute(a: Route, b: Route): boolean {
  return a.from_country === b.from_country && a.to_country === b.to_country;
}

/**
 * Жин нь хөвөгч таслалтай тул нийлбэр 7.000000000000001 гэх мэт үлдэгдэл өгдөг.
 * Багтаамжийг харьцуулахдаа ийм үлдэгдлээр татгалзахгүйн тулд.
 */
const KG_EPSILON = 1e-9;

/** Ачаа аялалын үлдсэн сул жинд багтах уу. */
export function fitsCapacity(weightKg: number, remainingKg: number): boolean {
  return weightKg <= remainingKg + KG_EPSILON;
}

/**
 * Огнооны харьцуулалтын суурь — "өнөөдөр" (YYYY-MM-DD).
 *
 * UTC-гээр тооцно. Австри (UTC+1/+2) ба Монгол (UTC+8) хоёулаа UTC-гээс
 * ЗҮҮН тийш байдаг тул энэ нь үргэлж ЗӨӨЛӨН тал руугаа алддаг: зар эрт
 * алга болохын оронд орон нутгийн шөнө дунд өнгөрсний дараа хэдэн цаг илүү
 * харагдана. UTC-гээс баруун тийш зах зээл нэмэгдвэл дахин авч үзэх хэрэгтэй.
 */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Аялалын огноо өнгөрсөн эсэх.
 *
 * Хэд хэдэн газар шалгагддаг тул нэг эх сурвалжтай байх ёстой: жагсаалт нь
 * ийм зарыг нуудаг, дахин нээхийг хориглодог, шинэ хүсэлт ч хүлээж авахгүй.
 */
export function isTripExpired(travelDate: string): boolean {
  return travelDate < todayIso();
}

/**
 * Хэлцлийг зөвшөөрөх эрхтэй тал — АЯЛАГЧ.
 *
 * Багтаамж нь аялагчийнх: тохирол бүр түүний сул жингээс хасагдана. Тиймээс
 * эцсийн шийдвэр аль зар нийтлэгдсэнээс үл хамааран үргэлж аялагчийнх байх
 * ёстой. Ачаа илгээгч тал нь зараа нийтэлсэн эсвэл хүсэлтээ илгээснээрээ аль
 * хэдийн зөвшөөрлөө өгсөн байдаг.
 *
 * Яриа аялалын зар дээр эхэлбэл аялагч нь зарын эзэн, ачааны зар дээр эхэлбэл
 * хос зараа (аялалаа) хавсаргасан эхлүүлэгч нь аялагч болно.
 */
export function travellerId(
  conversation: Pick<Conversation, "listing_type" | "starter_id" | "owner_id">
): UserId {
  return conversation.listing_type === "trip" ? conversation.owner_id : conversation.starter_id;
}

/**
 * Зар ба хос зарын аль нь аялал, аль нь ачаа болохыг ялгана. Багтаамжийн
 * шалгалт бүр "аль аялал, ямар ачаа" гэдгийг мэдэх шаардлагатай бөгөөд яриа
 * аль ч зүгээс эхэлж болдог тул энэ ялгааг нэг газар хийнэ.
 */
export function dealPair(
  listingType: ListingType,
  listing: Trip | Shipment,
  match: Trip | Shipment
): { trip: Trip; shipment: Shipment } {
  // listingType ба хос зарын төрөл нь үргэлж эсрэг тул хөрвүүлэлт найдвартай.
  return listingType === "trip"
    ? { trip: listing as Trip, shipment: match as Shipment }
    : { trip: match as Trip, shipment: listing as Shipment };
}

function shared(type: ListingType, listing: Trip | Shipment) {
  const href = listingPath(type, listing);
  return {
    type,
    id: listing.id,
    href,
    editHref: `${href}/edit`,
    fromCountry: listing.from_country,
    toCountry: listing.to_country,
    fromCity: listing.from_city,
    toCity: listing.to_city,
    userId: listing.user_id,
    userName: listing.user_name,
    userAvatar: listing.user_avatar,
    status: listing.status,
    createdAt: listing.created_at,
    title: routeTitle(listing),
    flags: routeFlags(listing),
  };
}

/**
 * Аялалын зарыг дэлгэцийн нэгдсэн хэлбэрт хөрвүүлнэ.
 *
 * bookedKg — тохирсон ачаанууд аль хэдийн эзэлсэн жин (data.ts → tripLoads).
 * Аялал хуваагдана: сул жин дуустал олон ачаа авах тул "сул" гэдэг нь нийт
 * биш, ҮЛДСЭН жин байх ёстой.
 */
export function tripSummary(trip: Trip, bookedKg = 0): ListingSummary {
  const base = shared("trip", trip);
  const remainingKg = Math.max(0, trip.available_kg - bookedKg);
  const full = remainingKg <= KG_EPSILON;
  const freeText = formatKg(remainingKg);

  return {
    ...base,
    expired: isTripExpired(trip.travel_date),
    matched: full,
    fullLabel: "Дүүрсэн",
    fullNotice:
      "Энэ аялалын сул жин дүүрсэн байна. Аль нэг тохиролцоо цуцлагдвал дахин сул болно.",
    remainingKg,
    kicker: `${base.flags} · Аялалын зар`,
    // Картан дээр нийт багтаамж хэрэггүй — уншигчийн ганц асуулт "миний ачаа
    // багтах уу?" тул үлдсэн жинг л хэлнэ.
    meta: [`🗓 ${formatDate(trip.travel_date)}`, `${freeText} сул`],
    price: `${formatPrice(trip.price_per_kg)}/кг`,
    body: trip.notes,
    stats: [
      { label: "Аялах огноо", value: formatDate(trip.travel_date) },
      {
        label: "Сул жин",
        value: `${freeText} сул`,
        // Зураас нь захиалагдсан хэсгийг харуулна. Огт захиалагдаагүй үед
        // хоосон зураас нэмэх нь чимээ тул тайлбарыг л энгийнээр өгнө.
        bar:
          bookedKg > 0
            ? {
                ratio: bookedKg / trip.available_kg,
                caption: `${formatKg(bookedKg)} захиалагдсан · ${formatKg(trip.available_kg)} нийт`,
              }
            : undefined,
      },
      { label: "1 кг-ийн үнэ", value: formatPrice(trip.price_per_kg), highlight: true },
    ],
    ownerHint:
      bookedKg > 0
        ? `Энэ бол таны зар. ${formatKg(bookedKg)} захиалагдсан, ${freeText} сул үлдсэн.`
        : "Энэ бол таны зар. Ачаагаа авчихсан бол зараа хаагаарай.",
    contactPlaceholder: "Сайн байна уу? Би ачаа илгээх гэсэн юм...",
    contactPrompt: "Аялагчтай холбогдохын тулд",
  };
}

/**
 * Ачааны хүсэлтийг дэлгэцийн нэгдсэн хэлбэрт хөрвүүлнэ.
 *
 * matched — аль хэдийн аялагчтай тохирсон эсэх. Ачаа хуваагдахгүй тул энэ нь
 * хоёрдмол утгагүй: тохирсон бол шинэ хүсэлт хүлээж авахгүй.
 */
export function shipmentSummary(shipment: Shipment, matched = false): ListingSummary {
  const period =
    shipment.ready_date || shipment.deadline_date
      ? `${formatDate(shipment.ready_date) || "..."} — ${formatDate(shipment.deadline_date) || "..."}`
      : "Тохиролцоно";
  const base = shared("shipment", shipment);

  return {
    ...base,
    expired: false,
    matched,
    fullLabel: "Тохирсон",
    fullNotice:
      "Энэ ачаа өөр аялагчтай аль хэдийн тохирсон байна. Тохиролцоо цуцлагдвал дахин сул болно.",
    kicker: `${base.flags} · Ачааны хүсэлт`,
    meta: [
      formatKg(shipment.weight_kg),
      ...(shipment.deadline_date ? [`🗓 ${formatDate(shipment.deadline_date)} дотор`] : []),
    ],
    price: shipment.offer_price ? `${formatPrice(shipment.offer_price)}/кг санал` : undefined,
    body: shipment.description,
    stats: [
      { label: "Жин", value: formatKg(shipment.weight_kg) },
      { label: "Хугацаа", value: period, small: true },
      {
        label: "Санал болгох үнэ",
        value: shipment.offer_price ? `${formatPrice(shipment.offer_price)}/кг` : "Тохиролцоно",
        highlight: true,
      },
    ],
    ownerHint: "Энэ бол таны хүсэлт. Ачаагаа илгээчихсэн бол зараа хаагаарай.",
    contactPlaceholder: "Сайн байна уу? Би энэ чиглэлд аялах гэж байгаа юм...",
    contactPrompt: "Илгээгчтэй холбогдохын тулд",
  };
}
