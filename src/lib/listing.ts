// Trip ба Shipment хоёр нь өөр талбартай ч дэлгэц дээр яг ижил хэлбэрээр харагддаг.
// Тиймээс UI-д хүрэхээсээ өмнө хоёуланг нь энд нэг ListingSummary болгож хөрвүүлнэ —
// карт, дэлгэрэнгүй хуудас, "Миний зар"-ын мөр гурав нь бүгд үүнийг уншина.

import type { ListingStatus, ListingType, Shipment, Trip, UserId } from "@/types";
import { DIRECTIONS } from "@/constant/directions";
import { directionCities, formatDate, formatKg, formatPrice } from "@/lib/format";

export interface ListingStat {
  label: string;
  value: string;
  /** Үнэ гэх мэт онцлох утга индиго өнгөтэй гарна. */
  highlight?: boolean;
  /** Урт утга (огнооны интервал) багтахгүй тул жижиг фонтоор. */
  small?: boolean;
}

export interface ListingSummary {
  type: ListingType;
  id: number;
  href: string;
  editHref: string;
  userId: UserId;
  userName: string;
  status: ListingStatus;
  /** Аялалын огноо өнгөрсөн эсэх (ачаанд үргэлж false). */
  expired: boolean;
  createdAt: Date;
  /** "Вена → Улаанбаатар" */
  title: string;
  /** "AT → MN" */
  directionShort: string;
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

export function listingPath(type: ListingType, id: number): string {
  return `${type === "trip" ? "/trips" : "/shipments"}/${id}`;
}

function shared(type: ListingType, listing: Trip | Shipment) {
  const href = listingPath(type, listing.id);
  return {
    type,
    id: listing.id,
    href,
    editHref: `${href}/edit`,
    userId: listing.user_id,
    userName: listing.user_name,
    status: listing.status,
    createdAt: listing.created_at,
    title: directionCities(listing.direction, listing.from_city, listing.to_city),
    directionShort: DIRECTIONS[listing.direction].short,
  };
}

/** Аялалын зарыг дэлгэцийн нэгдсэн хэлбэрт хөрвүүлнэ. */
export function tripSummary(trip: Trip): ListingSummary {
  return {
    ...shared("trip", trip),
    expired: trip.travel_date < new Date().toISOString().slice(0, 10),
    kicker: `${DIRECTIONS[trip.direction].short} · Аялалын зар`,
    meta: [`🗓 ${formatDate(trip.travel_date)}`, `${formatKg(trip.available_kg)} сул`],
    price: `${formatPrice(trip.price_per_kg)}/кг`,
    body: trip.notes,
    stats: [
      { label: "Аялах огноо", value: formatDate(trip.travel_date) },
      { label: "Сул жин", value: formatKg(trip.available_kg) },
      { label: "1 кг-ийн үнэ", value: formatPrice(trip.price_per_kg), highlight: true },
    ],
    ownerHint: "Энэ бол таны зар. Ачаагаа авчихсан бол зараа хаагаарай.",
    contactPlaceholder: "Сайн байна уу? Би ачаа илгээх гэсэн юм...",
    contactPrompt: "Аялагчтай холбогдохын тулд",
  };
}

/** Ачааны хүсэлтийг дэлгэцийн нэгдсэн хэлбэрт хөрвүүлнэ. */
export function shipmentSummary(shipment: Shipment): ListingSummary {
  const period =
    shipment.ready_date || shipment.deadline_date
      ? `${formatDate(shipment.ready_date) || "..."} — ${formatDate(shipment.deadline_date) || "..."}`
      : "Тохиролцоно";

  return {
    ...shared("shipment", shipment),
    expired: false,
    kicker: `${DIRECTIONS[shipment.direction].short} · Ачааны хүсэлт`,
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
