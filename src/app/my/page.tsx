import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { myShipments, myTrips } from "@/lib/data";
import MyListingsView from "@/views/my/my-listings-view";

export const metadata: Metadata = { title: "Миний зарууд" };

export default async function MyPage() {
  const user = await requireUser("/my");
  return <MyListingsView trips={myTrips(user.id)} shipments={myShipments(user.id)} />;
}
