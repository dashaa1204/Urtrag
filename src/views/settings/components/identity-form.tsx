"use client";

import { useActionState } from "react";
import { submitVerification } from "@/lib/actions";
import {
  DOC_FORMATS_LABEL,
  MAX_DOC_LABEL,
  RETENTION_NOTE,
} from "@/constant/verification";
import { FormError, FormNotice, SubmitButton, TextField } from "@/components/ui";
import { FileDropField } from "./file-drop-field";

const sizeHint = `${DOC_FORMATS_LABEL} — ${MAX_DOC_LABEL} хүртэл`;

export function IdentityForm({ resubmit }: { resubmit: boolean }) {
  const [state, action, pending] = useActionState(submitVerification, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormNotice message={state?.notice} />
      <FormError message={state?.error} />

      <FileDropField
        name="front"
        label="Баримтын нүүр тал"
        prompt="Дарж эсвэл чирж оруулна уу"
        hint={`Иргэний үнэмлэх, гадаад паспорт эсвэл жолооны үнэмлэх. ${sizeHint}`}
        error={state?.fieldErrors?.front}
      />

      <FileDropField
        name="back"
        label="Баримтын ар тал"
        optional
        prompt="Дарж эсвэл чирж оруулна уу"
        hint={`Иргэний болон жолооны үнэмлэхэд санал болгоно. ${sizeHint}`}
        error={state?.fieldErrors?.back}
      />

      <TextField
        label="Сошиал хаяг"
        optional
        name="social_url"
        type="url"
        inputMode="url"
        defaultValue={state?.values?.social_url}
        placeholder="https://facebook.com/..."
        hint="Нээлттэй профайл байвал таныг таних, шалгах хугацаа богиносно."
        error={state?.fieldErrors?.social_url}
      />

      <p className="rounded-lg bg-ink/5 px-3 py-2 text-xs text-ink-soft">{RETENTION_NOTE}</p>

      <SubmitButton pending={pending} pendingLabel="Илгээж байна..." className="self-start">
        {resubmit ? "Дахин илгээх" : "Хүсэлт илгээх"}
      </SubmitButton>
    </form>
  );
}
