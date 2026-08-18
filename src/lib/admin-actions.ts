"use server";

// Хянагчийн үйлдлүүд. Хэрэглэгчийн үйлдлүүдээс (actions.ts) тусад нь байрлана —
// эдгээр нь БУСДЫН зар дээр ажилладаг тул эрхийн шалгалт нь өөр бөгөөд нэг
// дороо байх нь аудит хийхэд амар.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import { closeListing, deleteListing, getShipment, getTrip, reopenListing } from "./data";
import { logAdminAction } from "./admin-data";
import { internalPath, numericId } from "./nav";
import { counterpartType } from "./listing";
import { routeTitle } from "./format";
import type { ListingType, SessionUser } from "@/types";

/** Хянагчийн үйлдэл нь зар, эзэн, хоёр талын яриа бүгдэд нөлөөлнө. */
function revalidateListing(type: ListingType): void {
  revalidatePath("/admin/listings");
  revalidatePath("/my");
  revalidatePath(type === "trip" ? "/trips" : "/shipments");
  revalidatePath(type === "trip" ? "/trips/[id]" : "/shipments/[id]", "page");
}

interface ListingParams {
  type: ListingType;
  id: number;
  /** Үйлдлийн дараа буцах зам — шүүлтүүр, хуудас нь хадгалагдана. */
  back: string;
}

function listingParams(formData: FormData): ListingParams | null {
  const type = formData.get("type");
  const id = numericId(formData.get("id"));
  if ((type !== "trip" && type !== "shipment") || id === null) return null;
  return { type, id, back: internalPath(formData.get("back")) ?? "/admin/listings" };
}

/**
 * "Vienna → Ulaanbaatar · dashaa" — түүхэнд үлдэх тайлбар.
 *
 * Устгахаас ӨМНӨ уншина: дараа нь мөр байхгүй болно. Хаах, нээхэд ч ижил
 * дарааллаар явуулна — түүх бүр ижил хэлбэртэй байх нь уншихад амар.
 */
async function listingLabel(type: ListingType, id: number): Promise<string | null> {
  const row = type === "trip" ? await getTrip(id) : await getShipment(id);
  return row ? `${routeTitle(row)} · ${row.user_name}` : null;
}

export async function adminCloseListing(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const params = listingParams(formData);
  if (!params) redirect("/admin/listings");

  const summary = await listingLabel(params.type, params.id);
  if (await closeListing(params.type, params.id, null)) {
    await log(admin, "listing_close", params, summary);
    revalidateListing(params.type);
  }
  redirect(params.back);
}

export async function adminReopenListing(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const params = listingParams(formData);
  if (!params) redirect("/admin/listings");

  // Хугацаа нь өнгөрсөн аялалыг дахин нээхийг харагдац дээр нь хаасан
  // (эзний талд ч ижил дүрэм) тул энд нэмэлт шалгалт хийхгүй.
  const summary = await listingLabel(params.type, params.id);
  if (await reopenListing(params.type, params.id, null)) {
    await log(admin, "listing_reopen", params, summary);
    revalidateListing(params.type);
  }
  redirect(params.back);
}

export async function adminDeleteListing(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const params = listingParams(formData);
  if (!params) redirect("/admin/listings");

  const summary = await listingLabel(params.type, params.id);
  const result = await deleteListing(params.type, params.id, null);
  if (result) {
    await log(admin, "listing_delete", params, summary);
    revalidateListing(params.type);

    // Цуцлагдсан хэлцлүүдийн хос зарууд дахин сул боллоо — тэдний хуудас, мөн
    // хоёр талын харилцан яриа шинэ төлөвөө харуулах ёстой.
    if (result.freedIds.length > 0) revalidateListing(counterpartType(params.type));
    if (result.conversationIds.length > 0) {
      revalidatePath("/messages/[id]", "page");
      revalidatePath("/messages");
    }
    revalidatePath("/admin/deals");
  }

  redirect(params.back);
}

/** Гурван үйлдэлд давтагдах бүртгэлийн дуудлага. */
function log(
  admin: SessionUser,
  action: "listing_close" | "listing_reopen" | "listing_delete",
  params: ListingParams,
  summary: string | null
): Promise<void> {
  return logAdminAction({
    actor: admin,
    action,
    targetType: params.type,
    targetId: params.id,
    summary,
  });
}
