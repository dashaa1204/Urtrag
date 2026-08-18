import type { AdminDeal, AdminPage } from "@/lib/admin-data";
import { adminDealsHref, ADMIN_DEAL_FILTERS, type AdminDealFilter } from "@/constant/admin";
import { EmptyState, Panel, SegmentedNav } from "@/components/ui";
import { AdminDealRow, AdminPager } from "./components";

export default function AdminDealsView({
  page,
  status,
}: {
  page: AdminPage<AdminDeal>;
  status: AdminDealFilter;
}) {
  return (
    <div className="space-y-4">
      <SegmentedNav
        ariaLabel="Хэлцлийн төлөв"
        active={status}
        items={ADMIN_DEAL_FILTERS.map((filter) => ({
          key: filter.key,
          label: filter.label,
          href: adminDealsHref({ status: filter.key }),
        }))}
      />

      <p className="text-sm text-ink-soft">
        Хэлцэл бүр нэг аялал, нэг ачааг холбоно. Мессежийн агуулга хянагчид харагдахгүй — зөвхөн
        тоо нь харагдана.
      </p>

      {page.rows.length === 0 ? (
        <EmptyState title="Тохирох хэлцэл алга." />
      ) : (
        <Panel>
          {page.rows.map((deal) => (
            <AdminDealRow key={deal.id} deal={deal} />
          ))}
        </Panel>
      )}

      <AdminPager
        page={page.page}
        hasMore={page.hasMore}
        hrefFor={(next) => adminDealsHref({ status, page: next })}
      />
    </div>
  );
}
