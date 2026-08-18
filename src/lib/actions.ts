"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireAdmin, requireUser } from "./auth";
import { createClient } from "./supabase/server";
import {
  acceptDeal,
  addMessage,
  cancelDeal,
  committedShipmentIds,
  decideVerification,
  updateProfile as updateProfileRow,
  upsertVerification,
  closeListing as closeListingRow,
  createShipment as insertShipment,
  createTrip as insertTrip,
  deleteListing as deleteListingRow,
  findConversation,
  getConversation,
  getOrCreateConversation,
  getShipment,
  getTrip,
  getUserName,
  markReviewsRead,
  reopenListing as reopenListingRow,
  tripBookedKg,
  updateShipment as updateShipmentRow,
  updateTrip as updateTripRow,
  upsertReview,
} from "./data";
import { logAdminAction } from "./admin-data";
import { conversationPath, internalPath, listingPath, numericId } from "./nav";
import { joinPhone } from "./phone";
import { deleteImage, deleteImagesByPrefix, uploadImage } from "./cloudinary";
import { createAdminClient } from "./supabase/admin";
import {
  AVATAR_FOLDER,
  AVATAR_FORMATS_LABEL,
  AVATAR_MIME_TYPES,
  MAX_AVATAR_BYTES,
  MAX_AVATAR_LABEL,
} from "@/constant/avatar";
import { counterpartType, dealPair, fitsCapacity, isTripExpired, travellerId } from "./listing";
import { formatKg } from "./format";
import { findCity, isCountryCode } from "@/constant/cities";
import { MATCH_COPY } from "@/constant/listings";
import { BIO_MAX, DELETE_CONFIRM_WORD } from "@/constant/settings";
import {
  DOC_FORMATS_LABEL,
  IDENTITY_BUCKET,
  MAX_DOC_BYTES,
  MAX_DOC_LABEL,
} from "@/constant/verification";
import { SITE } from "@/constant/site";
import type { FormState, ListingType } from "@/types";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function rawStr(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function safeNext(formData: FormData, fallback: string): string {
  return internalPath(str(formData, "next")) ?? fallback;
}

function appUrl(): string {
  return SITE.url;
}

/** Supabase-ийн англи алдааг хэрэглэгчид ойлгомжтой монгол текст болгоно. */
function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Имэйл эсвэл нууц үг буруу байна.";
  if (m.includes("email not confirmed")) {
    return "Имэйлээ баталгаажуулаагүй байна. Бүртгүүлэхэд ирсэн холбоосоор орно уу.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Хэт олон удаа оролдлоо. Түр хүлээгээд дахин оролдоно уу.";
  }
  if (m.includes("should be different")) return "Шинэ нууц үг хуучнаасаа өөр байх ёстой.";
  if (m.includes("password")) return "Нууц үг шаардлага хангахгүй байна.";
  return "Алдаа гарлаа. Дахин оролдоно уу.";
}

// ---------- Нэвтрэлт ----------

export async function signup(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const phoneCode = str(formData, "phone_code");
  const phoneNumber = str(formData, "phone");
  const password = rawStr(formData, "password");
  const terms = formData.get("terms") === "on";
  const values = {
    name,
    email,
    phone: phoneNumber,
    phone_code: phoneCode,
    terms: terms ? "on" : "",
  };

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Нэрээ бүтэн оруулна уу.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Имэйл хаяг буруу байна.";
  if (password.length < 8) fieldErrors.password = "Нууц үг дор хаяж 8 тэмдэгт байх ёстой.";
  if (!terms) fieldErrors.terms = "Хариуцлагын тайлбарыг зөвшөөрнө үү.";

  const joined = joinPhone(phoneCode, phoneNumber);
  if (!joined.ok) fieldErrors.phone = joined.error;
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };
  const phone = joined.ok ? joined.phone : null;

  const next = safeNext(formData, "/");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // profiles мөрийг үүсгэх trigger нь эдгээр утгыг ашиглана
      data: { name, phone: phone || null },
      emailRedirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: authErrorMessage(error.message), values };
  }

  // Бүртгэлтэй имэйлийг задруулахгүйн тулд Supabase хуурамч хэрэглэгч буцаадаг
  if (data.user && data.user.identities?.length === 0) {
    return { fieldErrors: { email: "Энэ имэйлээр бүртгэл үүссэн байна. Нэвтэрч орно уу." }, values };
  }

  // Имэйл баталгаажуулалт асаалттай үед session шууд үүсэхгүй
  if (!data.session) {
    return { notice: `${email} хаяг руу баталгаажуулах холбоос илгээлээ. Имэйлээ шалгана уу.` };
  }

  redirect(next);
}

export async function login(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const email = str(formData, "email").toLowerCase();
  const password = rawStr(formData, "password");
  const values = { email };

  if (!EMAIL_RE.test(email) || password.length === 0) {
    return { error: "Имэйл болон нууц үгээ оруулна уу.", values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: authErrorMessage(error.message), values };
  }

  redirect(safeNext(formData, "/"));
}

