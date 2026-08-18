import type { ReactNode } from "react";
import { PageContainer, PageHeader } from "@/components/ui";
import { AdminNav } from "./admin-nav";

/** Хянагчийн бүх хэсгийн нийтлэг хүрээ: гарчиг + таб + агуулга. */
export function AdminShell({ pending, children }: { pending: number; children: ReactNode }) {
  return (
    <PageContainer>
      <PageHeader title="Хянах самбар" description="Зөвхөн хянагчид харагдана." />
      <AdminNav pending={pending} />
      <div className="mt-6">{children}</div>
    </PageContainer>
  );
}
