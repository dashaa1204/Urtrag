import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listAdminDeals } from "@/lib/admin-data";
import { parseDealFilter, parsePage } from "@/constant/admin";
import AdminDealsView from "@/views/admin/deals-view";

export const metadata: Metadata = { title: "Хэлцлүүд" };

export default async function AdminDealsPage({ searchParams }: PageProps<"/admin/deals">) {
  await requireAdmin();

  const { status, page } = await searchParams;
  const filter = parseDealFilter(status);

  return <AdminDealsView page={await listAdminDeals({ status: filter, page: parsePage(page) })} status={filter} />;
}