/**
 * Google-ээр нэвтрэх. Supabase өөрөө зөвшөөрлийн хаягийг үүсгэж өгдөг тул
 * бид зөвхөн тэр рүү шилжүүлнэ — буцаад ирэхдээ `code` авчирна.
 *
 * PKCE-ийн нууц түлхүүр нь энэ дуудалтын үед cookie-д бичигдэнэ (server client),
 * улмаар /auth/callback дээр session солигдоно.
 */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNext(formData, "/");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ---------- Нууц үг сэргээх ----------

export async function requestPasswordReset(
  _prev: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const email = str(formData, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { error: "Имэйл хаягаа зөв оруулна уу.", values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  // Хурдны хязгаараас бусад алдааг мэдэгдэхгүй: тухайн имэйл бүртгэлтэй эсэхийг
  // задруулахгүйн тулд үргэлж ижил хариу буцаана.
  if (error && /rate limit|too many/i.test(error.message)) {
    return { error: authErrorMessage(error.message), values: { email } };
  }

  return {
    notice: `Хэрэв ${email} хаягаар бүртгэл байгаа бол нууц үг сэргээх холбоос илгээгдлээ. Имэйлээ шалгана уу.`,
  };
}

export async function updatePassword(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const password = rawStr(formData, "password");
  const confirm = rawStr(formData, "password_confirm");

  const fieldErrors: Record<string, string> = {};
  if (password.length < 8) fieldErrors.password = "Нууц үг дор хаяж 8 тэмдэгт байх ёстой.";
  else if (password !== confirm) fieldErrors.password_confirm = "Хоёр нууц үг таарахгүй байна.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Холбоосын хугацаа дууссан байна. Дахин хүсэлт илгээнэ үү." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authErrorMessage(error.message) };

  redirect("/");
}

// ---------- Аялалын зар ----------

/**
 * values-ыг амжилттай үед ч буцаана: хадгалах үе шатанд гарсан алдаа (жишээ нь
 * багтаамж хүрэлцэхгүй) дээр формыг хоосруулахгүй эргүүлэн дүүргэхэд хэрэгтэй.
 */
type Validated<T> =
  | { ok: true; input: T; values: Record<string, string> }
  | { ok: false; state: FormState };

interface RouteInput {
  fromCountry: string;
  toCountry: string;
  fromCity: string;
  toCity: string;
}

/**
 * Хаанаас/хаашаа хосыг шалгана — аялал, ачаа хоёуланд нь ижил.
 * Хотыг жагсаалтын жишиг нэр рүү нь нэгтгэж ("Вена" → "Vienna"), улсыг нь тэмдэглэнэ.
 */
function validateRoute(formData: FormData, fieldErrors: Record<string, string>): RouteInput | null {
  const from = findCity(str(formData, "from_city"));
  const to = findCity(str(formData, "to_city"));
  if (!from) fieldErrors.from_city = "Жагсаалтаас хот сонгоно уу.";
  if (!to) fieldErrors.to_city = "Жагсаалтаас хот сонгоно уу.";
  if (!from || !to) return null;

  if (from.name === to.name) {
    fieldErrors.to_city = "Хаанаас, хаашаа хоёр өөр хот байх ёстой.";
    return null;
  }
  return { fromCountry: from.code, toCountry: to.code, fromCity: from.name, toCity: to.name };
}

interface TripInput extends RouteInput {
  travelDate: string;
  availableKg: number;
  pricePerKg: number;
  notes: string | null;
}

function validateTrip(formData: FormData): Validated<TripInput> {
  const travelDate = str(formData, "travel_date");
  const availableKg = Number(str(formData, "available_kg"));
  const pricePerKg = Number(str(formData, "price_per_kg"));
  const notes = str(formData, "notes");
  const values = {
    from_city: str(formData, "from_city"),
    to_city: str(formData, "to_city"),
    travel_date: travelDate,
    available_kg: str(formData, "available_kg"),
    price_per_kg: str(formData, "price_per_kg"),
    notes,
  };

  const fieldErrors: Record<string, string> = {};
  const route = validateRoute(formData, fieldErrors);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
    fieldErrors.travel_date = "Аялах огноогоо сонгоно уу.";
  } else if (isTripExpired(travelDate)) {
    fieldErrors.travel_date = "Өнгөрсөн огноо байж болохгүй.";
  }
  if (!Number.isFinite(availableKg) || availableKg <= 0 || availableKg > 500) {
    fieldErrors.available_kg = "Авах боломжтой жингээ (кг) зөв оруулна уу.";
  }
  if (!Number.isFinite(pricePerKg) || pricePerKg <= 0 || pricePerKg > 1000) {
    fieldErrors.price_per_kg = "1 кг-ийн үнээ (€) зөв оруулна уу.";
  }
  if (notes.length > 2000) fieldErrors.notes = "Тайлбар хэт урт байна.";
  if (!route || Object.keys(fieldErrors).length > 0) return { ok: false, state: { fieldErrors, values } };

  return {
    ok: true,
    values,
    input: {
      ...route,
      travelDate,
      availableKg,
      pricePerKg,
      notes: notes || null,
    },
  };
}

