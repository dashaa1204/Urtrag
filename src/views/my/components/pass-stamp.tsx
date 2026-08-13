/**
 * Тасалбар дээрх дугуй тамга. Аваагүй тамга нь бүдэг боловч харагдсаар байна —
 * дараа нь юу авч болохыг харуулах нь өөрөө урам болно.
 */
export function PassStamp({ label, title, earned }: { label: string; title: string; earned: boolean }) {
  return (
    <div
      title={title}
      className={`flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 text-center leading-tight ${
        earned ? "-rotate-6 border-stamp/50 text-stamp" : "border-ink/15 text-ink/25"
      }`}
    >
      <span className="text-[7px] uppercase tracking-[0.15em]">urtrag</span>
      <span className="mt-0.5 px-1 text-[9px] font-bold uppercase">{label}</span>
      <span className="sr-only">
        {title} — {earned ? "авсан" : "аваагүй"}
      </span>
    </div>
  );
}
