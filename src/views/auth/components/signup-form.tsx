"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/lib/actions";
import { FieldError, FormError, FormNotice, PhoneField, SubmitButton, TextField } from "@/components/ui";

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

      <PhoneField
        code={state?.values?.phone_code}
        number={state?.values?.phone}
        error={state?.fieldErrors?.phone}
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
        <label htmlFor="terms" className="flex cursor-pointer items-start gap-2 text-sm text-ink-soft">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            defaultChecked={state?.values?.terms === "on"}
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-ink/25 text-ink focus:ring-ink"
          />
          <span>
            Би{" "}
            <Link href="/disclaimer" target="_blank" className="font-semibold text-stamp hover:underline">
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
