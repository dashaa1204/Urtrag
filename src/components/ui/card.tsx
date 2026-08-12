import type { ReactNode } from "react";

/**
 * Цагаан гадаргуут хайрцаг. Гарчигтай хувилбар нь форм/нэвтрэх хуудсуудад,
 * гарчиггүй нь дэлгэрэнгүй хуудасны блокуудад ашиглагдана.
 */
export function Card({
  title,
  description,
  headingAs: Heading = "h1",
  className = "",
  children,
}: {
  title?: string;
  description?: ReactNode;
  headingAs?: "h1" | "h2";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-xl border-2 border-ink/12 bg-card p-4 sm:p-6 ${className}`}>
      {title ? <Heading className="mb-1 text-xl font-bold text-ink">{title}</Heading> : null}
      {description ? <p className="mb-6 text-sm text-ink-soft">{description}</p> : null}
      {children}
    </section>
  );
}
