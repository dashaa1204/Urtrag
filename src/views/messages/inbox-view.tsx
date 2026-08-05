import Link from "next/link";
import type { ConversationPreview } from "@/types";
import { LocalTime } from "@/components/ui";

export default function InboxView({ conversations }: { conversations: ConversationPreview[] }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Мессеж</h1>

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">Танд одоогоор мессеж алга байна.</p>
          <p className="mt-1 text-sm text-slate-400">
            Зар дээр орж “Холбогдох” хэсгээс харилцан яриа эхлүүлээрэй.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 transition last:border-b-0 hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
                {conversation.other_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm ${conversation.unread > 0 ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                    {conversation.other_name}
                    <span className="ml-2 text-xs font-normal text-slate-400">{conversation.listing_title}</span>
                  </p>
                  {conversation.last_at ? (
                    <span className="shrink-0 text-xs text-slate-400">
                      <LocalTime iso={conversation.last_at} />
                    </span>
                  ) : null}
                </div>
                <p className={`truncate text-sm ${conversation.unread > 0 ? "font-semibold text-slate-800" : "text-slate-500"}`}>
                  {conversation.last_body ?? ""}
                </p>
              </div>
              {conversation.unread > 0 ? (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white">
                  {conversation.unread}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
