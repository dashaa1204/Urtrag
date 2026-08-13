import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getVerification } from "@/lib/data";
import IdentitySettingsView from "@/views/settings/identity-view";

export const metadata: Metadata = { title: "Бичиг баримт" };

export default async function SettingsIdentityPage() {
  const user = await requireUser("/settings/identity");
  return <IdentitySettingsView verification={await getVerification(user.id)} />;
}
