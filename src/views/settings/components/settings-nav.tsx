"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_NAV, type SettingsIcon } from "@/constant/settings";
import { IdCardIcon, LockIcon, ShieldIcon, UserIcon } from "@/components/ui";

const ICONS: Record<SettingsIcon, typeof UserIcon> = {
  profile: UserIcon,
  identity: IdCardIcon,
  security: LockIcon,
  privacy: ShieldIcon,
};

/** Тохиргооны хажуугийн цэс. Идэвхтэй хэсгийг замаар нь тодруулна. */
export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Тохиргооны хэсгүүд" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {SETTINGS_NAV.map((item) => {
        const Icon = ICONS[item.icon];
        const current = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition ${
              current ? "bg-ink/8 text-ink" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
