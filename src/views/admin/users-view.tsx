import type { AdminPage, AdminUser } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";
import { adminUsersHref } from "@/constant/admin";
import { Badge, EmptyState, Panel, PanelRow, RatingSummary } from "@/components/ui";
import type { VerificationStatus } from "@/types";
import { AdminPager, AdminSearch, AdminUserCell } from "./components";

const VERIFICATION: Record<VerificationStatus, { label: string; tone: "green" | "amber" | "slate" }> = {
  approved: { label: "Баталгаажсан", tone: "green" },
  pending: { label: "Шалгаж байна", tone: "amber" },
  rejected: { label: "Татгалзсан", tone: "slate" },
};

export default function AdminUsersView({ page, q }: { page: AdminPage<AdminUser>; q: string }) {
  return (
    <div className="space-y-4">
      <AdminSearch action="/admin/users" value={q} placeholder="Нэрээр хайх" />

      {page.rows.length === 0 ? (
        <EmptyState
          title={q ? `"${q}" гэсэн хэрэглэгч олдсонгүй.` : "Хэрэглэгч алга."}
          description={q ? "Өөр үгээр хайж үзнэ үү." : undefined}
        />
      ) : (
        <Panel>
          {page.rows.map((user) => {
            const verification = user.verification ? VERIFICATION[user.verification] : null;

            return (
              <PanelRow key={user.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 sm:flex-1">
                  <AdminUserCell
                    id={user.id}
                    name={user.name}
                    avatarPath={user.avatar_path}
                    country={user.country}
                    meta={`Элссэн: ${formatDate(user.created_at)}`}
                  />
                </div>

                <p className="text-xs text-ink-soft sm:w-44 sm:shrink-0">
                  {user.trips} аялал · {user.shipments} ачаа · {user.deals} хэлцэл
                </p>

                <div className="flex flex-wrap items-center gap-2 sm:w-40 sm:shrink-0 sm:justify-end">
                  <RatingSummary rating={{ avg: user.rating ?? 0, count: user.reviews }} />
                  {verification ? <Badge tone={verification.tone}>{verification.label}</Badge> : null}
                </div>
              </PanelRow>
            );
          })}
        </Panel>
      )}

      <AdminPager
        page={page.page}
        hasMore={page.hasMore}
        hrefFor={(next) => adminUsersHref({ q, page: next })}
      />
    </div>
  );
}
