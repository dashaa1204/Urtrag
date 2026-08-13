"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Conversation, Message, Review, UserId } from "@/types";
import { useOnlineUsers } from "@/components/layout/presence-provider";
import { Avatar, Card, MessageForm, PageContainer, Panel } from "@/components/ui";
import { DealBox, MessageList, ReviewBox, useConversationChannel } from "./components";

interface ConversationViewProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: UserId;
  otherId: UserId;
  otherName: string;
  otherAvatar: string | null;
  listingTitle: string;
  listingHref: string;
  /** Яриа эхлүүлэгчийн хос зар — хэний зар болохыг label дээр бичнэ. */
  match: { label: string; title: string; href: string } | null;
  canReview: boolean;
  ownReview: Review | null;
  hadUnread: boolean;
}

export default function ConversationView({
  conversation,
  messages,
  currentUserId,
  otherId,
  otherName,
  otherAvatar,
  listingTitle,
  listingHref,
  match,
  canReview,
  ownReview,
  hadUnread,
}: ConversationViewProps) {
  const router = useRouter();
  const { otherTyping, notifyTyping } = useConversationChannel(conversation.id, currentUserId, otherId);
  const otherOnline = useOnlineUsers().has(otherId);

  // Хуудсыг render хийхэд сервер тал мессежийг уншсанд тооцдог. Гэвч уншаагүйн
  // тоолуур navbar дээр буюу layout дотор байдаг бөгөөд Next нь шилжилтийн үед
  // layout-ыг дахин render хийдэггүй тул нэг удаа refresh дуудаж тэгшитгэнэ.
  useEffect(() => {
    if (hadUnread) router.refresh();
  }, [hadUnread, router]);

  return (
    <PageContainer width="reading">
      <Link href="/messages" className="text-sm text-ink-soft hover:text-ink">
        ← Бүх мессеж
      </Link>

      <Panel className="mt-2">
        <div className="flex items-center gap-3 border-b-2 border-ink/10 px-4 py-3">
          <Avatar name={otherName} src={otherAvatar} online={otherOnline} />
          <div className="min-w-0 flex-1">
            <Link href={`/users/${otherId}`} className="block truncate font-bold text-ink hover:underline">
              {otherName}
            </Link>
            <p className="truncate text-xs text-ink-soft/80">
              {otherTyping ? "бичиж байна..." : otherOnline ? "Одоо идэвхтэй" : listingTitle}
            </p>
          </div>
          <Link
            href={listingHref}
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          >
            Зар →
          </Link>
        </div>

        {match ? (
          <Link
            href={match.href}
            className="flex items-center gap-2 border-b-2 border-ink/10 px-4 py-2 text-xs text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          >
            <span className="shrink-0 font-semibold">{match.label}:</span>
            <span className="min-w-0 truncate">{match.title}</span>
          </Link>
        ) : null}

        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          otherName={otherName}
          otherAvatar={otherAvatar}
          otherTyping={otherTyping}
        />

        <div className="border-t-2 border-ink/10 p-3 sm:p-4">
          <MessageForm
            conversationId={conversation.id}
            placeholder="Хариу бичих..."
            onTyping={notifyTyping}
          />
        </div>
      </Panel>

      <Card className="mt-6">
        <h2 className="mb-3 font-semibold text-ink">Тохиролцоо</h2>
        <DealBox
          conversationId={conversation.id}
          status={conversation.deal_status}
          isOwner={conversation.owner_id === currentUserId}
          otherName={otherName}
          hasMatch={conversation.matched_listing_id !== null}
        />
      </Card>

      {canReview ? (
        <Card className="mt-6">
          <h2 className="mb-3 font-semibold text-ink">Үнэлгээ</h2>
          <ReviewBox conversationId={conversation.id} otherName={otherName} existing={ownReview} />
        </Card>
      ) : null}
    </PageContainer>
  );
}
