import type { AdminPage } from "@/lib/admin-data";
import type { ListingSummary } from "@/lib/listing";
import {
  adminListingsHref,
  ADMIN_LISTING_FILTERS,
  LISTING_TYPE_TABS,
  type AdminListingFilter,
} from "@/constant/admin";
import { EmptyState, Panel, SegmentedNav } from "@/components/ui";
import type { ListingType } from "@/types";
import { AdminListingRow, AdminPager, AdminSearch } from "./components";

export default function AdminListingsView({
  page,
  type,
  status,
  q,
}: {
  page: AdminPage<ListingSummary>;
  type: ListingType;
  status: AdminListingFilter;
  q: string;
}) {
  // Шүүлтүүр солиход хайлт хэвээрээ, харин хуудас эхнээсээ эхэлнэ.
  const hrefFor = (next: Partial<{ type: ListingType; status: AdminListingFilter; page: number }>) =>
    adminListingsHref({ type, status, q, ...next });

  return (
    <div className="space-y-4">
      <SegmentedNav
        ariaLabel="Зарын төрөл"
        active={type}
        items={LISTING_TYPE_TABS.map((tab) => ({
          key: tab.key,
          label: tab.label,
          href: hrefFor({ type: tab.key }),
        }))}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedNav
          ariaLabel="Зарын төлөв"
          active={status}
          items={ADMIN_LISTING_FILTERS.map((filter) => ({
            key: filter.key,
            label: filter.label,
            href: hrefFor({ status: filter.key }),
          }))}
        />
        <AdminSearch
          action="/admin/listings"
          value={q}
          placeholder="Хот эсвэл эзнээр хайх"
          hidden={{ type, status: status === "all" ? undefined : status }}
        />
      </div>

      {page.rows.length === 0 ? (
        <EmptyState title="Тохирох зар алга." />
      ) : (
        <Panel>
          {page.rows.map((listing) => (
            <AdminListingRow
              key={listing.id}
              listing={listing}
              // Үйлдлийн дараа яг энэ харагдац руугаа буцна.
              back={hrefFor({ page: page.page })}
            />
          ))}
        </Panel>
      )}

      <AdminPager
        page={page.page}
        hasMore={page.hasMore}
        hrefFor={(next) => hrefFor({ page: next })}
      />
    </div>
  );
}
