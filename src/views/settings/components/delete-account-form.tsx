"use client";

import { useActionState, useState } from "react";
import { deleteAccount } from "@/lib/actions";
import { btnDanger, FormError } from "@/components/ui";

/**
 * Санамсаргүй дарахаас checkbox хамгаална. Тусгай үг бичүүлэх нь кирилл гаргүй
 * (эсвэл монгол фонтгүй) төхөөрөмж дээр хэрэглэгчийг гацаадаг байсан.
 */
export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />

      <label htmlFor="confirm" className="flex cursor-pointer items-start gap-2 text-sm text-ink-soft">
        <input
          id="confirm"
          name="confirm"
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-ink/25 text-ink focus:ring-ink"
        />
        <span>Би ойлгож байна. Бүртгэлээ устгасны дараа сэргээх боломжгүй.</span>
      </label>

      <button type="submit" disabled={pending || !confirmed} className={`${btnDanger} self-start`}>
        {pending ? "Устгаж байна..." : "Бүртгэлээ устгах"}
      </button>
    </form>
  );
}
