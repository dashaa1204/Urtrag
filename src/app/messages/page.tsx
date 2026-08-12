import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listConversations } from "@/lib/data";
import InboxView from "@/views/messages/inbox-view";

export const metadata: Metadata = { title: "Мессеж", robots: { index: false, follow: false }, };

export default async function MessagesPage() {
  const user = await requireUser("/messages");
  return <InboxView conversations={await listConversations(user.id)} />;
}
