"use client";

import { useActionState } from "react";
import { decideDeal } from "@/lib/actions";
import { btnPrimary, btnSecondary, FormError } from "@/components/ui";
import type { DealStatus } from "@/types";

/**
 * Хүсэлтийн шийдвэр. Зарын эзэн тохирох эсвэл татгалзах, тохирсны дараа
 * хоёр тал хоёулаа цуцлах боломжтой.
 *
 * Тохирсон үед хоёр зар хоёулаа "эзэнтэй" болно — өөр хүнтэй давхар
 * тохирохгүй. Цуцлангуут хоёулаа дахин сул болно.
 */
export function DealBox({
  conversationId,
  status,
  isOwner,
  otherName,
  hasMatch,
}: {
  conversationId: number;
  status: DealStatus;
  /** Үзэгч нь зарын эзэн үү (тохирох эрх зөвхөн түүнд). */
  isOwner: boolean;
  otherName: string;
  /** Хос зар сонгогдсон эсэх — хуучин яриануудад байхгүй. */
  hasMatch: boolean;
}) {
  const [state, action, pending] = useActionState(decideDeal, undefined);

  const text =
    status === "accepted"
      ? `Та ${otherName}-тай тохирсон. Хоёр зар хоёулаа өөр хүнтэй давхар тохирохгүй.`
      : status === "cancelled"
        ? "Энэ хүсэлт цуцлагдсан. Хоёр зар хоёулаа дахин сул боллоо."
        : isOwner
          ? `${otherName} таны зарыг сонгож хүсэлт илгээсэн байна.`
          : `${otherName} хариу өгөхийг хүлээж байна.`;

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="conversation_id" value={conversationId} />

      <p className="text-sm text-ink-soft">{text}</p>
      <FormError message={state?.error} />

      <div className="flex flex-wrap gap-2">
        {status === "accepted" ? (
          <button
            type="submit"
            name="decision"
            value="cancelled"
            disabled={pending}
            className={btnSecondary}
            onClick={(event) => {
              if (!confirm("Тохиролцоог цуцлах уу? Хоёр зар хоёулаа дахин сул болно.")) {
                event.preventDefault();
              }
            }}
          >
            Тохиролцоог цуцлах
          </button>
        ) : isOwner && hasMatch ? (
          <>
            <button type="submit" name="decision" value="accepted" disabled={pending} className={btnPrimary}>
              Тохиролцлоо
            </button>
            {status === "pending" ? (
              <button
                type="submit"
                name="decision"
                value="cancelled"
                disabled={pending}
                className={btnSecondary}
              >
                Татгалзах
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </form>
  );
}
