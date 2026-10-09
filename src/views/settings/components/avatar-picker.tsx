"use client";

import { useEffect, useRef, useState } from "react";
import { AVATAR_ACCEPT, AVATAR_FORMATS_LABEL } from "@/constant/avatar";
import { downscaleImage } from "@/lib/image";
import { Avatar, FieldError } from "@/components/ui";

/** Файлыг input дотор тавина — форм илгээхэд яг энэ файл явна. */
function setInputFile(input: HTMLInputElement, file: File | null): void {
  const transfer = new DataTransfer();
  if (file) transfer.items.add(file);
  input.files = transfer.files;
}

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
  const [picked, setPicked] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Сонголт солигдох бүрд өмнөх blob-ыг чөлөөлнө
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  // input дотор сонгосон файл нь бидний мэдэлгүй алга болж болно (жишээ нь dev
  // үеийн Fast Refresh element-ийг дахин үүсгэхэд). Тэр үед урьдчилан харагдац
  // нь үлддэг тул хэрэглэгч зурагтай мэт харагдаад чимээгүй зураггүй хадгалагдана.
  // Рендер бүрийн дараа шалгаж, дутуу бол буцааж тавина.
  useEffect(() => {
    const input = inputRef.current;
    if (input && picked && input.files?.length === 0) setInputFile(input, picked);
  });

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
          ref={inputRef}
          type="file"
          name="avatar"
          accept={AVATAR_ACCEPT}
          className="sr-only"
          onChange={async (event) => {
            const input = event.target;
            const file = input.files?.[0];
            if (!file) {
              setPicked(null);
              setPreview(null);
              return;
            }

            // Утасны зураг олон МБ байдаг тул илгээхийн өмнө багасгаад,
            // input дотор нь солино — форм жижигрүүлсэн файлыг нь явуулна.
            const small = await downscaleImage(file);
            if (small !== file) setInputFile(input, small);

            setPicked(small);
            setPreview(URL.createObjectURL(small));
            setRemove(false);
          }}
        />
      </label>

      <p className="text-xs text-ink-soft">
        {AVATAR_FORMATS_LABEL} — томыг нь автоматаар багасгана. Хоосон бол нэрийн эхний үсэг гарна.
      </p>

      {src ? (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            name="avatar_remove"
            checked={remove}
            onChange={(event) => {
              const checked = event.target.checked;
              setRemove(checked);
              // Устгахаар сонгосон бол сонгосон файлаа орхино — эс бөгөөс
              // server action нь устгахын оронд шинэ зургийг байршуулна.
              if (checked) {
                setPicked(null);
                setPreview(null);
                if (inputRef.current) setInputFile(inputRef.current, null);
              }
            }}
            className="size-4 cursor-pointer rounded border-ink/25 text-ink focus:ring-ink"
          />
          Зургийг устгах
        </label>
      ) : null}

      <FieldError message={error} />
    </div>
  );
}