export async function createTrip(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireUser("/trips/new");

  const result = validateTrip(formData);
  if (!result.ok) return result.state;

  const id = await insertTrip({ userId: user.id, ...result.input });
  // Хаяг нь зарын чиглэл, огноог агуулдаг тул мөрөө буцааж уншина.
  const trip = await getTrip(id);

  revalidatePath("/trips");
  // Зар дээрээс "зар оруулах" гэж ирсэн бол буцаагаад тэр зар руу нь тавина.
  // Бусад тохиолдолд шинэ зар руугаа — ?new=1 нь хуваалцах урилгыг онцолно.
  redirect(safeNext(formData, trip ? `${listingPath("trip", trip)}?new=1` : "/my"));
}

export async function updateTrip(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = numericId(str(formData, "id"));
  if (id === null) return { error: "Зар олдсонгүй." };

  const result = validateTrip(formData);
  if (!result.ok) return result.state;

  const outcome = await updateTripRow(id, user.id, result.input);
  if (outcome === "missing") return { error: "Зар олдсонгүй." };
  if (outcome !== "ok") {
    return {
      fieldErrors: {
        available_kg: `Энэ аялалд ${formatKg(
          outcome.bookedKg
        )} аль хэдийн захиалагдсан тул сул жинг түүнээс бага болгож болохгүй. Эхлээд тохиролцоогоо цуцлаарай.`,
      },
      values: result.values,
    };
  }

  const trip = await getTrip(id);

  revalidatePath("/trips");
  revalidatePath("/trips/[id]", "page");
  redirect(trip ? listingPath("trip", trip) : "/my");
}

// ---------- Ачааны зар ----------

interface ShipmentInput extends RouteInput {
  weightKg: number;
  readyDate: string | null;
  deadlineDate: string | null;
  description: string;
  offerPrice: number | null;
}

function validateShipment(formData: FormData): Validated<ShipmentInput> {
  const weightKg = Number(str(formData, "weight_kg"));
  const readyDate = str(formData, "ready_date");
  const deadlineDate = str(formData, "deadline_date");
  const description = str(formData, "description");
  const offerPriceRaw = str(formData, "offer_price");
  const offerPrice = offerPriceRaw ? Number(offerPriceRaw) : null;
  const values = {
    from_city: str(formData, "from_city"),
    to_city: str(formData, "to_city"),
    weight_kg: str(formData, "weight_kg"),
    ready_date: readyDate,
    deadline_date: deadlineDate,
    description,
    offer_price: offerPriceRaw,
  };

  const fieldErrors: Record<string, string> = {};
  const route = validateRoute(formData, fieldErrors);
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 500) {
    fieldErrors.weight_kg = "Ачааны жингээ (кг) зөв оруулна уу.";
  }
  if (description.length < 5) fieldErrors.description = "Ачааныхаа тухай товч тайлбар бичнэ үү.";
  if (description.length > 2000) fieldErrors.description = "Тайлбар хэт урт байна.";
  if (readyDate && !/^\d{4}-\d{2}-\d{2}$/.test(readyDate)) fieldErrors.ready_date = "Огноо буруу байна.";
  if (deadlineDate && !/^\d{4}-\d{2}-\d{2}$/.test(deadlineDate)) fieldErrors.deadline_date = "Огноо буруу байна.";
  if (readyDate && deadlineDate && deadlineDate < readyDate) {
    fieldErrors.deadline_date = "Эцсийн огноо нь бэлэн болох огнооноос өмнө байж болохгүй.";
  }
  if (offerPrice !== null && (!Number.isFinite(offerPrice) || offerPrice <= 0 || offerPrice > 1000)) {
    fieldErrors.offer_price = "Санал болгох үнээ (€/кг) зөв оруулна уу.";
  }
  if (!route || Object.keys(fieldErrors).length > 0) return { ok: false, state: { fieldErrors, values } };

  return {
    ok: true,
    values,
    input: {
      ...route,
      weightKg,
      readyDate: readyDate || null,
      deadlineDate: deadlineDate || null,
      description,
      offerPrice,
    },
  };
}

