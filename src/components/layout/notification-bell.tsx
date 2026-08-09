import Link from "next/link";
import type { Review } from "@/types";
import { BellIcon, LocalTime, Stars } from "@/components/ui";
import { Dropdown } from "./dropdown";

/**
 * Одоогоор мэдэгдлийн эх сурвалж нь хүлээж авсан үнэлгээ.
 * "Уншсан" төлөв хадгалдаггүй тул тоолуур харуулахгүй.
 */
export function NotificationBell({ userId, reviews }: { userId: string; reviews: Review[] }) {
  return (
    <Dropdown
      label="Мэдэгдэл"
      panelCls="w-72"
      triggerCls="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-200"
      trigger={<BellIcon />}
    >
      <p className="border-b border-slate-100 px-3 pb-2 pt-1 text-sm font-semibold text-slate-900">Мэдэгдэл</p>

      {reviews.length > 0 ? (
        <>
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/users/${userId}`}
              role="menuitem"
              className="block rounded-lg px-3 py-2 transition hover:bg-slate-100"
            >
              <p className="text-sm text-slate-700">
                <span className="font-medium text-slate-900">{review.reviewer_name}</span> танд үнэлгээ өглөө{" "}
                <Stars rating={review.rating} />
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                <LocalTime iso={review.created_at} dateOnly />
              </p>
            </Link>
          ))}
        </>
      ) : (
        <p className="px-3 py-6 text-center text-sm text-slate-500">Одоогоор мэдэгдэл алга.</p>
      )}
    </Dropdown>
  );
}
