import type { SessionUser } from "@/types";
import { Card } from "@/components/ui";
import { ProfileForm } from "./components";

export default function ProfileSettingsView({ user }: { user: SessionUser }) {
  return (
    <Card
      title="Профайл"
      description="Бусад хэрэглэгчид тантай холбогдохдоо энэ мэдээллийг харна."
      headingAs="h2"
    >
      <ProfileForm user={user} />
    </Card>
  );
}