export async function createShipment(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireUser("/shipments/new");

  const result = validateShipment(formData);
  if (!result.ok) return result.state;

  const id = await insertShipment({ userId: user.id, ...result.input });
  // Хаяг нь зарын чиглэл, жинг агуулдаг тул мөрөө буцааж уншина.
  const shipment = await getShipment(id);

  revalidatePath("/shipments");
  // Зар дээрээс "зар оруулах" гэж ирсэн бол буцаагаад тэр зар руу нь тавина.
  // Бусад тохиолдолд шинэ зар руугаа — ?new=1 нь хуваалцах урилгыг онцолно.
  redirect(safeNext(formData, shipment ? `${listingPath("shipment", shipment)}?new=1` : "/my"));
}

export async function updateShipment(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = numericId(str(formData, "id"));
  if (id === null) return { error: "Зар олдсонгүй." };

  const result = validateShipment(formData);
  if (!result.ok) return result.state;

  if (!(await updateShipmentRow(id, user.id, result.input))) return { error: "Зар олдсонгүй." };

  const shipment = await getShipment(id);

  revalidatePath("/shipments");
  revalidatePath("/shipments/[id]", "page");
  redirect(shipment ? listingPath("shipment", shipment) : "/my");
}

// ---------- Зар хаах / нээх / устгах ----------

function listingParams(formData: FormData): { type: ListingType; id: number } | null {
  const type = str(formData, "type");
  const id = numericId(str(formData, "id"));
  if ((type !== "trip" && type !== "shipment") || id === null) return null;
  return { type: type as ListingType, id };
}

/**
 * Зарын хуудсууд нь одоо чиглэл, огноогоо агуулсан хаягтай тул нэг зарын
 * ЯГ хаягийг мэдэхийн тулд мөрийг нь уншсан байх шаардлагатай болно. Энд
 * ихэвчлэн зөвхөн id мэдэгддэг (устсан зарын чөлөөлсөн хосууд гэх мэт) тул
 * тухайн төрлийн бүх дэлгэрэнгүй хуудсыг зарлана — цөөн зартай MVP-д энэ нь
 * нэмэлт хүсэлт үүсгэхээс хямд.
 */
function revalidateListing(type: ListingType): void {
  revalidatePath("/my");
  revalidatePath(type === "trip" ? "/trips" : "/shipments");
  revalidatePath(type === "trip" ? "/trips/[id]" : "/shipments/[id]", "page");
}

export async function closeListing(formData: FormData): Promise<void> {
  const user = await requireUser("/my");
  const params = listingParams(formData);
  if (params) {
    await closeListingRow(params.type, params.id, user.id);
    revalidateListing(params.type);
  }
  redirect("/my");
}

export async function reopenListing(formData: FormData): Promise<void> {
  const user = await requireUser("/my");
  const params = listingParams(formData);
  if (params) {
    // Огноо нь өнгөрсөн аялалыг дахин нээхгүй
    if (params.type === "trip") {
      const trip = await getTrip(params.id);
      if (!trip || isTripExpired(trip.travel_date)) redirect("/my");
    }
    await reopenListingRow(params.type, params.id, user.id);
    revalidateListing(params.type);
  }
  redirect("/my");
}

export async function deleteListing(formData: FormData): Promise<void> {
  const user = await requireUser("/my");
  const params = listingParams(formData);
  if (params) {
    const result = await deleteListingRow(params.type, params.id, user.id);
    revalidateListing(params.type);
    if (result) {
      // Цуцлагдсан хэлцлүүдийн хос зарууд дахин сул боллоо — тэдний хуудас,
      // мөн хоёр талын харилцан яриа шинэ төлөвөө харуулах ёстой.
      if (result.freedIds.length > 0) revalidateListing(counterpartType(params.type));
      if (result.conversationIds.length > 0) {
        revalidatePath("/messages/[id]", "page");
        revalidatePath("/messages");
      }
    }
  }
  redirect("/my");
}

// ---------- Мессеж ----------

/** Аялалын сул жин хүрэлцэхгүй үеийн тайлбар — хоёр талд ижил. */
function noRoomError(remainingKg: number, weightKg: number): string {
  return `Аялалд ${formatKg(Math.max(0, remainingKg))} сул үлдсэн тул ${formatKg(
    weightKg
  )} ачаа багтахгүй байна.`;
}

