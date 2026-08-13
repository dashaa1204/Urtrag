import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserProfile,
  getUserRating,
  listUserReviews,
  userActiveShipments,
  userActiveTrips,
  withMatchFlags,
} from "@/lib/data";
import { shipmentSummary, tripSummary } from "@/lib/listing";
import UserProfileView from "@/views/users/user-profile-view";

// Хувь хүний нэр, үнэлгээ агуулдаг тул хайлтын системд индексжүүлэхгүй
export const metadata: Metadata = {
  title: "Хэрэглэгчийн профайл",
  robots: { index: false, follow: true },
};

// Хэрэглэгчийн id нь Supabase Auth-ийн uuid. Буруу хэлбэртэй бол Postgres
// алдаа өгөхөөс өмнө 404 буцаана.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function UserProfilePage({ params }: PageProps<"/users/[id]">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  // Өөрийн профайл нь /my — тэнд зар засах, шүүх боломж бүрэн байдаг тул
  // хоёр тусдаа хуудас барихын оронд шууд тийш нь чиглүүлнэ.
  const viewer = await getCurrentUser();
  if (viewer?.id === id) redirect("/my");

  const profile = await getUserProfile(id);
  if (!profile) notFound();

  const [rating, reviews, trips, shipments] = await Promise.all([
    getUserRating(profile.id),
    listUserReviews(profile.id),
    userActiveTrips(profile.id),
    userActiveShipments(profile.id),
  ]);

  return (
    <UserProfileView
      profile={profile}
      rating={rating}
      reviews={reviews}
      trips={await withMatchFlags("trip", trips.map(tripSummary))}
      shipments={await withMatchFlags("shipment", shipments.map(shipmentSummary))}
    />
  );
}
