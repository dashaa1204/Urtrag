import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { SettingsShell } from "@/views/settings/components";

// Хэсэг бүр өөрийн гарчигтай. robots нь эндээс бүх дэд хуудсанд өвлөгдөнө.
export const metadata: Metadata = { title: "Тохиргоо", robots: { index: false, follow: false } };

export default async function SettingsLayout({ children }: LayoutProps<"/settings">) {
  await requireUser("/settings");
  return <SettingsShell>{children}</SettingsShell>;
}
