import Link from "next/link";
import type { Conversation, Message, Review, UserId } from "@/types";
import { btnSecondary, btnSm, Card, MessageForm, PageContainer } from "@/components/ui";
import { MessageBubble, ReviewBox } from "./components";

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
    <PageContainer width="reading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/messages" className="text-sm text-slate-500 hover:text-slate-700">
            ← Бүх мессеж
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{otherName}</h1>
        </div>
        <Link href={listingHref} className={`${btnSecondary} ${btnSm} max-w-full`}>
          <span className="min-w-0 truncate">{listingTitle} →</span>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={message.sender_id === currentUserId}
            />
          ))}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <MessageForm conversationId={conversation.id} placeholder="Хариу бичих..." />
        </div>
      </Card>

      {canReview ? (
        <Card className="mt-6">
          <h2 className="mb-3 font-semibold text-slate-900">Үнэлгээ</h2>
          <ReviewBox conversationId={conversation.id} otherName={otherName} existing={ownReview} />
        </Card>
      ) : null}
    </PageContainer>
  );
}
