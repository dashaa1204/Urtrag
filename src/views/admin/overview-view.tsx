import Link from "next/link";
import type { AdminStats, AdminUser } from "@/lib/admin-data";
import type { ListingSummary } from "@/lib/listing";
import { formatDate } from "@/lib/format";
import { adminListingsHref, adminUsersHref } from "@/constant/admin";
import { EmptyState, Panel, PanelRow, SectionHeader } from "@/components/ui";
import { AdminListingRow, AdminUserCell, StatGrid, StatTile } from "./components";

/** "+3 (7 хоног)" — өсөлтгүй үед мөр нь бүр гарахгүй. */
function growth(count: number): string | undefined {
  return count > 0 ? `+${count} (7 хоног)` : undefined;
}

export default function AdminOverviewView({
  stats,
  users,
  listings,
  staleTrips,
}: {
  stats: AdminStats;
  users: AdminUser[];
  /** Сүүлд нэмэгдсэн зарууд — төлөв хамаарахгүй. */
  listings: ListingSummary[];
  staleTrips: number;
}) {
  return (
    <div className="space-y-8">
      <section>
        <SectionHeader title="Өнөөдрийн байдал" />
        <StatGrid>
          <StatTile
            label="Хэрэглэгч"
            value={stats.users.total}
            hint={growth(stats.users.week) ?? `+${stats.users.month} (30 хоног)`}
            href={adminUsersHref()}
          />
          <StatTile
            label="Аялал"
            value={stats.trips.total}
            hint={`${stats.trips.active} идэвхтэй`}
            href={adminListingsHref({ type: "trip" })}
          />
          <StatTile
            label="Ачаа"
            value={stats.shipments.total}
            hint={`${stats.shipments.active} идэвхтэй`}
            href={adminListingsHref({ type: "shipment" })}
          />
          <StatTile
            label="Тохирсон хэлцэл"
            value={stats.deals.accepted}
            hint={`${stats.deals.pending} хүлээгдэж буй`}
            href="/admin/deals"
          />
        </StatGrid>
      </section>

      <section>
        <SectionHeader title="Идэвх" />
        <StatGrid>
          <StatTile label="Мессеж" value={stats.messages.total} hint={growth(stats.messages.week)} />
          <StatTile
            label="Үнэлгээ"
            value={stats.reviews.total}
            hint={stats.reviews.avg === null ? undefined : `дундаж ★ ${stats.reviews.avg.toFixed(1)}`}
          />
          <StatTile
            label="Шалгах баримт"
            value={stats.pendingVerifications}
            hint={stats.pendingVerifications > 0 ? "хүлээгдэж байна" : "цэвэр"}
            href="/admin/verifications"
          />
          {/* Хугацаа нь өнгөрсөн ч нээлттэй үлдсэн аялал нь жагсаалтыг бөглөрүүлдэг
              тул тоог нь харагдуулж, шаардлагатай бол хаах боломж өгнө. */}
          <StatTile
            label="Хугацаа өнгөрсөн аялал"
            value={staleTrips}
            hint={staleTrips > 0 ? "хаагдаагүй" : "цэвэр"}
            href={adminListingsHref({ type: "trip", status: "active" })}
          />
        </StatGrid>
      </section>

      <section>
        <SectionHeader
          title="Сүүлд нэгдсэн"
          action={
            <Link href={adminUsersHref()} className="text-sm font-medium text-stamp hover:underline">
              Бүгдийг харах
            </Link>
          }
        />
        {users.length === 0 ? (
          <EmptyState title="Хэрэглэгч алга." />
        ) : (
          <Panel>
            {users.map((user) => (
              <PanelRow key={user.id} className="flex items-center justify-between gap-3">
                <AdminUserCell
                  id={user.id}
                  name={user.name}
                  avatarPath={user.avatar_path}
                  country={user.country}
                  meta={`${user.trips} аялал · ${user.shipments} ачаа`}
                />
                <span className="shrink-0 text-xs text-ink-soft">{formatDate(user.created_at)}</span>
              </PanelRow>
            ))}
          </Panel>
        )}
      </section>

      <section>
        <SectionHeader
          title="Сүүлийн зарууд"
          action={
            <Link
              href={adminListingsHref()}
              className="text-sm font-medium text-stamp hover:underline"
            >
              Бүгдийг харах
            </Link>
          }
        />
        {listings.length === 0 ? (
          <EmptyState title="Зар алга." />
        ) : (
          <Panel>
            {listings.map((listing) => (
              <AdminListingRow key={`${listing.type}-${listing.id}`} listing={listing} />
            ))}
          </Panel>
        )}
      </section>
    </div>
  );
}
