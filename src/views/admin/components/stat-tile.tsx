import Link from "next/link";
import type { ReactNode } from "react";

const tileCls = "rounded-xl border-2 border-ink/12 bg-card p-4";

/**
 * Тоймын нэг тоо. href өгвөл дарагдах болж, тухайн тоо хаанаас гарсныг харуулах
 * жагсаалт руу аваачна — самбараас өгөгдөл рүү шууд гүүр.
 */
export function StatTile({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number | string;
  /** Тоон доорх жижиг тайлбар — ихэвчлэн 7 хоногийн өсөлт. */
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-ink-soft/70">{hint}</p> : null}
    </>
  );

  return href ? (
    <Link href={href} className={`${tileCls} block transition hover:border-ink/35`}>
      {body}
    </Link>
  ) : (
    <div className={tileCls}>{body}</div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}
