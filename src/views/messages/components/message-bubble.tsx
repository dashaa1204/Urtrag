import type { Message } from "@/types";
import { Avatar, ClockTime } from "@/components/ui";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  /** Нэг хүний дараалсан мессежийн эхэн / төгсгөл. */
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
  /** Сервер рүү явж байгаа, хараахан хадгалагдаагүй мессеж. */
  isPending?: boolean;
  otherAvatar?: string | null;
  /** Бүлгийн сүүлчийн бөмбөлөг дор гарах тэмдэглэл ("Үзсэн"). */
  footer?: string;
}

/**
 * Нэг мессеж. Дараалсан мессежийг Messenger шиг нэг блок мэт харуулахын тулд
 * нийлсэн талын өнцгийг мохоож, цаг болон avatar-ыг зөвхөн бүлгийн сүүлд гаргана.
 */
export function MessageBubble({
  message,
  isMine,
  isFirstOfGroup,
  isLastOfGroup,
  isPending,
  otherAvatar,
  footer,
}: MessageBubbleProps) {
  const joinTop = isFirstOfGroup ? "" : isMine ? "rounded-tr-md" : "rounded-tl-md";
  const joinBottom = isLastOfGroup ? "" : isMine ? "rounded-br-md" : "rounded-bl-md";

  return (
    <div
      className={`flex flex-col ${isFirstOfGroup ? "mt-3" : "mt-0.5"} ${
        isMine ? "items-end" : "items-start"
      } ${isPending ? "opacity-60" : ""}`}
    >
      {/* Avatar нь бөмбөлгийн доод ирмэгтэй зэрэгцэнэ — цагийн мөр багананд
          орвол avatar түүн рүү татагдаж доошилдог тул мөрөөс гадуур байрлуулав. */}
      <div className="flex max-w-[78%] items-end gap-2">
        {isMine ? null : isLastOfGroup ? (
          <Avatar name={message.sender_name} src={otherAvatar} size="sm" />
        ) : (
          // Бүлгийн дунд мессежийг avatar-ын өргөнөөр зэрэгцүүлнэ
          <span className="h-8 w-8 shrink-0" aria-hidden />
        )}

        <div
          className={`rounded-2xl px-4 py-2 ${joinTop} ${joinBottom} ${
            isMine ? "bg-ink text-paper" : "bg-ink/8 text-ink"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
        </div>
      </div>

      {isLastOfGroup ? (
        <p className={`mt-1 px-1 text-[10px] text-ink-soft/70 ${isMine ? "" : "ml-10"}`}>
          <ClockTime iso={message.created_at} />
          {footer ? ` · ${footer}` : ""}
        </p>
      ) : null}
    </div>
  );
}
