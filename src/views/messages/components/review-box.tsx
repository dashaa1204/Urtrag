"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/lib/actions";
import { btnPrimary, FormError, inputCls } from "@/components/ui";
import type { Review } from "@/types";

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

      <p className="text-sm text-slate-600">
        {existing ? `Та ${otherName}-д үнэлгээ өгсөн. Дахин илгээвэл шинэчлэгдэнэ.` : `${otherName}-тай хийсэн ажлаа үнэлээрэй.`}
      </p>

      <FormError message={state?.error} />
      {state?.success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Үнэлгээ хадгалагдлаа. Баярлалаа!</p>
      ) : null}

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} од`}
            className={`cursor-pointer text-2xl transition ${n <= rating ? "text-amber-500" : "text-slate-300 hover:text-amber-300"}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        rows={2}
        maxLength={1000}
        placeholder="Сэтгэгдэл (заавал биш)"
        defaultValue={state?.values?.comment ?? existing?.comment ?? ""}
        className={inputCls}
      />

      <button type="submit" disabled={pending || rating === 0} className={`${btnPrimary} self-start`}>
        {pending ? "Хадгалж байна..." : existing ? "Үнэлгээ шинэчлэх" : "Үнэлгээ өгөх"}
      </button>
    </form>
  );
}
