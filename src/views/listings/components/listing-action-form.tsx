"use client";

import type { ReactNode } from "react";
import type { ListingType } from "@/types";

/**
 * Зар дээр нэг үйлдэл (хаах / дахин нээх / устгах) хийх жижиг форм.
 * Server action-ыг prop-оор хүлээж авдаг тул дуудаж буй тал үйлдлээ сонгоно.
 */
export function ListingActionForm({
  action,
  type,
  id,
  className,
  confirmMessage,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  type: ListingType;
  id: number;
  className: string;
  /** Өгвөл илгээхээс өмнө баталгаажуулна. */
  confirmMessage?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (confirmMessage && !confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
