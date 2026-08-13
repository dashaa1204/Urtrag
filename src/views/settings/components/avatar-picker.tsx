"use client";

import { useEffect, useState } from "react";
import { AVATAR_ACCEPT, AVATAR_FORMATS_LABEL, MAX_AVATAR_LABEL } from "@/constant/avatar";
import { Avatar, FieldError } from "@/components/ui";

/**
 * Профайлын зураг сонгох. Сонгосон файлыг шууд урьдчилан харуулна —
 * blob URL нь next/image-д тохирохгүй тул энгийн img ашиглана.
 */
export function AvatarPicker({
  name,
  src,
  error,
}: {
  name: string;
  src: string | null;
  error?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);

  // Сонголт солигдох бүрд өмнөх blob-ыг чөлөөлнө
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const current = remove ? null : (preview ?? src);

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current}
          alt=""
          aria-hidden
          className="h-20 w-20 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <Avatar name={name} size="xl" shape="square" />
      )}

      <label className="cursor-pointer text-sm font-semibold text-stamp hover:underline">
        {src || preview ? "Зураг солих" : "Зураг оруулах"}
        <input
          type="file"
          name="avatar"
          accept={AVATAR_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
            if (file) setRemove(false);
          }}
        />
      </label>

      <p className="text-xs text-ink-soft/70">
        {AVATAR_FORMATS_LABEL} — {MAX_AVATAR_LABEL} хүртэл. Хоосон бол нэрийн эхний үсэг гарна.
      </p>

      {src ? (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            name="avatar_remove"
            checked={remove}
            onChange={(event) => setRemove(event.target.checked)}
            className="size-4 cursor-pointer rounded border-ink/25 text-ink focus:ring-ink"
          />
          Зургийг устгах
        </label>
      ) : null}

      <FieldError message={error} />
    </div>
  );
}
