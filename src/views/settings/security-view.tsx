import type { SessionUser } from "@/types";
import { formatDate } from "@/lib/format";
import { Badge, Card } from "@/components/ui";
import { PasswordForm } from "./components";

export default function SecuritySettingsView({ user }: { user: SessionUser }) {
  return (
    <div className="space-y-6">
      <Card title="Нэвтрэх мэдээлэл" headingAs="h2">
        <dl className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-ink-soft">Имэйл</dt>
            <dd className="flex items-center gap-2 font-medium text-ink">
              {user.email}
              {user.emailVerified ? (
                <Badge tone="green">Баталгаажсан</Badge>
              ) : (
                <Badge tone="amber">Баталгаажаагүй</Badge>
              )}
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-ink-soft">Бүртгүүлсэн</dt>
            <dd className="font-medium text-ink">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-ink-soft">
          Имэйл хаягаа солих шаардлагатай бол бидэнтэй холбогдоно уу.
        </p>
      </Card>

      <Card
        title="Нууц үг солих"
        description="Аюулгүй байдлын үүднээс одоогийн нууц үгээ давтан оруулна."
        headingAs="h2"
      >
        <PasswordForm />
      </Card>
    </div>
  );
}
