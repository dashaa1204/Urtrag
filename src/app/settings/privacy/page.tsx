import type { Metadata } from "next";
import PrivacySettingsView from "@/views/settings/privacy-view";

export const metadata: Metadata = { title: "Нууцлал" };

export default function SettingsPrivacyPage() {
  return <PrivacySettingsView />;
}
