"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";
import { FormError, SubmitButton, TextField } from "@/components/ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

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

      <TextField label="Нууц үг" name="password" type="password" autoComplete="current-password" required />

      <SubmitButton pending={pending} pendingLabel="Нэвтэрч байна...">
        Нэвтрэх
      </SubmitButton>
    </form>
  );
}
