import type { Verification } from "@/types";
import { formatDate } from "@/lib/format";
import { VERIFICATION_STEPS } from "@/constant/verification";
import { Badge, Card } from "@/components/ui";
import { IdentityForm } from "./components";

const statusCls: Record<Verification["status"], string> = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-800",
  rejected: "bg-red-50 text-red-700",
};

export default function IdentitySettingsView({ verification }: { verification: Verification | null }) {
  const approved = verification?.status === "approved";

  return (
    <div className="space-y-6">
      <Card
        title="Бичиг баримт баталгаажуулах"
        description="Баталгаажсан хэрэглэгч илүү итгэл хүлээж, хайлтад түрүүлж харагдана."
        headingAs="h2"
      >
        {verification ? <StatusBox verification={verification} /> : null}

        {approved ? null : (
          <>
            <div className="mb-6 rounded-xl bg-ink/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Хэрхэн явагдах вэ
              </p>
              <ol className="space-y-2 text-sm text-ink-soft">
                {VERIFICATION_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-2">
                    <span className="font-semibold text-ink">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <IdentityForm resubmit={verification !== null} />
          </>
        )}
      </Card>
    </div>
  );
}

function StatusBox({ verification }: { verification: Verification }) {
  const { status, note, submitted_at, reviewed_at } = verification;

  return (
    <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${statusCls[status]}`}>
      <p className="flex flex-wrap items-center gap-2 font-semibold">
        {status === "pending" ? (
          <>
            <Badge tone="amber">Хянагдаж байна</Badge> Хүсэлтийг {formatDate(submitted_at)}-нд хүлээн авсан.
          </>
        ) : status === "approved" ? (
          <>
            <Badge tone="green">Баталгаажсан</Badge> {formatDate(reviewed_at)}-нд баталгаажсан.
          </>
        ) : (
          <>
            <Badge tone="amber">Татгалзсан</Badge> {formatDate(reviewed_at)}
          </>
        )}
      </p>
      {status === "pending" ? (
        <p className="mt-1">24-48 цагийн дотор хариу мэдэгдэнэ. Шинэ баримт илгээвэл энэ хүсэлтийг орлоно.</p>
      ) : null}
      {note ? <p className="mt-1">{note}</p> : null}
    </div>
  );
}
