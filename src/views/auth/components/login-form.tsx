"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";
import { btnPrimary, FormError, inputCls, labelCls } from "@/components/ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <FormError message={state?.error} />

      <div>
        <label htmlFor="email" className={labelCls}>
          Имэйл
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={state?.values?.email}
          placeholder="tanii@mail.com"
          className={inputCls}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className={labelCls}>
          Нууц үг
        </label>
        <input id="password" name="password" type="password" className={inputCls} required />
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Нэвтэрч байна..." : "Нэвтрэх"}
      </button>
    </form>
  );
}