export async function sendMessage(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const body = str(formData, "body");
  if (body.length === 0) return { error: "Мессежээ бичнэ үү." };
  if (body.length > 2000) return { error: "Мессеж хэт урт байна.", values: { body } };

  const conversationIdRaw = str(formData, "conversation_id");
  if (conversationIdRaw) {
    // Байгаа харилцан яриан дахь хариу
    const conversationId = numericId(conversationIdRaw);
    const conversation = conversationId !== null ? await getConversation(conversationId) : null;
    if (!conversation || (conversation.starter_id !== user.id && conversation.owner_id !== user.id)) {
      return { error: "Харилцан яриа олдсонгүй." };
    }
    await addMessage(conversation.id, user.id, body);
    revalidatePath(conversationPath(conversation.id));
    revalidatePath("/messages");
    return {};
  }

  // Зарын хуудаснаас шинэ яриа эхлүүлэх
  const type = str(formData, "listing_type");
  const listingId = numericId(str(formData, "listing_id"));
  if ((type !== "trip" && type !== "shipment") || listingId === null) {
    return { error: "Зар олдсонгүй." };
  }
  const listingType = type as ListingType;
  const listing = listingType === "trip" ? await getTrip(listingId) : await getShipment(listingId);
  if (!listing) return { error: "Зар олдсонгүй." };
  // Хуучирсан хуудаснаас ирсэн хүсэлт — жагсаалт нь зарыг нууж байгаа ч
  // форм нь хэвээр илгээгдэж болно.
  if (listing.status !== "active") return { error: "Энэ зар хаагдсан байна." };
  if (listing.user_id === user.id) return { error: "Өөрийн зар руу мессеж илгээх боломжгүй." };

  // Хүсэлт бүр хос зартай: аялал руу ачаагаараа, ачаа руу аялалаараа хандана.
  // Яриа аль хэдийн үүссэн бол анх сонгосон зар нь хэвээр үлдэнэ.
  let matchedListingId: number | null = null;
  if ((await findConversation(listingType, listingId, user.id)) === null) {
    const matchType = counterpartType(listingType);
    const matchId = numericId(str(formData, "match_listing_id"));
    const match =
      matchId === null ? null : matchType === "trip" ? await getTrip(matchId) : await getShipment(matchId);
    // Чиглэл нь эзний зартай яг таарах ёстой — өөр чиглэлийн зар хавсаргаж
    // болохгүй (жагсаалт нь шүүгдсэн ч хүсэлт нь шууд илгээгдэж болно).
    if (
      !match ||
      match.user_id !== user.id ||
      match.status !== "active" ||
      match.from_country !== listing.from_country ||
      match.to_country !== listing.to_country
    ) {
      return { error: MATCH_COPY[matchType].pickError, values: { body } };
    }

    // Багтаамжийг аялал тал нь барьдаг тул хосын үүргийг ялгана.
    const { trip, shipment } = dealPair(listingType, listing, match);

    // Нисчихсэн аялалд ачаа өгөх боломжгүй. Жагсаалт нь ийм зарыг нуудаг ч
    // шууд холбоосоор нээгдэж, форм нь илгээгдэж болно.
    if (isTripExpired(trip.travel_date)) {
      return { error: "Энэ аялалын огноо өнгөрсөн байна.", values: { body } };
    }

    // Ачаа хуваагдахгүй — өөр аялагчтай тохирчихсон ачааг дахин санал болгохгүй.
    if ((await committedShipmentIds([shipment.id])).size > 0) {
      return { error: MATCH_COPY[matchType].takenError, values: { body } };
    }

    // Аялал хуваагдана — үлдсэн сул жинд багтаж байж хүсэлт утгатай.
    const remaining = trip.available_kg - (await tripBookedKg(trip.id));
    if (!fitsCapacity(shipment.weight_kg, remaining)) {
      return { error: noRoomError(remaining, shipment.weight_kg), values: { body } };
    }
    matchedListingId = match.id;
  }

  const conversationId = await getOrCreateConversation(
    listingType,
    listingId,
    user.id,
    listing.user_id,
    matchedListingId
  );
  await addMessage(conversationId, user.id, body);
  revalidatePath("/messages");
  redirect(conversationPath(conversationId));
}

// ---------- Хэлцэл ----------

/**
 * Хүсэлтийг зөвшөөрөх / татгалзах / тохирсноо цуцлах.
 *
 * Зөвшөөрөх эрх зөвхөн зарын эзэнд байна — хүсэлт илгээгч нь аль хэдийн
 * саналаа тавьсан тул хоёр дахь баталгаа шаардлагагүй. Цуцлахыг хоёр тал
 * хийж чадна: тохирсны дараа нөхцөл өөрчлөгдвөл ачаа сул болж, аялалын
 * жин чөлөөлөгдөх ёстой.
 */
