"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions";
import { btnPrimary, FormError, FormNotice, inputCls, labelCls } from "@/components/ui";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  // Илгээсний дараа формыг харуулах шаардлагагүй
  if (state?.notice) {
    return <FormNotice message={state.notice} />;
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />

      <div>
        <label htmlFor="email" className={labelCls}>
          Имэйл
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          placeholder="tanii@mail.com"
          className={inputCls}
          required
        />
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Илгээж байна..." : "Сэргээх холбоос илгээх"}
      </button>
    </form>
  );
}
