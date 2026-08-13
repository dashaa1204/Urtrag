import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import SecuritySettingsView from "@/views/settings/security-view";

export const metadata: Metadata = { title: "Аюулгүй байдал" };

export default async function SettingsSecurityPage() {
  return <SecuritySettingsView user={await requireUser("/settings/security")} />;
}
