"use client";

import { useActionState } from "react";
import { signup } from "@/lib/actions";
import { btnPrimary, FieldError, inputCls, labelCls } from "@/components/ui";

export function SignupForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div>
        <label htmlFor="name" className={labelCls}>
          Нэр
        </label>
        <input id="name" name="name" defaultValue={state?.values?.name} placeholder="Таны нэр" className={inputCls} required />
        <FieldError message={state?.fieldErrors?.name} />
      </div>

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
        <FieldError message={state?.fieldErrors?.email} />
      </div>

      <div>
        <label htmlFor="phone" className={labelCls}>
          Утас <span className="font-normal text-slate-400">(заавал биш)</span>
        </label>
        <input id="phone" name="phone" defaultValue={state?.values?.phone} placeholder="+43 ... эсвэл +976 ..." className={inputCls} />
      </div>

      <div>
        <label htmlFor="password" className={labelCls}>
          Нууц үг
        </label>
        <input id="password" name="password" type="password" placeholder="Дор хаяж 8 тэмдэгт" className={inputCls} required />
        <FieldError message={state?.fieldErrors?.password} />
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Бүртгэж байна..." : "Бүртгүүлэх"}
      </button>
    </form>
  );
}
