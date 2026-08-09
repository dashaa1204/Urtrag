import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { recentReviews, unreadCount } from "@/lib/data";
import { btnPrimary, btnSm, ChatIcon, CountBadge } from "@/components/ui";
import { MobileNav } from "./mobile-nav";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";

const navLinkCls =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400";

export async function Navbar() {
  const user = await getCurrentUser();
  const [unread, notifications] = user
    ? await Promise.all([unreadCount(user.id), recentReviews(user.id, 5)])
    : [0, []];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-1 px-4 py-2 md:py-3">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          ✈️ Замдаа
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Link href="/trips" className={navLinkCls}>
            Аялалууд
          </Link>
          <Link href="/shipments" className={navLinkCls}>
            Ачаанууд
          </Link>
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                href="/messages"
                aria-label={unread > 0 ? `Мессеж (${unread} шинэ)` : "Мессеж"}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-200"
              >
                <ChatIcon />
                <CountBadge count={unread} className="absolute -right-1 -top-1" />
              </Link>
              <NotificationBell userId={user.id} reviews={notifications} />
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkCls}>
                Нэвтрэх
              </Link>
              <Link href="/signup" className={`${btnPrimary} ${btnSm}`}>
                Бүртгүүлэх
              </Link>
            </>
          )}
        </div>

        <MobileNav user={user} unread={unread} />
      </div>
    </header>
  );
}
