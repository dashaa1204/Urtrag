"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/lib/actions";
import { FormError, inputCls, SubmitButton } from "@/components/ui";
import type { Review } from "@/types";
import { StarRating } from "./star-rating";

export function ReviewBox({
  conversationId,
  otherName,
  existing,
}: {
  conversationId: number;
  otherName: string;
  existing: Review | null;
}) {
  const [state, action, pending] = useActionState(submitReview, undefined);
  const [rating, setRating] = useState(existing?.rating ?? 0);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="conversation_id" value={conversationId} />
      <input type="hidden" name="rating" value={rating} />

      <p className="text-sm text-ink-soft">
        {existing
          ? `Та ${otherName}-д үнэлгээ өгсөн. Дахин илгээвэл шинэчлэгдэнэ.`
          : `${otherName}-тай хийсэн ажлаа үнэлээрэй.`}
      </p>

      <FormError message={state?.error} />
      {state?.success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Үнэлгээ хадгалагдлаа. Баярлалаа!
        </p>
      ) : null}

      <StarRating value={rating} onChange={setRating} />

      <textarea
        name="comment"
        rows={2}
        maxLength={1000}
        placeholder="Сэтгэгдэл (заавал биш)"
        defaultValue={state?.values?.comment ?? existing?.comment ?? ""}
        className={inputCls}
      />

      <SubmitButton pending={pending} disabled={rating === 0} className="self-start">
        {existing ? "Үнэлгээ шинэчлэх" : "Үнэлгээ өгөх"}
      </SubmitButton>
    </form>
  );
}
