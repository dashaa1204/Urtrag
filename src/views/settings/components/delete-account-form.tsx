"use client";

import { useActionState, useState } from "react";
import { deleteAccount } from "@/lib/actions";
import { DELETE_CONFIRM_WORD } from "@/constant/settings";
import { btnDanger, FormError, TextField } from "@/components/ui";

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  const [confirm, setConfirm] = useState("");

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />

      <TextField
        label={`Баталгаажуулахын тулд "${DELETE_CONFIRM_WORD}" гэж бичнэ үү`}
        name="confirm"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        autoComplete="off"
        placeholder={DELETE_CONFIRM_WORD}
      />

      <button
        type="submit"
        disabled={pending || confirm.trim() !== DELETE_CONFIRM_WORD}
        className={`${btnDanger} self-start`}
      >
        {pending ? "Устгаж байна..." : "Бүртгэлээ бүр мөсөн устгах"}
      </button>
    </form>
  );
}
