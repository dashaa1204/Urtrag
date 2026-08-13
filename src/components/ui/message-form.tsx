"use client";

import {
  useActionState,
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { sendMessage } from "@/lib/actions";
import { FormError } from "./form";
import { SendIcon } from "./icons";
import type { ListingType } from "@/types";

interface MessageFormProps {
  conversationId?: number;
  listingType?: ListingType;
  listingId?: number;
  placeholder?: string;
  /** Товшилт бүрт дуудагдана — нөгөө талд "бичиж байна" гэж мэдэгдэхэд. */
  onTyping?: () => void;
  /** Бичих талбарын дээр орох нэмэлт талбар (хос зарын сонголт). */
  children?: ReactNode;
}

/**
 * Хуруугаар бичдэг төхөөрөмж дээр Enter нь мөр таслах цорын ганц арга тул тэнд
 * илгээхгүй. Доорх сануулга ч мөн ижил нөхцөлөөр (pointer-fine) харагдана.
 */
const ENTER_SENDS = "(pointer: fine)";

/** Хэдэн мөр болтол өсөхийг зөвшөөрөх (px). Цаашид дотроо гүйнэ. */
const MAX_HEIGHT = 160;

function grow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
}

export function MessageForm({
  conversationId,
  listingType,
  listingId,
  placeholder,
  onTyping,
  children,
}: MessageFormProps) {
  const [state, action, pending] = useActionState(sendMessage, undefined);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const wasPending = useRef(false);

  // Илгээж дуусахад React формыг цэвэрлэдэг ч textarea-гийн өндөр хэвээрээ
  // үлддэг тул дахин тооцоолж, курсорыг буцаана.
  useEffect(() => {
    if (wasPending.current && !pending && boxRef.current) {
      grow(boxRef.current);
      boxRef.current.focus();
    }
    wasPending.current = pending;
  }, [pending]);

  function handleInput(event: FormEvent<HTMLTextAreaElement>) {
    grow(event.currentTarget);
    onTyping?.();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (pending || event.key !== "Enter" || event.shiftKey) return;
    // IME-ээр үг сонгож байхад Enter нь сонголтоо баталгаажуулах товч.
    if (event.nativeEvent.isComposing) return;
    if (!window.matchMedia(ENTER_SENDS).matches) return;

    event.preventDefault();
    // submit() биш requestSubmit(): required гэх мэт шалгалтыг алгасахгүй.
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      {conversationId ? <input type="hidden" name="conversation_id" value={conversationId} /> : null}
      {listingType ? <input type="hidden" name="listing_type" value={listingType} /> : null}
      {listingId ? <input type="hidden" name="listing_id" value={listingId} /> : null}
      <FormError message={state?.error} />
      {children}

      <div className="flex items-end gap-2 rounded-2xl border-2 border-ink/15 bg-card px-3 py-1.5 transition focus-within:border-ink/60">
        <textarea
          ref={boxRef}
          name="body"
          rows={1}
          maxLength={2000}
          placeholder={placeholder ?? "Мессежээ бичнэ үү..."}
          defaultValue={state?.values?.body}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-base text-ink outline-none placeholder:text-ink-soft/60 sm:text-sm"
          required
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Илгээх"
          className="mb-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink text-paper transition hover:bg-ink/88 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50"
        >
          <SendIcon />
        </button>
      </div>

      <p className="hidden text-right text-xs text-ink-soft/70 pointer-fine:block">
        Enter — илгээх, Shift+Enter — мөр таслах
      </p>
    </form>
  );
}
