"use client";

import { useState } from "react";
import { DOC_ACCEPT } from "@/constant/verification";
import { FieldError, labelCls, UploadIcon } from "@/components/ui";

/**
 * Файл сонгох талбар. input нь хайрцгийг бүтэн бүрхэж (opacity-0) байрлах тул
 * дарах, чирж хаях хоёул браузерын өөрийнх нь механизмаар ажиллана.
 */
export function FileDropField({
  name,
  label,
  optional,
  prompt,
  hint,
  error,
}: {
  name: string;
  label: string;
  optional?: boolean;
  prompt: string;
  hint: string;
  error?: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label} {optional ? <span className="font-normal text-ink-soft/70">(заавал биш)</span> : null}
      </label>

      <div className="relative rounded-xl border-2 border-dashed border-ink/25 bg-card px-4 py-8 text-center transition hover:border-ink/45">
        <input
          id={name}
          name={name}
          type="file"
          accept={DOC_ACCEPT}
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <UploadIcon className="mx-auto h-6 w-6 text-ink-soft/60" />
        <p className="mt-2 text-sm font-semibold text-ink">{fileName ?? prompt}</p>
        <p className="mt-0.5 text-xs text-ink-soft/70">{hint}</p>
      </div>

      <FieldError message={error} />
    </div>
  );
}
