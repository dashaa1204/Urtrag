import type { Message } from "@/types";
import { LocalTime } from "@/components/ui";

/** Харилцан ярианы нэг мессеж. */
export function MessageBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 sm:max-w-[80%] ${
          isMine ? "rounded-br-md bg-ink text-paper" : "rounded-bl-md bg-ink/8 text-ink"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
        <p className={`mt-1 text-right text-[10px] ${isMine ? "text-paper/60" : "text-ink-soft/70"}`}>
          <LocalTime iso={message.created_at} />
        </p>
      </div>
    </div>
  );
}
