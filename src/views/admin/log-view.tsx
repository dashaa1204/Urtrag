import Link from "next/link";
import type { AdminLogEntry, AdminPage } from "@/lib/admin-data";
import { ADMIN_ACTION_LABELS, adminLogHref } from "@/constant/admin";
import { Badge, EmptyState, LocalTime, Panel, PanelRow } from "@/components/ui";
import { AdminPager } from "./components";

export default function AdminLogView({ page }: { page: AdminPage<AdminLogEntry> }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        Хянагчийн үйлдлүүд. Бүртгэл нь зөвхөн нэмэгддэг — эндээс юу ч засагдахгүй, устахгүй.
      </p>

      {page.rows.length === 0 ? (
        <EmptyState
          title="Түүх хоосон байна."
          description="Зар хаах, устгах, баримт шийдэх бүрд энд мөр нэмэгдэнэ."
        />
      ) : (
        <Panel>
          {page.rows.map((entry) => {
            const kind = ADMIN_ACTION_LABELS[entry.action];

            return (
              <PanelRow key={entry.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex min-w-0 items-center gap-2 sm:flex-1">
                  <Badge tone={kind.tone}>{kind.label}</Badge>
                  <span className="min-w-0 truncate text-sm text-ink">
                    {entry.summary ?? `${entry.target_type} #${entry.target_id}`}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-xs text-ink-soft">
                  <Link href={`/users/${entry.actor_id}`} className="font-medium hover:underline">
                    {entry.actor_name}
                  </Link>
                  <LocalTime iso={entry.created_at} />
                </div>
              </PanelRow>
            );
          })}
        </Panel>
      )}

      <AdminPager
        page={page.page}
        hasMore={page.hasMore}
        hrefFor={(next) => adminLogHref({ page: next })}
      />
    </div>
  );
}
