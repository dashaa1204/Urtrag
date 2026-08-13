import type { ConversationPreview, UserId } from "@/types";
import { PageContainer, PageHeader } from "@/components/ui";
import { ConversationList } from "./components";

export default function InboxView({
  conversations,
  currentUserId,
}: {
  conversations: ConversationPreview[];
  currentUserId: UserId;
}) {
  return (
    <PageContainer width="reading">
      <PageHeader title="Мессеж" />
      <ConversationList conversations={conversations} currentUserId={currentUserId} />
    </PageContainer>
  );
}
