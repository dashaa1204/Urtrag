import type { MetadataRoute } from "next";
import { listShipments, listTrips } from "@/lib/data";
import { listingPath } from "@/lib/nav";
import { SITE } from "@/constant/site";

// Зар байнга нэмэгддэг тул цагт нэг удаа шинэчилнэ (эс бөгөөс build үеийнхээр хөлдөнө).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [trips, shipments] = await Promise.all([listTrips(), listShipments()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/trips`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/shipments`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const listings: MetadataRoute.Sitemap = [
    ...trips.map((trip) => ({ type: "trip" as const, row: trip })),
    ...shipments.map((shipment) => ({ type: "shipment" as const, row: shipment })),
  ].map((listing) => ({
    url: `${SITE.url}${listingPath(listing.type, listing.row)}`,
    lastModified: listing.row.created_at,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...listings];
}
