"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/types";
import { logout } from "@/lib/actions";
import { Avatar, btnPrimary, CountBadge } from "@/components/ui";

const itemCls =
  "flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900";

export function MobileNav({ user, unread }: { user: SessionUser | null; unread: number }) {
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
        className="relative -mr-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-200"
      >
        <span aria-hidden className="text-xl leading-none">
          {open ? "✕" : "☰"}
        </span>
        {open ? null : <CountBadge count={unread} className="absolute right-0 top-0" />}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="absolute inset-x-0 top-full flex flex-col gap-0.5 border-b border-slate-200 bg-white p-2 shadow-lg">
            <Link href="/trips" className={itemCls}>
              Аялалууд
            </Link>
            <Link href="/shipments" className={itemCls}>
              Ачаанууд
            </Link>

            {user ? (
              <>
                <div className="my-1 border-t border-slate-100" />
                <Link href={`/users/${user.id}`} className={`${itemCls} gap-3`}>
                  <Avatar name={user.name} />
                  <span className="min-w-0">
                    <span className="block truncate">{user.name}</span>
                    <span className="block truncate text-xs font-normal text-slate-500">Миний профайл</span>
                  </span>
                </Link>
                <Link href="/messages" className={itemCls}>
                  Мессеж
                  <CountBadge count={unread} className="ml-2" />
                </Link>
                <Link href="/my" className={itemCls}>
                  Миний зар
                </Link>
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
