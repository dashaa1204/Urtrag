"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

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
