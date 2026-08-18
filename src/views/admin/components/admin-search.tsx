import { btnSecondary, btnSm, inputCls } from "@/components/ui";

/**
 * Энгийн GET форм — хайлт нь хаягт үлдэж, JS-гүйгээр ажиллана.
 *
 * Идэвхтэй шүүлтүүрийг нуугдмал талбараар хамт явуулна: хайхад таб, төлөв нь
 * үл мэдэг сэргээгдвэл хянагч юу хараад байгаагаа алдана. Хуудасны дугаарыг
 * харин ЗОРИУДААР авч явахгүй — шинэ хайлт үргэлж эхний хуудаснаас эхэлнэ.
 */
export function AdminSearch({
  action,
  value,
  placeholder,
  hidden = {},
}: {
  action: string;
  value: string;
  placeholder: string;
  hidden?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} method="get" className="flex gap-2">
      {Object.entries(hidden).map(([name, item]) =>
        item ? <input key={name} type="hidden" name={name} value={item} /> : null
      )}
      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${inputCls} sm:max-w-xs`}
      />
      <button type="submit" className={`${btnSecondary} ${btnSm} shrink-0`}>
        Хайх
      </button>
    </form>
  );
}
