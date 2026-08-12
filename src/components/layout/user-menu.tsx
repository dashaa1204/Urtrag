import Link from "next/link";
import type { SessionUser } from "@/types";
import { logout } from "@/lib/actions";
import { Avatar } from "@/components/ui";
import { Dropdown } from "./dropdown";

const itemCls =
  "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-soft transition hover:bg-ink/5 hover:text-ink";

export function UserMenu({ user }: { user: SessionUser }) {
  return (
    <Dropdown
      label="Профайлын цэс"
      triggerCls="flex cursor-pointer items-center rounded-full p-0.5 transition hover:bg-ink/5"
      trigger={<Avatar name={user.name} size="sm" />}
    >
      <div className="border-b border-ink/10 px-3 pb-2 pt-1">
        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
        <p className="truncate text-xs text-ink-soft">{user.email}</p>
      </div>

      <Link href={`/users/${user.id}`} role="menuitem" className={`${itemCls} mt-1.5`}>
        Миний профайл
      </Link>
      <Link href="/my" role="menuitem" className={itemCls}>
        Миний зар
      </Link>

      <form action={logout}>
        <button
          type="submit"
          role="menuitem"
          className={`${itemCls} cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          Гарах
        </button>
      </form>
    </Dropdown>
  );
}
