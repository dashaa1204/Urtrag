"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/types";
import { logout } from "@/lib/actions";
import { avatarUrl } from "@/lib/avatar";
import { Avatar, btnPrimary, CountBadge } from "@/components/ui";

const itemCls =
  "flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-ink-soft transition hover:bg-ink/5 hover:text-ink";

export function MobileNav({
  user,
  unread,
  admin = false,
}: {
  user: SessionUser | null;
  unread: number;
  admin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Хуудас солигдоход цэсийг хаана.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="ml-auto md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Цэс хаах" : "Цэс нээх"}
        className="relative -mr-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-ink-soft transition hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:bg-ink/10"
      >
        <span aria-hidden className="text-xl leading-none">
          {open ? "✕" : "☰"}
        </span>
        {open ? null : <CountBadge count={unread} className="absolute right-0 top-0" />}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 bg-ink/25"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="absolute inset-x-0 top-full flex flex-col gap-0.5 border-b-2 border-ink/15 bg-card p-2">
            <Link href="/trips" className={itemCls}>
              Аялалууд
            </Link>
            <Link href="/shipments" className={itemCls}>
              Ачаанууд
            </Link>

            {user ? (
              <>
                <div className="my-1 border-t border-ink/10" />
                <Link href="/my" className={`${itemCls} gap-3`}>
                  <Avatar name={user.name} src={avatarUrl(user.avatarPath)} />
                  <span className="min-w-0">
                    <span className="block truncate">{user.name}</span>
                    <span className="block truncate text-xs font-normal text-ink-soft">Миний хуудас</span>
                  </span>
                </Link>
                <Link href="/messages" className={itemCls}>
                  Мессеж
                  <CountBadge count={unread} className="ml-2" />
                </Link>
                <Link href="/settings" className={itemCls}>
                  Тохиргоо
                </Link>
                {admin ? (
                  <Link href="/admin" className={itemCls}>
                    Хянах самбар
                  </Link>
                ) : null}
                <form action={logout} className="contents">
                  <button
                    type="submit"
                    className={`${itemCls} w-full cursor-pointer text-left text-red-600 hover:bg-red-50 hover:text-red-700`}
                  >
                    Гарах
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={itemCls}>
                  Нэвтрэх
                </Link>
                <Link href="/signup" className={`${btnPrimary} mt-1 w-full sm:min-h-11`}>
                  Бүртгүүлэх
                </Link>
              </>
            )}
          </nav>
        </>
      ) : null}
    </div>
  );
}
