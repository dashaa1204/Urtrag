import type { ReactNode } from "react";

const widthCls = {
  form: "max-w-md", // нэвтрэх / бүртгүүлэх
  narrow: "max-w-xl", // зар нэмэх, засах
  reading: "max-w-2xl", // дэлгэрэнгүй, харилцан яриа
  list: "max-w-3xl", // миний зар, профайл
  wide: "max-w-5xl", // жагсаалт, нүүр
};

/** Бүх хуудасны нэг төрлийн гадаргуу: голлуулах өргөн + талын зай. */
export function PageContainer({
  width = "wide",
  roomy = false,
  children,
}: {
  width?: keyof typeof widthCls;
  /** Нэвтрэх зэрэг богино хуудсанд илүү өндөр дээд зай өгнө. */
  roomy?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full ${widthCls[width]} px-4 ${roomy ? "py-12" : "py-8"}`}>{children}</div>
  );
}

/** Хуудасны толгой: гарчиг + тайлбар, баруун талд нь үйлдлийн товч. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Хуудас доторх хэсгийн толгой. Нүүр хуудсанд том хувилбарыг нь ашиглана. */
export function SectionHeader({
  title,
  action,
  size = "sm",
}: {
  title: string;
  action?: ReactNode;
  size?: "sm" | "lg";
}) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 ${size === "lg" ? "mb-4" : "mb-3"}`}>
      <h2 className={size === "lg" ? "text-xl font-bold text-ink" : "font-semibold text-ink"}>
        {title}
      </h2>
      {action}
    </div>
  );
}
