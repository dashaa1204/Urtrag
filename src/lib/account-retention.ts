// Бүртгэл устгах ба хадгалах хугацааны дүрэм.
//
// Тохиролцоо хийж байгаагүй хүний өгөгдлийг шууд, бүрэн устгана. Харин хэн
// нэгэнтэй тохиролцсон хүн бол "ачааг аваад дансаа устгачихлаа" гэх
// тохиолдолд нөгөө талд нотлох баримт үлдэх ёстой: профайлыг нэргүй болгож,
// жинхэнэ нэр, холбоо барих мэдээллийг deleted_accounts руу шилжүүлээд
// тохиролцооны яриаг хадгална. Хугацаа нь дуусахад cron бүгдийг устгана.

import "server-only";
import { and, eq, inArray, isNotNull, isNull, lt, ne, notInArray, or, sql } from "drizzle-orm";
import { db } from "./db";
import {
  conversations,
  deletedAccounts,
  identityVerifications,
  profiles,
  shipments,
  trips,
} from "./db/schema";
import { deleteImagesByPrefix } from "./cloudinary";
import { createAdminClient } from "./supabase/admin";
import { AVATAR_FOLDER } from "@/constant/avatar";
import { DELETED_USER_NAME, RETENTION_INTERVAL } from "@/constant/settings";
import { IDENTITY_BUCKET } from "@/constant/verification";
import type { UserId } from "@/types";

/**
 * Хэрэглэгчийн файлуудыг (баримтын зураг, профайлын зураг) устгана. Эдгээр нь
 * нотлох баримтад хэрэггүй, харин алдагдвал хамгийн их хохирол учруулна —
 * тиймээс бүртгэл хадгалагдах эсэхээс үл хамааран эхэлж арилна.
 */
export async function deleteUserFiles(userId: UserId): Promise<void> {
  const storage = createAdminClient().storage.from(IDENTITY_BUCKET);
  const { data: files } = await storage.list(userId);
  if (files && files.length > 0) {
    await storage.remove(files.map((file) => `${userId}/${file.name}`));
  }
  await deleteImagesByPrefix(`${AVATAR_FOLDER}/${userId}/`);
}

export type RetireResult = "purged" | "retained" | "missing";

/**
 * Auth хэрэглэгч нь устсаны дараа профайлыг цэвэрлэнэ.
 *
 * - Тохиролцоо огт хийгээгүй → профайл устаж, cascade-аар бүх зар, яриа арилна.
 * - Тохиролцоо хийж байсан → профайл нэргүй болж хадгалагдана. Тохиролцоогүй
 *   яриа, хэлцэлд ороогүй зар устана; тохиролцоотой яриа, зар нь хаагдаад
 *   үлдэнэ. Идэвхтэй хэлцлүүд цуцлагдана — эс тэгвэл нөгөө талын ачаа
 *   байхгүй хүнтэй "тохирсон" хэвээр түгжигдэнэ.
 */
export async function retireProfile(userId: UserId, email: string | null): Promise<RetireResult> {
  return db.transaction(async (tx) => {
    const [profile] = await tx
      .select({ name: profiles.name, phone: profiles.phone, deletedAt: profiles.deletedAt })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)
      .for("update");
    if (!profile || profile.deletedAt) return "missing";

    const involved = or(eq(conversations.starterId, userId), eq(conversations.ownerId, userId));

    const deals = await tx
      .select({
        tripId: conversations.tripId,
        shipmentId: conversations.shipmentId,
        acceptedAt: conversations.acceptedAt,
      })
      .from(conversations)
      .where(and(involved, isNotNull(conversations.acceptedAt)));

    if (deals.length === 0) {
      await tx.delete(profiles).where(eq(profiles.id, userId));
      return "purged";
    }

    const lastDeal = new Date(Math.max(...deals.map((deal) => deal.acceptedAt!.getTime())));

    await tx.insert(deletedAccounts).values({
      userId,
      name: profile.name,
      email,
      phone: profile.phone,
      retainUntil: sql`${lastDeal.toISOString()}::timestamptz + ${RETENTION_INTERVAL}::interval`,
    });

    await tx
      .update(profiles)
      .set({
        name: DELETED_USER_NAME,
        phone: null,
        country: null,
        bio: null,
        avatarPath: null,
        deletedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    await tx
      .update(conversations)
      .set({ dealStatus: "cancelled", dealDecidedAt: new Date() })
      .where(and(involved, ne(conversations.dealStatus, "cancelled")));

    // Тохиролцоогүй яриа нотлох баримт биш — мессежүүд нь cascade-аар дагаж устна.
    await tx.delete(conversations).where(and(involved, isNull(conversations.acceptedAt)));

    // Хэлцэлд орсон зар нь "юуг, хэдэн кг-аар, ямар үнээр" гэдгийн баримт тул
    // үлдэнэ. deals дотор нөгөө талын зарын id ч бий — notInArray-д хор хөнөөлгүй.
    const keptTrips = deals.map((deal) => deal.tripId).filter((id): id is number => id !== null);
    const keptShipments = deals.map((deal) => deal.shipmentId).filter((id): id is number => id !== null);

    await tx
      .delete(trips)
      .where(and(eq(trips.userId, userId), keptTrips.length > 0 ? notInArray(trips.id, keptTrips) : undefined));
    await tx
      .delete(shipments)
      .where(
        and(
          eq(shipments.userId, userId),
          keptShipments.length > 0 ? notInArray(shipments.id, keptShipments) : undefined
        )
      );
    await tx.update(trips).set({ status: "closed" }).where(eq(trips.userId, userId));
    await tx.update(shipments).set({ status: "closed" }).where(eq(shipments.userId, userId));

    // Шийдвэр гараагүй хүсэлтийн файл нь deleteUserFiles-ээр арилсан тул мөр нь
    // утгагүй. Шийдвэр гарсан мөр (баталгаажсан эсэх) нь баримтын нэг хэсэг.
    await tx
      .delete(identityVerifications)
      .where(and(eq(identityVerifications.userId, userId), eq(identityVerifications.status, "pending")));

    return "retained";
  });
}

/**
 * Supabase dashboard-аас шууд устгагдсан хэрэглэгчид retireProfile-ийг
 * дамжаагүй тул идэвхтэй зартайгаа үлддэг. Auth хэрэглэгчгүй профайлыг олж
 * ижил дүрмээр цэвэрлэнэ. Имэйл нь auth-тай хамт устсан тул NULL.
 */
export async function retireOrphanProfiles(): Promise<UserId[]> {
  const rows = await db.execute<{ id: string }>(sql`
    select p.id from ${profiles} p
    where p.deleted_at is null
      and not exists (select 1 from auth.users u where u.id = p.id)
  `);
  const ids = Array.from(rows, (row) => row.id);
  for (const id of ids) {
    await retireProfile(id, null);
  }
  return ids;
}

/** Хадгалах хугацаа нь дууссан бүртгэлийг бүрэн устгана (cascade). */
export async function purgeExpiredAccounts(): Promise<number> {
  const expired = db
    .select({ id: deletedAccounts.userId })
    .from(deletedAccounts)
    .where(lt(deletedAccounts.retainUntil, new Date()));
  const rows = await db
    .delete(profiles)
    .where(inArray(profiles.id, expired))
    .returning({ id: profiles.id });
  return rows.length;
}
