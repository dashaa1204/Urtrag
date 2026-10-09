"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/types";
import { markNotificationsRead } from "@/lib/actions";
import { dashboardHref } from "@/constant/dashboard";
import { BellIcon, CountBadge, LocalTime, Stars } from "@/components/ui";
import { Dropdown } from "./dropdown";

/**
 * Одоогоор мэдэгдлийн эх сурвалж нь хүлээж авсан үнэлгээ. Хонх нээгдмэгц бүгдийг
 * үзсэнд тооцно — тоолуур нь navbar буюу layout дотор байдаг тул серверийн
 * өгөгдлийг router.refresh()-ээр дахин татаж шинэчилнэ.
 */
export function NotificationBell({ reviews, unread }: { reviews: Review[]; unread: number }) {
  const router = useRouter();
  // Уншсанд тэмдэглэсний дараа сервер шинэ өгөгдөл буцаадаг тул нээх агшны
  // "шинэ" мөрүүдийг тогтоож авна — самбар нээлттэй байхад цэгүүд алга болохгүй.
  const [justOpened, setJustOpened] = useState<ReadonlySet<number>>(() => new Set());

  function handleOpen() {
    if (unread === 0) return;
    setJustOpened(new Set(reviews.filter((review) => !review.read_at).map((review) => review.id)));
    void markNotificationsRead().then(() => router.refresh());
  }

  return (
    <Dropdown
      label={unread > 0 ? `Мэдэгдэл (${unread} шинэ)` : "Мэдэгдэл"}
      panelCls="w-72"
      triggerCls="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-soft transition hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:bg-ink/10"
      onOpen={handleOpen}
      trigger={
        <>
          <BellIcon />
          <CountBadge count={unread} className="absolute -right-1 -top-1" />
        </>
      }
    >
      <p className="border-b border-ink/10 px-3 pb-2 pt-1 text-sm font-semibold text-ink">Мэдэгдэл</p>

      {reviews.length > 0 ? (
        <>
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={dashboardHref("reviews")}
              role="menuitem"
              className="flex items-start gap-2 rounded-lg px-3 py-2 transition hover:bg-ink/5"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ink-soft">
                  <span className="font-medium text-ink">{review.reviewer_name}</span> танд үнэлгээ өглөө{" "}
                  <Stars rating={review.rating} />
                </span>
                <span className="mt-0.5 block text-xs text-ink-soft">
                  <LocalTime iso={review.created_at} dateOnly />
                </span>
              </span>

              {review.read_at && !justOpened.has(review.id) ? null : (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-label="Шинэ" />
              )}
            </Link>
          ))}
        </>
      ) : (
        <p className="px-3 py-6 text-center text-sm text-ink-soft">Одоогоор мэдэгдэл алга.</p>
      )}
    </Dropdown>
  );
}
