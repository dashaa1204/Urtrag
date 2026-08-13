import type { ReactNode } from "react";
import { PageContainer } from "@/components/ui";
import { SettingsNav } from "./settings-nav";

/** Тохиргооны бүх хэсгийн нийтлэг хүрээ: гарчиг + хажуугийн цэс + агуулга. */
export function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <PageContainer>
      <h1 className="mb-6 text-2xl font-bold text-ink">Тохиргоо</h1>
      <div className="grid gap-6 md:grid-cols-[13rem_1fr] md:items-start">
        <SettingsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </PageContainer>
  );
}
