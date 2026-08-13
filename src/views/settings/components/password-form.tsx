"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/actions";
import { FormError, FormNotice, SubmitButton, TextField } from "@/components/ui";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormNotice message={state?.notice} />
      <FormError message={state?.error} />

      <TextField
        label="Одоогийн нууц үг"
        name="current_password"
        type="password"
        autoComplete="current-password"
        error={state?.fieldErrors?.current_password}
        required
      />

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

      <SubmitButton pending={pending} className="self-start">
        Нууц үг солих
      </SubmitButton>
    </form>
  );
}
