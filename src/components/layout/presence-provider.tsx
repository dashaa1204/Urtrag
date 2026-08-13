"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { UserId } from "@/types";
import { createClient } from "@/lib/supabase/client";

/** Бүх хэрэглэгч нэг сувагт цуглана — хэн сайтыг нээлттэй барьж байгааг мэдэхэд. */
const TOPIC = "presence:online";

const OnlineContext = createContext<ReadonlySet<UserId>>(new Set());

/**
 * Яг одоо сайт нээлттэй байгаа хэрэглэгчдийн id. Provider-ээс гадуур дуудвал
 * хоосон олонлог буцаана — тухайн хэсэгт цэг гарахгүй, өөр алдаа гарахгүй.
 */
export function useOnlineUsers(): ReadonlySet<UserId> {
  return useContext(OnlineContext);
}

/**
 * Апп даяарх идэвхтэй төлөв. Хэрэглэгч аль ч хуудсан дээр байхад өөрийгөө
 * бүртгүүлдэг тул нөгөө тал зөвхөн мессежийн хуудсанд байх шаардлагагүй.
 *
 * Төлөв нь зөвхөн холболт нээлттэй байх хугацаанд амьд — таб хаагдмагц Supabase
 * өөрөө presence-ээс хасна. Өгөгдлийн санд юу ч хадгалахгүй.
 */
export function PresenceProvider({ userId, children }: { userId: UserId | null; children: ReactNode }) {
  const [online, setOnline] = useState<ReadonlySet<UserId>>(() => new Set());

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    let channel: RealtimeChannel | undefined;
    let cancelled = false;

    void (async () => {
      // Presence-д сувгийн нэр хоёр талд ижил байх ёстой тул mount бүрд шинэ нэр
      // өгч чадахгүй. StrictMode-ийн давхар mount дээр салж эхэлсэн сувгийг
      // supabase.channel() буцаадаг тул бүрэн салтал нь хүлээнэ.
      const stale = supabase.getChannels().find((c) => c.topic === `realtime:${TOPIC}`);
      if (stale) await supabase.removeChannel(stale);
      if (cancelled) return;

      const live = supabase.channel(TOPIC, { config: { presence: { key: userId } } });
      channel = live;

      live
        .on("presence", { event: "sync" }, () => {
          setOnline(new Set(Object.keys(live.presenceState()) as UserId[]));
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") void live.track({ at: Date.now() });
        });
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [userId]);

  return <OnlineContext.Provider value={online}>{children}</OnlineContext.Provider>;
}
