"use client";

import { useActionState } from "react";
import { decideDeal } from "@/lib/actions";
import { btnPrimary, btnSecondary, FormError } from "@/components/ui";
import type { DealStatus } from "@/types";

/**
 * Хүсэлтийн шийдвэр. Зарын эзэн тохирох эсвэл татгалзах, тохирсны дараа
 * хоёр тал хоёулаа цуцлах боломжтой.
 *
 * Тохирсон үед ачаа нь "эзэнтэй" болж (өөр аялагч авахгүй), аялалын сул жингээс
 * тухайн ачааны жин хасагдана. Цуцлангуут хоёулаа дахин чөлөөлөгдөнө.
 */
export function DealBox({
  conversationId,
  status,
  canAccept,
  otherName,
  hasMatch,
}: {
  conversationId: number;
  status: DealStatus;
  /** Үзэгч нь АЯЛАГЧ уу — сул жин нь түүнийх тул шийдвэр ч түүнийх. */
  canAccept: boolean;
  otherName: string;
  /** Хос зар сонгогдсон эсэх — хуучин яриануудад байхгүй. */
  hasMatch: boolean;
}) {
  const [state, action, pending] = useActionState(decideDeal, undefined);

  const text =
    status === "accepted"
      ? `Та ${otherName}-тай тохирсон. Ачаа энэ аялалд захиалагдаж, аялалын сул жингээс хасагдлаа.`
      : status === "cancelled"
        ? "Энэ хүсэлт цуцлагдсан. Ачаа сул болж, аялалын жин чөлөөлөгдлөө."
        : canAccept
          ? `${otherName}-ийн ачааг энэ аялалдаа авах уу? Баталмагц сул жингээс хасагдана.`
          : `Аялагч ${otherName} хариу өгөхийг хүлээж байна.`;

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
              if (!confirm("Тохиролцоог цуцлах уу? Ачаа сул болж, аялалын жин чөлөөлөгдөнө.")) {
                event.preventDefault();
              }
            }}
          >
            Тохиролцоог цуцлах
          </button>
        ) : canAccept && hasMatch ? (
          <>
            <button type="submit" name="decision" value="accepted" disabled={pending} className={btnPrimary}>
              Ачааг авна
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
