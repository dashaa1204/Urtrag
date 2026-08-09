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
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}>
      {title ? <Heading className="mb-1 text-xl font-bold text-slate-900">{title}</Heading> : null}
      {description ? <p className="mb-6 text-sm text-slate-500">{description}</p> : null}
      {children}
    </section>
  );
}
