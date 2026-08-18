import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listAdminShipments, listAdminTrips, type AdminPage } from "@/lib/admin-data";
import { shipmentSummaries, tripSummaries } from "@/lib/data";
import type { ListingSummary } from "@/lib/listing";
import { parseListingFilter, parseListingType, parsePage, parseSearch } from "@/constant/admin";
import AdminListingsView from "@/views/admin/listings-view";

export const metadata: Metadata = { title: "Зарууд" };

/**
 * Аялал, ачаа хоёрыг ижил ListingSummary болгож харуулна — тэмдэг, чиглэл,
 * "тохирсон эсэх" бүгд нийтийн жагсаалттай ижилхэн уншигдана.
 */
async function withSummaries<T>(
  found: AdminPage<T>,
  toSummaries: (rows: T[]) => Promise<ListingSummary[]>
): Promise<AdminPage<ListingSummary>> {
  return { ...found, rows: await toSummaries(found.rows) };
}

export default async function AdminListingsPage({ searchParams }: PageProps<"/admin/listings">) {
  await requireAdmin();

  const params = await searchParams;
  const type = parseListingType(params.type);
  const status = parseListingFilter(params.status);
  const q = parseSearch(params.q);
  const page = parsePage(params.page);

  const listings =
    type === "trip"
      ? await withSummaries(await listAdminTrips({ status, q, page }), tripSummaries)
      : await withSummaries(await listAdminShipments({ status, q, page }), shipmentSummaries);

  return <AdminListingsView page={listings} type={type} status={status} q={q} />;
}
