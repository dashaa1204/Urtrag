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

export default async function UserProfilePage({ params }: PageProps<"/users/[id]">) {
  const { id } = await params;
  const profile = getUserProfile(Number(id));
  if (!profile) notFound();

  return (
    <UserProfileView
      profile={profile}
      rating={getUserRating(profile.id)}
      reviews={listUserReviews(profile.id)}
      trips={userActiveTrips(profile.id)}
      shipments={userActiveShipments(profile.id)}
    />
  );
}
