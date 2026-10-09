import { deleteUserFiles, purgeExpiredAccounts, retireOrphanProfiles } from "@/lib/account-retention";

/**
 * Өдөр бүрийн цэвэрлэгээ (vercel.json):
 * 1) Supabase dashboard-аас устгагдсан хэрэглэгчийн өнчин профайлыг устгалын
 *    ердийн дүрмээр цэвэрлэнэ.
 * 2) Хадгалах хугацаа нь дууссан бүртгэлийг бүрэн устгана.
 */
export async function GET(request: Request) {
  // Vercel Cron нь CRON_SECRET-ийг Authorization толгойд автоматаар хавсаргана
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const orphans = await retireOrphanProfiles();
    for (const id of orphans) {
      // Файл цэвэрлэгээ унасан ч профайлын цэвэрлэгээ аль хэдийн хийгдсэн
      await deleteUserFiles(id).catch((error) => console.error("purge-accounts: файл устгаж чадсангүй", id, error));
    }
    const purged = await purgeExpiredAccounts();
    return Response.json({ ok: true, orphans: orphans.length, purged });
  } catch (error) {
    console.error("purge-accounts: цэвэрлэгээ унасан", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
