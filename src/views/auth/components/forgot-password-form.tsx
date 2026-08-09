"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions";
import { FormError, FormNotice, SubmitButton, TextField } from "@/components/ui";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  // Илгээсний дараа формыг харуулах шаардлагагүй
  if (state?.notice) {
    return <FormNotice message={state.notice} />;
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />

      <TextField
        label="Имэйл"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.values?.email}
        placeholder="tanii@mail.com"
        required
      />

      <SubmitButton pending={pending} pendingLabel="Илгээж байна...">
        Сэргээх холбоос илгээх
      </SubmitButton>
    </form>
  );
}
