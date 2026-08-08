"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/lib/actions";
import { btnPrimary, FieldError, FormError, FormNotice, inputCls, labelCls } from "@/components/ui";

export function SignupForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signup, undefined);

  // Имэйл баталгаажуулах шаардлагатай үед формыг дахин үзүүлэх шаардлагагүй
  if (state?.notice) {
    return <FormNotice message={state.notice} />;
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <FormError message={state?.error} />

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

      <div>
        <label htmlFor="terms" className="flex cursor-pointer items-start gap-2 text-sm text-slate-600">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            defaultChecked={state?.values?.terms === "on"}
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            Би{" "}
            <Link href="/disclaimer" target="_blank" className="font-semibold text-indigo-600 hover:underline">
              хариуцлагын тайлбарыг
            </Link>{" "}
            уншиж танилцан, хүлээн зөвшөөрч байна.
          </span>
        </label>
        <FieldError message={state?.fieldErrors?.terms} />
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Бүртгэж байна..." : "Бүртгүүлэх"}
      </button>
    </form>
  );
}
