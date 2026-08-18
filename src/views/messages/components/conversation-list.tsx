"use client";

import { useState } from "react";
import type { ConversationPreview, UserId } from "@/types";
import { avatarUrl } from "@/lib/avatar";
import { useOnlineUsers } from "@/components/layout/presence-provider";
import {
  Avatar,
  EmptyState,
  Panel,
  PanelRow,
  RelativeTime,
  SearchIcon,
  inputCls,
} from "@/components/ui";

type Filter = "all" | "unread";

const TABS: { id: Filter; label: string }[] = [
  { id: "all", label: "Бүгд" },
  { id: "unread", label: "Уншаагүй" },
];

function otherId(conversation: ConversationPreview, me: UserId): UserId {
  return conversation.starter_id === me ? conversation.owner_id : conversation.starter_id;
}

function matches(conversation: ConversationPreview, query: string): boolean {
  const haystack = `${conversation.other_name} ${conversation.listing_title} ${conversation.last_body ?? ""}`;
  return haystack.toLowerCase().includes(query);
}

export function ConversationList({
  conversations,
  currentUserId,
}: {
  conversations: ConversationPreview[];
  currentUserId: UserId;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const online = useOnlineUsers();

  const needle = query.trim().toLowerCase();
  const visible = conversations.filter(
    (conversation) =>
      (filter === "all" || conversation.unread > 0) && (!needle || matches(conversation, needle))
  );
  const unreadTotal = conversations.filter((conversation) => conversation.unread > 0).length;

  return (
    <>
      <div className="relative mb-3">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Мессежээс хайх"
          aria-label="Мессежээс хайх"
          className={`${inputCls} pl-9`}
        />
      </div>

      <div className="mb-4 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            aria-pressed={filter === tab.id}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === tab.id
                ? "bg-ink text-paper"
                : "border-2 border-ink/15 text-ink-soft hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {tab.label}
            {tab.id === "unread" && unreadTotal > 0 ? ` (${unreadTotal})` : ""}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={
            needle || filter === "unread"
              ? "Тохирох харилцан яриа олдсонгүй."
              : "Танд одоогоор мессеж алга байна."
          }
          description={
            needle || filter === "unread"
              ? undefined
              : "Зар дээр орж “Холбогдох” хэсгээс харилцан яриа эхлүүлээрэй."
          }
        />
      ) : (
        <Panel>
          {visible.map((conversation) => (
            <PanelRow
              key={conversation.id}
              href={conversation.href}
              className="flex items-center gap-3"
            >
              <Avatar
                name={conversation.other_name}
                src={avatarUrl(conversation.other_avatar)}
                online={online.has(otherId(conversation, currentUserId))}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={`truncate text-sm text-ink ${
                      conversation.unread > 0 ? "font-bold" : "font-medium"
                    }`}
                  >
                    {conversation.other_name}
                    <span className="ml-2 text-xs font-normal text-ink-soft/70">
                      {conversation.listing_title}
                    </span>
                  </p>
                  {conversation.last_at ? (
                    <span className="shrink-0 text-xs text-ink-soft/70">
                      <RelativeTime iso={conversation.last_at} />
                    </span>
                  ) : null}
                </div>

                <p
                  className={`truncate text-sm ${
                    conversation.unread > 0 ? "font-semibold text-ink" : "text-ink-soft"
                  }`}
                >
                  {conversation.last_sender_id === currentUserId ? "Та: " : ""}
                  {conversation.last_body ?? ""}
                </p>
              </div>

              {conversation.unread > 0 ? (
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" aria-label="Уншаагүй" />
              ) : null}
            </PanelRow>
          ))}
        </Panel>
      )}
    </>
  );
}
