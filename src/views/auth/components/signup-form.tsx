"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/lib/actions";
import { FieldError, FormError, FormNotice, SubmitButton, TextField } from "@/components/ui";

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

      <TextField
        label="Нэр"
        name="name"
        defaultValue={state?.values?.name}
        placeholder="Таны нэр"
        error={state?.fieldErrors?.name}
        required
      />

      <TextField
        label="Имэйл"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.values?.email}
        placeholder="tanii@mail.com"
        error={state?.fieldErrors?.email}
        required
      />

      <TextField
        label="Утас"
        optional
        name="phone"
        defaultValue={state?.values?.phone}
        placeholder="+43 ... эсвэл +976 ..."
      />

      <TextField
        label="Нууц үг"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Дор хаяж 8 тэмдэгт"
        error={state?.fieldErrors?.password}
        required
      />

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

      <SubmitButton pending={pending} pendingLabel="Бүртгэж байна...">
        Бүртгүүлэх
      </SubmitButton>
    </form>
  );
}
