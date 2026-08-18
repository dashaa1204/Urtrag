import Link from "next/link";
import { avatarUrl } from "@/lib/avatar";
import { Avatar } from "@/components/ui";
import { countryFlag } from "@/constant/cities";
import type { UserId } from "@/types";

/**
 * Жагсаалт бүрд давтагддаг "хэн" нүд: зураг, нэр, профайл руу орох холбоос.
 * Хэрэглэгч, зар, хэлцлийн гурван хүснэгт хоёулаа үүнийг ашиглана.
 */
export function AdminUserCell({
  id,
  name,
  avatarPath,
  country,
  meta,
  size = "sm",
}: {
  id: UserId;
  name: string;
  avatarPath?: string | null;
  country?: string | null;
  /** Нэрийн доорх жижиг мөр — элссэн огноо, үүрэг гэх мэт. */
  meta?: string;
  size?: "xs" | "sm";
}) {
  return (
    <Link href={`/users/${id}`} className="flex min-w-0 items-center gap-2 hover:underline">
      <Avatar name={name} src={avatarUrl(avatarPath)} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">
          {country ? `${countryFlag(country)} ` : ""}
          {name}
        </span>
        {meta ? <span className="block truncate text-xs text-ink-soft">{meta}</span> : null}
      </span>
    </Link>
  );
}
