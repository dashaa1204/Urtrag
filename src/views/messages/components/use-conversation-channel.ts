"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { UserId } from "@/types";
import { createClient } from "@/lib/supabase/client";

/** Хамгийн сүүлийн товшилтоос хойш ийм хугацаанд "бичиж байна" хэвээр. */
const TYPING_CLEAR = 4000;
/** Товшилт болгонд дохио явуулахгүй — хамгийн олондоо ийм давтамжтай. */
const TYPING_THROTTLE = 1500;

interface ConversationLive {
  otherTyping: boolean;
  notifyTyping: () => void;
}

/**
 * Харилцан ярианы "бичиж байна" дохио. Өгөгдлийн санд хадгалагдахгүй түр зуурын
 * төлөв тул postgres changes-ээс тусдаа broadcast суваг ашиглана.
 *
 * Суваг нь хоёр талд ижил нэртэй байх ёстой бөгөөд агуулгандаа зөвхөн
 * хэрэглэгчийн id зөөнө — мессежийн текст энд огт явахгүй.
 *
 * Идэвхтэй эсэх нь энд биш, апп даяарх PresenceProvider дээр — хэрэглэгч аль ч
 * хуудсанд байхад идэвхтэйд тооцогдоно.
 */
export function useConversationChannel(
  conversationId: number,
  userId: UserId,
  otherId: UserId
): ConversationLive {
  const [otherTyping, setOtherTyping] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSent = useRef(0);

  useEffect(() => {
    const supabase = createClient();
    const topic = `conversation:${conversationId}`;
    let channel: RealtimeChannel | undefined;
    let clearTyping: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    void (async () => {
      // supabase.channel() нь ижил нэртэй суваг байвал байгааг нь буцаадаг.
      // StrictMode-ийн давхар mount дээр энэ нь салж эхэлсэн сувгийг гардаг тул
      // хоёр талд ижил байх ёстой нэрийг хадгалахын тулд бүрэн салтал хүлээнэ.
      const stale = supabase.getChannels().find((c) => c.topic === `realtime:${topic}`);
      if (stale) await supabase.removeChannel(stale);
      if (cancelled) return;

      const live = supabase.channel(topic);
      channel = live;
      channelRef.current = live;

      live
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          if ((payload as { from?: UserId })?.from !== otherId) return;
          setOtherTyping(true);
          clearTimeout(clearTyping);
          clearTyping = setTimeout(() => setOtherTyping(false), TYPING_CLEAR);
        })
        .subscribe();
    })();

    return () => {
      cancelled = true;
      clearTimeout(clearTyping);
      channelRef.current = null;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [conversationId, otherId]);

  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastSent.current < TYPING_THROTTLE) return;
    lastSent.current = now;
    void channelRef.current?.send({ type: "broadcast", event: "typing", payload: { from: userId } });
  }, [userId]);

  return { otherTyping, notifyTyping };
}
