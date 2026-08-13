"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Сервер дээр false, hydration-ы дараа true. Үзэгчийн цагийн бүс/одоо цагаас
 * хамаардаг UI-г зөвхөн клиент дээр гаргаж, hydration зөрөхөөс сэргийлнэ.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function format(value: string | Date, dateOnly: boolean): string {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  return dateOnly ? date : `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** UTC-д хадгалсан цагийг үзэгчийн цагийн бүсэд харуулна (сервер дээр хоосон рендэрлэгдэнэ). */
export function LocalTime({ iso, dateOnly = false }: { iso: string | Date; dateOnly?: boolean }) {
  const text = useSyncExternalStore(
    emptySubscribe,
    () => format(iso, dateOnly),
    () => ""
  );

  return (
    <time dateTime={new Date(iso).toISOString()} suppressHydrationWarning>
      {text}
    </time>
  );
}

/** Зөвхөн цаг:минут — харилцан ярианы бөмбөлөг дотор. */
export function ClockTime({ iso }: { iso: string | Date }) {
  const isClient = useIsClient();
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {isClient ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : ""}
    </time>
  );
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function relative(value: string | Date): string {
  const diff = Date.now() - new Date(value).getTime();
  if (diff < MINUTE) return "Сая";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} мин`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} цаг`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} өдөр`;
  return format(value, true);
}

/** "5 мин", "2 цаг", "3 өдөр" — мессежийн жагсаалтад. */
export function RelativeTime({ iso }: { iso: string | Date }) {
  const isClient = useIsClient();

  return (
    <time dateTime={new Date(iso).toISOString()} suppressHydrationWarning>
      {isClient ? relative(iso) : ""}
    </time>
  );
}

/** Харилцан ярианы өдрийн зааг: "Өнөөдөр", "Өчигдөр", эсвэл огноо. */
export function DayLabel({ iso }: { iso: string | Date }) {
  const d = new Date(iso);
  const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / DAY);

  if (days === 0) return <>Өнөөдөр</>;
  if (days === 1) return <>Өчигдөр</>;
  return <>{format(d, true)}</>;
}
