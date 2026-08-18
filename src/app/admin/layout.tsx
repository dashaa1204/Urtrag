import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { countPendingVerifications } from "@/lib/admin-data";
import { AdminShell } from "@/views/admin/components";

// Хэсэг бүр өөрийн гарчигтай. robots нь эндээс бүх дэд хуудсанд өвлөгдөнө.
export const metadata: Metadata = { title: "Хянах самбар", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Хуудас бүр өөрөө ч requireAdmin() дууддаг: layout нь эрхийн ЦОРЫН ГАНЦ
  // хаалга биш байх ёстой (getCurrentUser нь request-ийн хэмжээнд cache
  // хийгддэг тул давхар дуудлага нэмэлт зардал үүсгэхгүй).
  await requireAdmin();

  return <AdminShell pending={await countPendingVerifications()}>{children}</AdminShell>;
}
