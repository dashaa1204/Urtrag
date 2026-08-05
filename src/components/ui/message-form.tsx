"use client";

import { useActionState } from "react";
import { sendMessage } from "@/lib/actions";
import { btnPrimary, FormError, inputCls } from "./form";
import type { ListingType } from "@/types";

interface MessageFormProps {
  conversationId?: number;
  listingType?: ListingType;
  listingId?: number;
  placeholder?: string;
}

export function MessageForm({ conversationId, listingType, listingId, placeholder }: MessageFormProps) {
  const [state, action, pending] = useActionState(sendMessage, undefined);

  return (
    <form action={action} className="flex flex-col gap-2">
      {conversationId ? <input type="hidden" name="conversation_id" value={conversationId} /> : null}
      {listingType ? <input type="hidden" name="listing_type" value={listingType} /> : null}
      {listingId ? <input type="hidden" name="listing_id" value={listingId} /> : null}
      <FormError message={state?.error} />
      <textarea
        name="body"
        rows={3}
        maxLength={2000}
        placeholder={placeholder ?? "Мессежээ бичнэ үү..."}
        defaultValue={state?.values?.body}
        className={inputCls}
        required
      />
      <button type="submit" disabled={pending} className={`${btnPrimary} self-end`}>
        {pending ? "Илгээж байна..." : "Илгээх"}
      </button>
    </form>
  );
}