export async function decideDeal(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const decision = str(formData, "decision");
  if (decision !== "accepted" && decision !== "cancelled") return { error: "Үйлдэл танигдсангүй." };

  const conversationId = numericId(str(formData, "conversation_id"));
  const conversation = conversationId !== null ? await getConversation(conversationId) : null;
  if (!conversation || (conversation.starter_id !== user.id && conversation.owner_id !== user.id)) {
    return { error: "Харилцан яриа олдсонгүй." };
  }

  if (decision === "accepted") {
    // Сул жин нь аялагчийнх тул шийдвэр ч түүнийх. Зарын эзэн гэж үзвэл ачааны
    // зар дээр эхэлсэн ярианд илгээгч тал аялагчийн жинг өөрөө хасчихна.
    if (travellerId(conversation) !== user.id) {
      return { error: "Зөвхөн аялагч ачааг авахаар шийднэ." };
    }
    if (conversation.trip_id === null || conversation.shipment_id === null) {
      return { error: "Энэ хүсэлтэд хос зар алга байна." };
    }

    let result;
    try {
      result = await acceptDeal(conversation.id, conversation.trip_id, conversation.shipment_id);
    } catch {
      // conversations_accepted_shipment_key: ачаа өөр аялагчтай тохирчихсон
      return { error: MATCH_COPY.trip.takenError };
    }
    if (result === "missing") return { error: "Хос зарын аль нэг нь олдсонгүй." };
    if (result === "full") {
      return { error: "Аялалын сул жин хүрэлцэхгүй байна. Өөр ачаанаас цуцлах шаардлагатай." };
    }
  } else if (conversation.deal_status !== "cancelled") {
    await cancelDeal(conversation.id);
  }

  // Хоёр зарын хуудас хоёулаа "Тохирсон" тэмдгээ шинэчлэх ёстой
  revalidateListing(conversation.listing_type);
  if (conversation.matched_listing_id !== null) {
    revalidateListing(counterpartType(conversation.listing_type));
  }
  revalidatePath(conversationPath(conversation.id));
  revalidatePath("/messages");
  return { success: true };
}

// ---------- Үнэлгээ ----------

export async function submitReview(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversationId = numericId(str(formData, "conversation_id"));
  const rating = Number(str(formData, "rating"));
  const comment = str(formData, "comment");

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Одоор үнэлгээгээ сонгоно уу." };
  if (comment.length > 1000) return { error: "Сэтгэгдэл хэт урт байна.", values: { comment } };

  const conversation = conversationId !== null ? await getConversation(conversationId) : null;
  if (!conversation || (conversation.starter_id !== user.id && conversation.owner_id !== user.id)) {
    return { error: "Харилцан яриа олдсонгүй." };
  }

  // Мессеж солилцсон нь хангалтгүй нөхцөл байсан: "сайн уу" гэсэн нэг хариунаас
  // хойш хэн ч од өгч чаддаг байв. Үнэлгээ нь бодит тохиролцоог илэрхийлэх
  // ёстой тул хэлцэл тохирсон байхыг шаардана. Дараа нь цуцлагдсан ч болно —
  // ачаагаа хүргэчихээд зараа хаах нь хэвийн үйлдэл.
  if (conversation.accepted_at === null) {
    return { error: "Тохиролцоо хийсний дараа үнэлгээ өгөх боломжтой." };
  }

  const revieweeId = conversation.starter_id === user.id ? conversation.owner_id : conversation.starter_id;

  await upsertReview({
    conversationId: conversation.id,
    reviewerId: user.id,
    revieweeId,
    rating,
    comment: comment || null,
  });

  revalidatePath(conversationPath(conversation.id));
  return { success: true };
}

/**
 * Хонх нээгдэхэд мэдэгдлийг үзсэнд тооцно. Тоолуур нь layout дотор байдаг тул
 * дуудсан клиент нь дараа нь router.refresh() хийж шинэчилнэ.
 */
export async function markNotificationsRead(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await markReviewsRead(user.id);
}

// ---------- Бичиг баримтаар баталгаажуулах ----------

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

function fileError(file: File, required: boolean): string | null {
  if (file.size === 0) return required ? "Баримтын зургаа оруулна уу." : null;
  if (!EXT_BY_MIME[file.type]) return `${DOC_FORMATS_LABEL} хэлбэрийн файл оруулна уу.`;
  if (file.size > MAX_DOC_BYTES) return `Файл ${MAX_DOC_LABEL}-ээс хэтрэхгүй байх ёстой.`;
  return null;
}

function doc(formData: FormData, key: string): File {
  const value = formData.get(key);
  return value instanceof File ? value : new File([], "");
}

/**
 * Иргэний баримтыг хаалттай bucket-д байршуулж, хүсэлтийг хүлээлгэнэ.
 * Файл нь зөвхөн service role түлхүүрээр хандагдана — нийтэд нээлттэй URL үүсэхгүй.
 */
