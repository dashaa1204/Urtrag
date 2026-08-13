import type { ConversationPreview } from "@/types";
import { avatarUrl } from "@/lib/avatar";
import { Avatar, CountBadge, EmptyState, LocalTime, PageContainer, PageHeader, Panel, PanelRow } from "@/components/ui";

export default function InboxView({ conversations }: { conversations: ConversationPreview[] }) {
  return (
    <PageContainer width="reading">
      <PageHeader title="Мессеж" />

      {conversations.length === 0 ? (
        <EmptyState
          title="Танд одоогоор мессеж алга байна."
          description="Зар дээр орж “Холбогдох” хэсгээс харилцан яриа эхлүүлээрэй."
        />
      ) : (
        <Panel>
          {conversations.map((conversation) => (
            <PanelRow
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="flex items-center gap-3"
            >
              <Avatar name={conversation.other_name} src={avatarUrl(conversation.other_avatar)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`truncate text-sm ${
                      conversation.unread > 0 ? "font-bold text-ink" : "font-medium text-ink"
                    }`}
                  >
                    {conversation.other_name}
                    <span className="ml-2 text-xs font-normal text-ink-soft/70">
                      {conversation.listing_title}
                    </span>
                  </p>
                  {conversation.last_at ? (
                    <span className="shrink-0 text-xs text-ink-soft/70">
                      <LocalTime iso={conversation.last_at} />
                    </span>
                  ) : null}
                </div>
                <p
                  className={`truncate text-sm ${
                    conversation.unread > 0 ? "font-semibold text-ink" : "text-ink-soft"
                  }`}
                >
                  {conversation.last_body ?? ""}
                </p>
              </div>
              <CountBadge count={conversation.unread} tone="indigo" />
            </PanelRow>
          ))}
        </Panel>
      )}
    </PageContainer>
  );
}
