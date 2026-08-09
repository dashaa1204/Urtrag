import type { ListingSummary } from "@/lib/listing";
import { PageContainer, PageHeader } from "@/components/ui";
import { MyListingSection } from "./components";

export default function MyListingsView({
  trips,
  shipments,
}: {
  trips: ListingSummary[];
  shipments: ListingSummary[];
}) {
  return (
    <PageContainer width="list">
      <PageHeader title="Миний зарууд" />
      <div className="space-y-8">
        <MyListingSection type="trip" listings={trips} />
        <MyListingSection type="shipment" listings={shipments} />
      </div>
    </PageContainer>
  );
}
