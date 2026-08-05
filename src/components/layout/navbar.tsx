import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { unreadCount } from "@/lib/data";
import { logout } from "@/lib/actions";

const navLinkCls = "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900";

export async function Navbar() {
  const user = await getCurrentUser();
  const unread = user ? unreadCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-1 px-4 py-3">
        <Link href="/" className="mr-4 text-lg font-bold text-indigo-600">
          ✈️ Замдаа
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/trips" className={navLinkCls}>
            Аялалууд
          </Link>
          <Link href="/shipments" className={navLinkCls}>
            Ачаанууд
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {user ? (
            <>
              <Link href="/messages" className={`${navLinkCls} relative`}>
                Мессеж
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                ) : null}
              </Link>
              <Link href="/my" className={navLinkCls}>
                Миний зар
              </Link>
              <form action={logout}>
                <button type="submit" className={`${navLinkCls} cursor-pointer`}>
                  Гарах
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkCls}>
                Нэвтрэх
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Бүртгүүлэх
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
