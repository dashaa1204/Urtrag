"use client";

import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/constant/admin";
import { SegmentedNav, type SegmentedItem } from "@/components/ui";

/**
 * Самбарын хэсгүүд. "/admin" нь бусад бүх замын угтвар тул хамгийн УРТ таарсан
 * хаягийг идэвхтэй гэж үзнэ — эс бөгөөс "Тойм" үргэлж сонгогдсон харагдана.
 */
function activeHref(pathname: string): string {
  return ADMIN_NAV.reduce((best, item) => {
    const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return matches && item.href.length > best.length ? item.href : best;
  }, "/admin");
}

export function AdminNav({ pending }: { pending: number }) {
  const pathname = usePathname();

  const items: SegmentedItem[] = ADMIN_NAV.map((item) => ({
    key: item.href,
    label: item.label,
    href: item.href,
    // Хүлээгдэж буй баримт нь цорын ганц "хийх ажил" — тоог нь цэсэн дээр гаргана.
    count: item.href === "/admin/verifications" ? pending : undefined,
  }));

  return <SegmentedNav items={items} active={activeHref(pathname)} ariaLabel="Хянах самбарын хэсгүүд" />;
}
