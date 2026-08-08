"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/actions";
import { btnPrimary, FieldError, FormError, inputCls, labelCls } from "@/components/ui";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />

      <div>
        <label htmlFor="password" className={labelCls}>
          Шинэ нууц үг
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Дор хаяж 8 тэмдэгт"
          className={inputCls}
          required
        />
        <FieldError message={state?.fieldErrors?.password} />
      </div>

      <div>
        <label htmlFor="password_confirm" className={labelCls}>
          Шинэ нууц үг (давтах)
        </label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          autoComplete="new-password"
          className={inputCls}
          required
        />
        <FieldError message={state?.fieldErrors?.password_confirm} />
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Хадгалж байна..." : "Нууц үг солих"}
      </button>
    </form>
  );
}
