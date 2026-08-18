import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { adminStats, countStaleTrips, listAdminUsers, recentListings } from "@/lib/admin-data";
import { shipmentSummaries, tripSummaries } from "@/lib/data";
import AdminOverviewView from "@/views/admin/overview-view";

export const metadata: Metadata = { title: "Тойм" };

/** Тоймд гарах "сүүлийн зар"-ын тоо (аялал, ачаа хоёрыг нийлүүлсний дараа). */
const RECENT_LIMIT = 6;

export default async function AdminPage() {
  await requireAdmin();

  const [stats, users, recent, staleTrips] = await Promise.all([
    adminStats(),
    listAdminUsers({ page: 1 }),
    recentListings(RECENT_LIMIT),
    countStaleTrips(),
  ]);

  const [trips, shipments] = await Promise.all([
    tripSummaries(recent.trips),
    shipmentSummaries(recent.shipments),
  ]);

  const listings = [...trips, ...shipments]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, RECENT_LIMIT);

  return (
    <AdminOverviewView
      stats={stats}
      users={users.rows.slice(0, 5)}
      listings={listings}
      staleTrips={staleTrips}
    />
  );
}
