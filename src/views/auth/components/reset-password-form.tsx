"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/actions";
import { FormError, SubmitButton, TextField } from "@/components/ui";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />

      <TextField
        label="Шинэ нууц үг"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Дор хаяж 8 тэмдэгт"
        error={state?.fieldErrors?.password}
        required
      />

      <TextField
        label="Шинэ нууц үг (давтах)"
        name="password_confirm"
        type="password"
        autoComplete="new-password"
        error={state?.fieldErrors?.password_confirm}
        required
      />

      <SubmitButton pending={pending}>Нууц үг солих</SubmitButton>
    </form>
  );
}
