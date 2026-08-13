// Хяналтын самбарын (/my) таб ба төлөвийн шүүлтүүр. Хоёулаа URL-д үлддэг тул
// (?tab=&status=) JS-гүйгээр ажиллаж, буцах товч зөв ажиллана.

import type { ListingSummary } from "@/lib/listing";

export type DashboardTab = "trips" | "shipments" | "reviews";
export type ListingFilter = "all" | "active" | "expired" | "closed";

export const DASHBOARD_TABS: { key: DashboardTab; label: string }[] = [
  { key: "trips", label: "Аялал" },
  { key: "shipments", label: "Ачаа" },
  { key: "reviews", label: "Үнэлгээ" },
];

export const LISTING_FILTERS: { key: ListingFilter; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "active", label: "Идэвхтэй" },
  { key: "expired", label: "Хугацаа өнгөрсөн" },
  { key: "closed", label: "Хаагдсан" },
];

const TAB_KEYS = DASHBOARD_TABS.map((tab) => tab.key);
const FILTER_KEYS = LISTING_FILTERS.map((filter) => filter.key);

/** Хаягийн мөрнөөс ирсэн утгыг шалгана — таарахгүй бол анхны сонголт. */
export function parseTab(value: string | string[] | undefined): DashboardTab {
  return typeof value === "string" && (TAB_KEYS as string[]).includes(value)
    ? (value as DashboardTab)
    : "trips";
}

export function parseFilter(value: string | string[] | undefined): ListingFilter {
  return typeof value === "string" && (FILTER_KEYS as string[]).includes(value)
    ? (value as ListingFilter)
    : "all";
}

/** Анхны сонголтыг URL-д бичихгүй — /my?tab=trips биш зүгээр /my. */
export function dashboardHref(tab: DashboardTab, filter: ListingFilter = "all"): string {
  const params = new URLSearchParams();
  if (tab !== "trips") params.set("tab", tab);
  if (filter !== "all" && tab !== "reviews") params.set("status", filter);
  const query = params.toString();
  return query ? `/my?${query}` : "/my";
}

/**
 * "Хугацаа өнгөрсөн" нь тусдаа төлөв биш — идэвхтэй хэвээрээ атлаа огноо нь
 * өнгөрсөн зар (зөвхөн аялалд тохиолдоно).
 */
export function matchesFilter(listing: ListingSummary, filter: ListingFilter): boolean {
  switch (filter) {
    case "active":
      return listing.status === "active" && !listing.expired;
    case "expired":
      return listing.status === "active" && listing.expired;
    case "closed":
      return listing.status === "closed";
    default:
      return true;
  }
}
