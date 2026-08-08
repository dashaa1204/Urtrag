import { latestShipments, latestTrips } from "@/lib/data";
import HomeView from "@/views/home/home-view";

export default async function HomePage() {
  const [trips, shipments] = await Promise.all([latestTrips(4), latestShipments(4)]);
  return <HomeView trips={trips} shipments={shipments} />;
}
