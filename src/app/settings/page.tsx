import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import ProfileSettingsView from "@/views/settings/profile-view";

export const metadata: Metadata = { title: "Профайл" };

export default async function SettingsProfilePage() {
  return <ProfileSettingsView user={await requireUser("/settings")} />;
}
