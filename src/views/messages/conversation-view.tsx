import Link from "next/link";
import type { Conversation, Message, Review, UserId } from "@/types";
import { LocalTime, MessageForm } from "@/components/ui";
import { ReviewBox } from "./components";

interface ConversationViewProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: UserId;
  otherName: string;
  listingTitle: string;
  listingHref: string;
  canReview: boolean;
  ownReview: Review | null;
}

export default function ConversationView({
  conversation,
  messages,
  currentUserId,
  otherName,
  listingTitle,
  listingHref,
  canReview,
  ownReview,
}: ConversationViewProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/messages" className="text-sm text-slate-500 hover:text-slate-700">
            ← Бүх мессеж
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{otherName}</h1>
        </div>
        <Link
          href={listingHref}
          className="max-w-full truncate rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          {listingTitle} →
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          {messages.map((message) => {
            const isMine = message.sender_id === currentUserId;
            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
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
          })}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <MessageForm conversationId={conversation.id} placeholder="Хариу бичих..." />
        </div>
      </div>

      {canReview ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-3 font-semibold text-slate-900">Үнэлгээ</h2>
          <ReviewBox conversationId={conversation.id} otherName={otherName} existing={ownReview} />
        </div>
      ) : null}
    </div>
  );
}
