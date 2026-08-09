import Link from "next/link";
import type { ReactNode } from "react";

/** Мөр мөрөөр жагсаах хайрцаг (миний зар, мессежийн жагсаалт, үнэлгээ). */
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/** Panel доторх нэг мөр. href өгвөл дарагдах мөр болно. Байрлалыг className-ээр өгнө. */
export function PanelRow({
  href,
  className = "block",
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  const cls = `border-b border-slate-100 px-4 py-3 last:border-b-0 ${
    href ? "transition hover:bg-slate-50" : ""
  } ${className}`;

  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}

/** Хоосон жагсаалтын нэг маягийн мэдэгдэл. */
export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-10">
      <p className="text-slate-500">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}
