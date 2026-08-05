import { latestShipments, latestTrips } from "@/lib/data";
import HomeView from "@/views/home/home-view";

export default function HomePage() {
  return <HomeView trips={latestTrips(4)} shipments={latestShipments(4)} />;
}
