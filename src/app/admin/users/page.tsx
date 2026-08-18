import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listAdminUsers } from "@/lib/admin-data";
import { parsePage, parseSearch } from "@/constant/admin";
import AdminUsersView from "@/views/admin/users-view";

export const metadata: Metadata = { title: "Хэрэглэгчид" };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  await requireAdmin();

  const { q, page } = await searchParams;
  const search = parseSearch(q);

  return <AdminUsersView page={await listAdminUsers({ q: search, page: parsePage(page) })} q={search} />;
}
