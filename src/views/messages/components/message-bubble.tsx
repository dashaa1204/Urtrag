import type { Message } from "@/types";
import { LocalTime } from "@/components/ui";

/** Харилцан ярианы нэг мессеж. */
export function MessageBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 sm:max-w-[80%] ${
          isMine ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md bg-slate-100 text-slate-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
        <p className={`mt-1 text-right text-[10px] ${isMine ? "text-indigo-200" : "text-slate-400"}`}>
          <LocalTime iso={message.created_at} />
        </p>
      </div>
    </div>
  );
}
