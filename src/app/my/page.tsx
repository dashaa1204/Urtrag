import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getUserRating, getVerification, listUserReviews, myShipments, myTrips } from "@/lib/data";
import { shipmentSummary, tripSummary } from "@/lib/listing";
import { parseFilter, parseTab } from "@/constant/dashboard";
import DashboardView from "@/views/my/dashboard-view";

export const metadata: Metadata = { title: "Миний хуудас", robots: { index: false, follow: false } };

export default async function MyPage({ searchParams }: PageProps<"/my">) {
  const user = await requireUser("/my");
  const { tab, status } = await searchParams;

  const [trips, shipments, rating, reviews, verification] = await Promise.all([
    myTrips(user.id),
    myShipments(user.id),
    getUserRating(user.id),
    listUserReviews(user.id),
    getVerification(user.id),
  ]);

  return (
    <DashboardView
      user={user}
      rating={rating}
      reviews={reviews}
      trips={trips.map(tripSummary)}
      shipments={shipments.map(shipmentSummary)}
      identityVerified={verification?.status === "approved"}
      tab={parseTab(tab)}
      filter={parseFilter(status)}
    />
  );
}
