"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireAdmin, requireUser } from "./auth";
import { createClient } from "./supabase/server";
import {
  addMessage,
  decideVerification,
  updateProfile as updateProfileRow,
  upsertVerification,
  closeListing as closeListingRow,
  createShipment as insertShipment,
  createTrip as insertTrip,
  deleteListing as deleteListingRow,
  getConversation,
  getOrCreateConversation,
  getShipment,
  getTrip,
  hasMessageFrom,
  reopenListing as reopenListingRow,
  updateShipment as updateShipmentRow,
  updateTrip as updateTripRow,
  upsertReview,
} from "./data";
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
import { findCity, isCountryCode } from "@/constant/cities";
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
  const next = str(formData, "next");
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
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

type Validated<T> = { ok: true; input: T } | { ok: false; state: FormState };

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
  } else if (travelDate < new Date().toISOString().slice(0, 10)) {
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

  revalidatePath("/trips");
  redirect(`/trips/${id}`);
}

export async function updateTrip(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = Number(str(formData, "id"));
  if (!Number.isInteger(id)) return { error: "Зар олдсонгүй." };

  const result = validateTrip(formData);
  if (!result.ok) return result.state;

  if (!(await updateTripRow(id, user.id, result.input))) return { error: "Зар олдсонгүй." };

  revalidatePath("/trips");
  revalidatePath(`/trips/${id}`);
  redirect(`/trips/${id}`);
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

  revalidatePath("/shipments");
  redirect(`/shipments/${id}`);
}

export async function updateShipment(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = Number(str(formData, "id"));
  if (!Number.isInteger(id)) return { error: "Зар олдсонгүй." };

  const result = validateShipment(formData);
  if (!result.ok) return result.state;

  if (!(await updateShipmentRow(id, user.id, result.input))) return { error: "Зар олдсонгүй." };

  revalidatePath("/shipments");
  revalidatePath(`/shipments/${id}`);
  redirect(`/shipments/${id}`);
}

// ---------- Зар хаах / нээх / устгах ----------

function listingParams(formData: FormData): { type: ListingType; id: number } | null {
  const type = str(formData, "type");
  const id = Number(str(formData, "id"));
  if ((type !== "trip" && type !== "shipment") || !Number.isInteger(id)) return null;
  return { type: type as ListingType, id };
}

function revalidateListing(type: ListingType, id: number): void {
  revalidatePath("/my");
  revalidatePath(type === "trip" ? "/trips" : "/shipments");
  revalidatePath(type === "trip" ? `/trips/${id}` : `/shipments/${id}`);
}

export async function closeListing(formData: FormData): Promise<void> {
  const user = await requireUser("/my");
  const params = listingParams(formData);
  if (params) {
    await closeListingRow(params.type, params.id, user.id);
    revalidateListing(params.type, params.id);
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
      if (!trip || trip.travel_date < new Date().toISOString().slice(0, 10)) redirect("/my");
    }
    await reopenListingRow(params.type, params.id, user.id);
    revalidateListing(params.type, params.id);
  }
  redirect("/my");
}

export async function deleteListing(formData: FormData): Promise<void> {
  const user = await requireUser("/my");
  const params = listingParams(formData);
  if (params) {
    await deleteListingRow(params.type, params.id, user.id);
    revalidateListing(params.type, params.id);
  }
  redirect("/my");
}

// ---------- Мессеж ----------

export async function sendMessage(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const body = str(formData, "body");
  if (body.length === 0) return { error: "Мессежээ бичнэ үү." };
  if (body.length > 2000) return { error: "Мессеж хэт урт байна.", values: { body } };

  const conversationIdRaw = str(formData, "conversation_id");
  if (conversationIdRaw) {
    // Байгаа харилцан яриан дахь хариу
    const conversationId = Number(conversationIdRaw);
    const conversation = Number.isInteger(conversationId) ? await getConversation(conversationId) : null;
    if (!conversation || (conversation.starter_id !== user.id && conversation.owner_id !== user.id)) {
      return { error: "Харилцан яриа олдсонгүй." };
    }
    await addMessage(conversation.id, user.id, body);
    revalidatePath(`/messages/${conversation.id}`);
    revalidatePath("/messages");
    return {};
  }

  // Зарын хуудаснаас шинэ яриа эхлүүлэх
  const type = str(formData, "listing_type");
  const listingId = Number(str(formData, "listing_id"));
  if ((type !== "trip" && type !== "shipment") || !Number.isInteger(listingId)) {
    return { error: "Зар олдсонгүй." };
  }
  const listing = type === "trip" ? await getTrip(listingId) : await getShipment(listingId);
  if (!listing) return { error: "Зар олдсонгүй." };
  if (listing.user_id === user.id) return { error: "Өөрийн зар руу мессеж илгээх боломжгүй." };

  const conversationId = await getOrCreateConversation(type as ListingType, listingId, user.id, listing.user_id);
  await addMessage(conversationId, user.id, body);
  revalidatePath("/messages");
  redirect(`/messages/${conversationId}`);
}

// ---------- Үнэлгээ ----------

export async function submitReview(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversationId = Number(str(formData, "conversation_id"));
  const rating = Number(str(formData, "rating"));
  const comment = str(formData, "comment");

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Одоор үнэлгээгээ сонгоно уу." };
  if (comment.length > 1000) return { error: "Сэтгэгдэл хэт урт байна.", values: { comment } };

  const conversation = Number.isInteger(conversationId) ? await getConversation(conversationId) : null;
  if (!conversation || (conversation.starter_id !== user.id && conversation.owner_id !== user.id)) {
    return { error: "Харилцан яриа олдсонгүй." };
  }

  const revieweeId = conversation.starter_id === user.id ? conversation.owner_id : conversation.starter_id;
  // Нөгөө тал нь бодитоор харилцсан байж гэмээнэ үнэлгээ авна
  if (!(await hasMessageFrom(conversation.id, revieweeId))) {
    return { error: "Нөгөө тал хариу бичсэний дараа үнэлгээ өгөх боломжтой." };
  }

  await upsertReview({
    conversationId: conversation.id,
    reviewerId: user.id,
    revieweeId,
    rating,
    comment: comment || null,
  });

  revalidatePath(`/messages/${conversation.id}`);
  return { success: true };
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

  // Өмнөх оролдлогын файлууд үлдэхээс сэргийлж эхлээд цэвэрлэнэ
  const { data: existing } = await storage.list(user.id);
  if (existing && existing.length > 0) {
    await storage.remove(existing.map((file) => `${user.id}/${file.name}`));
  }

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

  revalidatePath("/settings/identity");
  revalidatePath("/my");
  return { notice: "Хүсэлтийг хүлээн авлаа. 24-48 цагийн дотор шалгана." };
}

/** Хянагчийн шийдвэр. Файлууд нь шийдвэрийн дараа устна. */
export async function decideVerificationAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const userId = str(formData, "user_id");
  const decision = str(formData, "decision");
  const note = str(formData, "note");
  if (!UUID_RE.test(userId) || (decision !== "approved" && decision !== "rejected")) {
    redirect("/admin/verifications");
  }

  const paths = await decideVerification(userId, decision, note || null);
  if (paths.length > 0) {
    await createAdminClient().storage.from(IDENTITY_BUCKET).remove(paths);
  }

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
    } catch {
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