export async function submitVerification(
  _prev: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser("/settings/identity");

  const front = doc(formData, "front");
  const back = doc(formData, "back");
  const socialUrl = str(formData, "social_url");

  const fieldErrors: Record<string, string> = {};
  const frontError = fileError(front, true);
  const backError = fileError(back, false);
  if (frontError) fieldErrors.front = frontError;
  if (backError) fieldErrors.back = backError;
  if (socialUrl && !/^https:\/\/\S+\.\S+/.test(socialUrl)) {
    fieldErrors.social_url = "https:// -ээр эхэлсэн бүтэн холбоос оруулна уу.";
  }
  if (socialUrl.length > 200) fieldErrors.social_url = "Холбоос хэт урт байна.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values: { social_url: socialUrl } };

  const storage = createAdminClient().storage.from(IDENTITY_BUCKET);

  // Дараалал чухал: эхлээд БАЙРШУУЛНА, дараа нь DB, хамгийн эцэст хуучныг
  // цэвэрлэнэ. Эсрэгээр (хуучныг эхлээд устгавал) байршуулалт унахад DB нь
  // байхгүй файл руу заасан хэвээр үлдэж, хянагчид баримт нээгдэхээ болино.
  // Файлын нэрэнд цагийн тэмдэг байдаг тул хуучинтай мөргөлдөхгүй.
  const stamp = Date.now();
  const upload = async (file: File, side: string): Promise<string | null> => {
    if (file.size === 0) return null;
    const path = `${user.id}/${side}-${stamp}.${EXT_BY_MIME[file.type]}`;
    const { error } = await storage.upload(path, file, { contentType: file.type, upsert: true });
    if (error) throw error;
    return path;
  };

  let frontPath: string | null;
  let backPath: string | null;
  try {
    frontPath = await upload(front, "front");
    backPath = await upload(back, "back");
  } catch {
    return { error: "Файл байршуулж чадсангүй. Дараа дахин оролдоно уу." };
  }
  if (!frontPath) return { fieldErrors: { front: "Баримтын зургаа оруулна уу." } };

  await upsertVerification({
    userId: user.id,
    frontPath,
    backPath,
    socialUrl: socialUrl || null,
  });

  // Шинэ замууд DB-д бичигдсэний дараа л хуучин файлуудыг устгана. Хавтсыг
  // бүхэлд нь шүүж байгаа тул тасалдсан оролдлогын үлдэгдэл ч цэвэрлэгдэнэ.
  const keep = new Set([frontPath, backPath].filter((path): path is string => path !== null));
  const { data: files } = await storage.list(user.id);
  const stale = (files ?? [])
    .map((file) => `${user.id}/${file.name}`)
    .filter((path) => !keep.has(path));
  if (stale.length > 0) {
    // Цэвэрлэгээ унасан ч хүсэлт нь хүчинтэй — хэрэглэгчид алдаа заахгүй.
    const { error } = await storage.remove(stale);
    if (error) console.error("[verification] хуучин баримт устгаж чадсангүй:", error);
  }

  revalidatePath("/settings/identity");
  revalidatePath("/my");
  return { notice: "Хүсэлтийг хүлээн авлаа. 24-48 цагийн дотор шалгана." };
}

/** Хянагчийн шийдвэр. Файлууд нь шийдвэрийн дараа устна. */
export async function decideVerificationAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const userId = str(formData, "user_id");
  const decision = str(formData, "decision");
  const note = str(formData, "note");
  if (!UUID_RE.test(userId) || (decision !== "approved" && decision !== "rejected")) {
    redirect("/admin/verifications");
  }

  // Хэний баримт байсныг түүхэнд үлдээхийн тулд шийдвэрээс ӨМНӨ нэрийг уншина.
  const name = await getUserName(userId);
  const paths = await decideVerification(userId, decision, note || null);
  if (paths.length > 0) {
    await createAdminClient().storage.from(IDENTITY_BUCKET).remove(paths);
  }

  await logAdminAction({
    actor: admin,
    action: decision === "approved" ? "verification_approve" : "verification_reject",
    targetType: "user",
    targetId: userId,
    // Татгалзсан шалтгаан нь шийдвэрийн үндэслэл — түүхэнд хамт үлдэнэ.
    summary: [name, note].filter(Boolean).join(" · ") || null,
  });

  revalidatePath("/admin/verifications");
  revalidatePath("/my");
  redirect("/admin/verifications");
}

// ---------- Тохиргоо ----------

function isAvatarMime(type: string): boolean {
  return (AVATAR_MIME_TYPES as readonly string[]).includes(type);
}

/**
 * Шинэ зургийг тавиад хуучныг устгана. Хэрэглэгч бүрд нэг л файл үлдэнэ.
 * file нь null бол зөвхөн устгана.
 *
 * Дараалал нь чухал: эхлээд байршуулна — амжилтгүй болбол хуучин зураг нь
 * хэвээр үлдэж, профайл зурагтайгаа явна.
 */
async function replaceAvatar(
  userId: string,
  previousId: string | null,
  file: File | null
): Promise<string | null> {
  const publicId = file ? await uploadImage(file, `${AVATAR_FOLDER}/${userId}/${Date.now()}`) : null;

  if (previousId) {
    // Хуучин файл цэвэрлэгдэхгүй үлдсэн ч профайл нь аль хэдийн шинэчлэгдсэн
    // байх учиртай тул энд алдаа гаргахгүй.
    try {
      await deleteImage(previousId);
    } catch {}
  }
  return publicId;
}


