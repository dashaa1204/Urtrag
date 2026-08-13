"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserId } from "@/types";
import { createClient } from "@/lib/supabase/client";

/**
 * Шинэ мессеж, үнэлгээ орж ирэхэд серверийн өгөгдлийг дахин татна. Өгөгдлийг
 * клиент дээр угсрахын оронд router.refresh() дуудаж байгаа нь navbar-ын
 * уншаагүйн тоолуур, мэдэгдэл, inbox, нээлттэй харилцан яриаг нэг дор
 * шинэчилдэг бөгөөд эрхийн шалгалт сервер талдаа хэвээр үлддэг.
 *
 * Аль мөрийг сонсохыг шүүх шаардлагагүй — хүснэгтүүд дээрх RLS policy нь
 * хамааралгүй хүнд мэдэгдэл огт хүргэхгүй.
 */
export function RealtimeSync({ userId }: { userId: UserId }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let reconnected = false;

    // Хэд хэдэн үйл явдал зэрэг ирвэл нэг л удаа татна.
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 150);
    };

    // Сувгийн нэр давхардвал supabase.channel() нь байгааг нь буцаадаг.
    // StrictMode-ийн давхар mount дээр энэ нь салж эхэлсэн сувгийг гардаг тул
    // шинэ захиалга чимээгүй унтардаг — mount бүрд өөр нэр өгнө.
    const channel = supabase
      .channel(`sync:${userId}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          // Өөрийн илгээсэн мессежийг server action аль хэдийн revalidate хийсэн.
          if ((payload.new as { sender_id?: UserId }).sender_id === userId) return;
          refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          // read_at тавигдсан гэсэн үг. Өөрийн мессеж уншигдсан үед л "Үзсэн"
          // гарах тул бусдын мессежийн шинэчлэлийг (өөрөө уншсан) алгасна.
          if ((payload.new as { sender_id?: UserId }).sender_id !== userId) return;
          refresh();
        }
      )
      .on(
        "postgres_changes",
        // Үнэлгээ нь мэдэгдлийн эх сурвалж. RLS дээр нэмээд шүүлтүүр өгсөн нь
        // хэрэггүй дохиог сервер талдаа таслах — өөрийн бичсэн үнэлгээ ирэхгүй.
        //
        // UPDATE-ийг бас сонсох ёстой: upsertReview нь байгаа үнэлгээг дарж
        // бичдэг тул засварласан үнэлгээ INSERT биш UPDATE болж ирдэг.
        { event: "*", schema: "public", table: "reviews", filter: `reviewee_id=eq.${userId}` },
        (payload) => {
          // Хонх нээхэд өөрөө уншсанд тэмдэглэсэн шинэчлэлт — дахин татах шаардлагагүй.
          if ((payload.new as { read_at?: string | null })?.read_at) return;
          refresh();
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") return;
        // Холболт тасарсан завсарт ирсэн мэдээллийг гүйцээж татна.
        if (reconnected) refresh();
        reconnected = true;
      });

    return () => {
      clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [router, userId]);

  return null;
}
