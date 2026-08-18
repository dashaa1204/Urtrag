"use client";

import { useEffect, useRef } from "react";
import type { Message, UserId } from "@/types";
import { Avatar, DayLabel, useIsClient } from "@/components/ui";
import { MessageBubble } from "./message-bubble";

/** Энэ хугацаанд багтсан дараалсан мессежийг нэг бүлэг болгоно. */
const GROUP_WINDOW = 5 * 60_000;

/** Доод ирмэгээс ийм зайд байвал "доод талд байна" гэж үзнэ (px). */
const STICK_THRESHOLD = 80;

function sameGroup(previous: Message | undefined, message: Message): boolean {
  if (!previous || previous.sender_id !== message.sender_id) return false;
  const gap = new Date(message.created_at).getTime() - new Date(previous.created_at).getTime();
  return gap < GROUP_WINDOW;
}

function sameDay(a: Date | string, b: Date | string): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return x.toDateString() === y.toDateString();
}

interface MessageListProps {
  messages: Message[];
  currentUserId: UserId;
  otherName: string;
  otherAvatar: string | null;
  otherTyping: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  otherName,
  otherAvatar,
  otherTyping,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  // Хэрэглэгч дээшээ гүйлгэж хуучин мессеж уншиж байвал доош нь татахгүй.
  const stick = useRef(true);
  // Өдрийн зааг үзэгчийн цагийн бүсээс хамаардаг тул зөвхөн клиент дээр.
  const isClient = useIsClient();

  useEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages.length, otherTyping]);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
  }

  // "Үзсэн" нь зөвхөн миний хамгийн сүүлийн мессеж дор гарна.
  const lastMineIndex = messages.findLastIndex((message) => message.sender_id === currentUserId);
  const seen = lastMineIndex >= 0 && messages[lastMineIndex].read_at !== null;

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="max-h-[60dvh] min-h-[18rem] overflow-y-auto px-3 py-2 sm:px-4"
    >
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const next = messages[index + 1];
        const newDay = isClient && (!previous || !sameDay(previous.created_at, message.created_at));
        const isFirstOfGroup = newDay || !sameGroup(previous, message);
        const isLastOfGroup = !next || !sameGroup(message, next);

        return (
          <div key={message.id}>
            {newDay ? (
              <p className="my-4 text-center text-xs font-medium text-ink-soft/70">
                <DayLabel iso={message.created_at} />
              </p>
            ) : null}
            <MessageBubble
              message={message}
              isMine={message.sender_id === currentUserId}
              isPending={message.id < 0}
              isFirstOfGroup={isFirstOfGroup}
              isLastOfGroup={isLastOfGroup}
              otherAvatar={otherAvatar}
              footer={seen && index === lastMineIndex ? "Үзсэн" : undefined}
            />
          </div>
        );
      })}

      {otherTyping ? (
        <div className="mt-3 flex items-end gap-2">
          <Avatar name={otherName} src={otherAvatar} size="sm" />
          <div className="flex gap-1 rounded-2xl bg-ink/8 px-4 py-3" aria-label={`${otherName} бичиж байна`}>
            <Dot delay="0ms" />
            <Dot delay="150ms" />
            <Dot delay="300ms" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/45"
      style={{ animationDelay: delay }}
      aria-hidden
    />
  );
}
