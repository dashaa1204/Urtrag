import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getUserProfile,
  getUserRating,
  listUserReviews,
  userActiveShipments,
  userActiveTrips,
} from "@/lib/data";
import UserProfileView from "@/views/users/user-profile-view";

export const metadata: Metadata = { title: "Хэрэглэгчийн профайл" };

// Хэрэглэгчийн id нь Supabase Auth-ийн uuid. Буруу хэлбэртэй бол Postgres
// алдаа өгөхөөс өмнө 404 буцаана.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function UserProfilePage({ params }: PageProps<"/users/[id]">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const profile = await getUserProfile(id);
  if (!profile) notFound();

  const [rating, reviews, trips, shipments] = await Promise.all([
    getUserRating(profile.id),
    listUserReviews(profile.id),
    userActiveTrips(profile.id),
    userActiveShipments(profile.id),
  ]);

  return <UserProfileView profile={profile} rating={rating} reviews={reviews} trips={trips} shipments={shipments} />;
}
