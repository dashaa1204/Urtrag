import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listAdminActions } from "@/lib/admin-data";
import { parsePage } from "@/constant/admin";
import AdminLogView from "@/views/admin/log-view";

export const metadata: Metadata = { title: "Үйлдлийн түүх" };

export default async function AdminLogPage({ searchParams }: PageProps<"/admin/log">) {
  await requireAdmin();

  const { page } = await searchParams;
  return <AdminLogView page={await listAdminActions({ page: parsePage(page) })} />;
}
