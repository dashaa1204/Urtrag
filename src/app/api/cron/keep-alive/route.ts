import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/**
 * Supabase-ийн үнэгүй багцын project идэвхгүй хэдэн өдөр болохоор өөрөө
 * pause болж, сайт бүхэлдээ өгөгдөлгүй болдог. Vercel Cron үүнийг өдөр бүр
 * дуудаж DB-д жижиг query явуулна (vercel.json). Auth-ыг src/proxy.ts
 * хүсэлт бүрт аль хэдийн дууддаг.
 */
export async function GET(request: Request) {
  // Vercel Cron нь CRON_SECRET-ийг Authorization толгойд автоматаар хавсаргана
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, at: new Date().toISOString() });
  } catch (error) {
    console.error("keep-alive: DB query failed", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
