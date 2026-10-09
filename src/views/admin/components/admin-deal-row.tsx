import Link from "next/link";
import type { AdminDeal } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";
import { dealStatusLabel } from "@/constant/admin";
import { Badge, PanelRow } from "@/components/ui";
import { AdminUserCell } from "./admin-user-cell";
import type { DealStatus } from "@/types";

const toneByStatus: Record<DealStatus, "green" | "amber" | "slate"> = {
  pending: "amber",
  accepted: "green",
  cancelled: "slate",
};

/** Хэлцэлд орсон зарын нэг мөр. Зар устсан бол холбоос биш, тэмдэглэгээ гарна. */
function DealListing({ listing, label }: { listing: AdminDeal["trip"]; label: string }) {
  if (!listing) {
    return (
      <p className="truncate text-xs text-ink-soft">
        {label}: <span className="italic">устсан</span>
      </p>
    );
  }

  return (
    <p className="truncate text-xs text-ink-soft">
      {label}:{" "}
      <Link href={listing.href} className="font-medium text-ink hover:underline">
        {listing.title}
      </Link>{" "}
      · {listing.detail}
    </p>
  );
}

/**
 * Нэг хэлцлийн мөр.
 *
 * Ярианы агуулга ЗОРИУДААР харагдахгүй — хоёр хүний хувийн захидал нь
 * маргаан шийдвэрлэхэд ч хянагчийн уншиж болох зүйл биш. Мессежийн тоо нь
 * "яриа өрнөсөн үү" гэдгийг хэлэхэд хангалттай.
 */
export function AdminDealRow({ deal }: { deal: AdminDeal }) {
  return (
    <PanelRow className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="min-w-0 sm:flex-1">
        <DealListing listing={deal.trip} label="Аялал" />
        <DealListing listing={deal.shipment} label="Ачаа" />
      </div>

      <div className="flex min-w-0 flex-col gap-1 sm:w-48 sm:shrink-0">
        <AdminUserCell id={deal.starter.id} name={deal.starter.name} meta="хүсэлт илгээсэн" size="xs" />
        <AdminUserCell id={deal.owner.id} name={deal.owner.name} meta="зарын эзэн" size="xs" />
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:w-40 sm:flex-col sm:items-end sm:gap-1">
        <Badge tone={toneByStatus[deal.status]}>{dealStatusLabel(deal.status)}</Badge>
        <span className="text-xs text-ink-soft">
          {formatDate(deal.created_at)} · {deal.messages} мессеж
        </span>
      </div>
    </PanelRow>
  );
}