/** Профайлын мэдээлэл. Имэйл нь Supabase Auth-д байдаг тул эндээс солигдохгүй. */
export async function updateProfile(
  _prev: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser("/settings");

  const name = str(formData, "name");
  const phoneCode = str(formData, "phone_code");
  const phoneNumber = str(formData, "phone");
  const country = str(formData, "country");
  const bio = str(formData, "bio");
  const values = { name, phone: phoneNumber, phone_code: phoneCode, country, bio };

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Нэрээ бүтэн оруулна уу.";
  if (name.length > 80) fieldErrors.name = "Нэр хэт урт байна.";
  if (country && !isCountryCode(country)) fieldErrors.country = "Жагсаалтаас улс сонгоно уу.";
  if (bio.length > BIO_MAX) fieldErrors.bio = `Танилцуулга ${BIO_MAX} тэмдэгтэд багтана.`;

  const avatar = doc(formData, "avatar");
  const removeAvatar = formData.get("avatar_remove") === "on";
  if (avatar.size > 0) {
    if (!isAvatarMime(avatar.type)) {
      fieldErrors.avatar = `${AVATAR_FORMATS_LABEL} хэлбэрийн зураг оруулна уу.`;
    } else if (avatar.size > MAX_AVATAR_BYTES) {
      fieldErrors.avatar = `Зураг ${MAX_AVATAR_LABEL}-ээс хэтрэхгүй байх ёстой.`;
    }
  }

  const joined = joinPhone(phoneCode, phoneNumber);
  if (!joined.ok) fieldErrors.phone = joined.error;
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  let avatarPath: string | null | undefined;
  if (avatar.size > 0 || removeAvatar) {
    try {
      avatarPath = await replaceAvatar(user.id, user.avatarPath, avatar.size > 0 ? avatar : null);
    } catch (error) {
      // Жинхэнэ шалтгааныг лог руу — хэрэглэгчид ойлгомжтой текст үлдээнэ
      console.error("[avatar] байршуулж чадсангүй:", error);
      return { error: "Зургийг байршуулж чадсангүй. Дараа дахин оролдоно уу.", values };
    }
  }

  await updateProfileRow(user.id, {
    name,
    phone: joined.ok ? joined.phone : null,
    country: country || null,
    bio: bio || null,
    avatarPath,
  });

  // Нэр нь зар, мессеж, үнэлгээ бүр дээр гардаг тул холбогдох хуудсуудыг шинэчилнэ
  revalidatePath("/settings");
  revalidatePath("/my");
  revalidatePath(`/users/${user.id}`);
  return { notice: "Профайлыг хадгаллаа.", values };
}

/** Нууц үг солих. Одоогийн нууц үгээр дахин баталгаажуулж байж солино. */
export async function changePassword(
  _prev: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser("/settings/security");

  const current = rawStr(formData, "current_password");
  const password = rawStr(formData, "password");
  const confirm = rawStr(formData, "password_confirm");

  const fieldErrors: Record<string, string> = {};
  if (current.length === 0) fieldErrors.current_password = "Одоогийн нууц үгээ оруулна уу.";
  if (password.length < 8) fieldErrors.password = "Нууц үг дор хаяж 8 тэмдэгт байх ёстой.";
  else if (password !== confirm) fieldErrors.password_confirm = "Хоёр нууц үг таарахгүй байна.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const supabase = await createClient();
  // Session хулгайлагдсан тохиолдолд нууц үгийг чөлөөтэй солихоос сэргийлнэ
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (signInError) {
    return { fieldErrors: { current_password: "Одоогийн нууц үг буруу байна." } };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authErrorMessage(error.message) };

  return { notice: "Нууц үг солигдлоо." };
}

/** Хэрэглэгч өөрийн бүртгэлээ бүр мөсөн устгах (GDPR). */
export async function deleteAccount(
  _prev: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser("/settings/privacy");

  if (str(formData, "confirm") !== DELETE_CONFIRM_WORD) {
    return { error: `Баталгаажуулахын тулд "${DELETE_CONFIRM_WORD}" гэж бичнэ үү.` };
  }

  const admin = createAdminClient();

  // Хүснэгтүүд cascade-аар цэвэрлэгддэг ч файлууд үлддэг тул эхлээд
  // хэрэглэгчийн хавтсуудыг хоёр талд нь устгана.
  const storage = admin.storage.from(IDENTITY_BUCKET);
  const { data: files } = await storage.list(user.id);
  if (files && files.length > 0) {
    await storage.remove(files.map((file) => `${user.id}/${file.name}`));
  }
  await deleteImagesByPrefix(`${AVATAR_FOLDER}/${user.id}/`);

  // auth.users устахад profiles болон түүнд холбоотой бүх зар, мессеж, үнэлгээ
  // cascade-аар дагаж устана (drizzle/0001_supabase_auth.sql).
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return { error: "Бүртгэл устгаж чадсангүй. Дараа дахин оролдоно уу." };
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
