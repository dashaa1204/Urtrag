import Link from "next/link";
import type { ReactNode } from "react";

/** Мөр мөрөөр жагсаах хайрцаг (миний зар, мессежийн жагсаалт, үнэлгээ). */
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border-2 border-ink/12 bg-card ${className}`}>
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
  const cls = `border-b border-ink/10 px-4 py-3 last:border-b-0 ${
    href ? "transition hover:bg-ink/5" : ""
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
    <div className="rounded-xl border-2 border-dashed border-ink/25 bg-card p-8 text-center sm:p-10">
      <p className="text-ink-soft">{title}</p>
      {description ? <p className="mt-1 text-sm text-ink-soft/70">{description}</p> : null}
    </div>
  );
}
