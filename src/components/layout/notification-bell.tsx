import Link from "next/link";
import type { Review } from "@/types";
import { dashboardHref } from "@/constant/dashboard";
import { BellIcon, LocalTime, Stars } from "@/components/ui";
import { Dropdown } from "./dropdown";

/**
 * Одоогоор мэдэгдлийн эх сурвалж нь хүлээж авсан үнэлгээ.
 * "Уншсан" төлөв хадгалдаггүй тул тоолуур харуулахгүй.
 */
export function NotificationBell({ reviews }: { reviews: Review[] }) {
  return (
    <Dropdown
      label="Мэдэгдэл"
      panelCls="w-72"
      triggerCls="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-soft transition hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:bg-ink/10"
      trigger={<BellIcon />}
    >
      <p className="border-b border-ink/10 px-3 pb-2 pt-1 text-sm font-semibold text-ink">Мэдэгдэл</p>

      {reviews.length > 0 ? (
        <>
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={dashboardHref("reviews")}
              role="menuitem"
              className="block rounded-lg px-3 py-2 transition hover:bg-ink/5"
            >
              <p className="text-sm text-ink-soft">
                <span className="font-medium text-ink">{review.reviewer_name}</span> танд үнэлгээ өглөө{" "}
                <Stars rating={review.rating} />
              </p>
              <p className="mt-0.5 text-xs text-ink-soft/70">
                <LocalTime iso={review.created_at} dateOnly />
              </p>
            </Link>
          ))}
        </>
      ) : (
        <p className="px-3 py-6 text-center text-sm text-ink-soft">Одоогоор мэдэгдэл алга.</p>
      )}
    </Dropdown>
  );
}
