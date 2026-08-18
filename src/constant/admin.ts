// Хянагчийн самбарын хэсгүүд, шүүлтүүр, хуудаслалт.
//
// Бүх сонголт URL-д үлдэнэ (?type=&status=&q=&page=) тул JS-гүйгээр ажиллаж,
// буцах товч зөв ажиллаж, тухайн харагдацаа шууд хуваалцаж болно — /my
// самбартай ижил зарчим.
//
// Клиент компонент (admin-nav) уншдаг тул энд зөвхөн цэвэр утга байна:
// серверийн модуль (lib/nav → lib/public-id) энд орж ирэхгүй.

import type { DealStatus, ListingStatus, ListingType } from "@/types";
// Зөвхөн ТӨРӨЛ — хөрвүүлэлтийн дараа устдаг тул схемийн код клиент рүү очихгүй.
import type { AdminActionKind } from "@/lib/db/schema";

export const ADMIN_NAV: { href: string; label: string }[] = [
  { href: "/admin", label: "Тойм" },
  { href: "/admin/users", label: "Хэрэглэгч" },
  { href: "/admin/listings", label: "Зар" },
  { href: "/admin/deals", label: "Хэлцэл" },
  { href: "/admin/verifications", label: "Баримт" },
  { href: "/admin/log", label: "Түүх" },
];

/** Түүхийн мөрөнд гарах үйлдлийн нэр ба өнгө. */
export const ADMIN_ACTION_LABELS: Record<
  AdminActionKind,
  { label: string; tone: "green" | "amber" | "slate" }
> = {
  listing_close: { label: "Зар хаасан", tone: "amber" },
  listing_reopen: { label: "Зар нээсэн", tone: "green" },
  listing_delete: { label: "Зар устгасан", tone: "slate" },
  verification_approve: { label: "Баримт баталсан", tone: "green" },
  verification_reject: { label: "Баримт татгалзсан", tone: "slate" },
};

/** Нэг хуудсанд буух мөрийн тоо. */
export const ADMIN_PAGE_SIZE = 25;

/** Хайлтын үгийн дээд урт — түүнээс цаашхи нь утгагүй, SQL-д ч ачаалал. */
const SEARCH_MAX = 60;

/** Хамгийн сүүлийн хуудас — хязгааргүй offset нь дэмий уншилт. */
const PAGE_MAX = 400;

export type AdminListingFilter = "all" | ListingStatus;
export type AdminDealFilter = "all" | DealStatus;

export const LISTING_TYPE_TABS: { key: ListingType; label: string }[] = [
  { key: "trip", label: "Аялал" },
  { key: "shipment", label: "Ачаа" },
];

export const ADMIN_LISTING_FILTERS: { key: AdminListingFilter; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "active", label: "Идэвхтэй" },
  { key: "closed", label: "Хаагдсан" },
];

/** Шүүлтүүрийн шошго ба мөрийн шошго нэг эх сурвалжтай — хоёр газар зөрөхгүй. */
const DEAL_LABELS: Record<DealStatus, string> = {
  pending: "Хүлээгдэж буй",
  accepted: "Тохирсон",
  cancelled: "Цуцалсан",
};

export const ADMIN_DEAL_FILTERS: { key: AdminDealFilter; label: string }[] = [
  { key: "all", label: "Бүгд" },
  ...Object.entries(DEAL_LABELS).map(([key, label]) => ({ key: key as DealStatus, label })),
];

export function dealStatusLabel(status: DealStatus): string {
  return DEAL_LABELS[status];
}

/** Хаягийн мөрнөөс ирсэн утгыг жагсаалттай тулгана — таарахгүй бол анхны сонголт. */
function parseKey<T extends string>(
  value: string | string[] | undefined,
  keys: readonly T[],
  fallback: T
): T {
  return typeof value === "string" && (keys as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function parseListingType(value: string | string[] | undefined): ListingType {
  return parseKey(value, ["trip", "shipment"], "trip");
}

export function parseListingFilter(value: string | string[] | undefined): AdminListingFilter {
  return parseKey(value, ["all", "active", "closed"], "all");
}

export function parseDealFilter(value: string | string[] | undefined): AdminDealFilter {
  return parseKey(value, ["all", "pending", "accepted", "cancelled"], "all");
}

export function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return page >= 1 && page <= PAGE_MAX ? page : 1;
}

export function parseSearch(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim().slice(0, SEARCH_MAX) : "";
}

/** Анхны сонголтыг хаягт бичихгүй — /admin/listings?type=trip биш зүгээр /admin/listings. */
function href(path: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

function pageParam(page: number): string | undefined {
  return page > 1 ? String(page) : undefined;
}

export function adminUsersHref({ q = "", page = 1 }: { q?: string; page?: number } = {}): string {
  return href("/admin/users", { q, page: pageParam(page) });
}

export function adminListingsHref({
  type = "trip",
  status = "all",
  q = "",
  page = 1,
}: {
  type?: ListingType;
  status?: AdminListingFilter;
  q?: string;
  page?: number;
} = {}): string {
  return href("/admin/listings", {
    type: type === "trip" ? undefined : type,
    status: status === "all" ? undefined : status,
    q,
    page: pageParam(page),
  });
}

export function adminLogHref({ page = 1 }: { page?: number } = {}): string {
  return href("/admin/log", { page: pageParam(page) });
}

export function adminDealsHref({
  status = "all",
  page = 1,
}: { status?: AdminDealFilter; page?: number } = {}): string {
  return href("/admin/deals", { status: status === "all" ? undefined : status, page: pageParam(page) });
}
