"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  requireUser,
  verifyPassword,
} from "./auth";
import {
  addMessage,
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
import { isDirection } from "@/constant/directions";
import type { Direction, FormState, ListingType } from "@/types";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

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

// ---------- Нэвтрэлт ----------

export async function signup(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const phone = str(formData, "phone");
  const password = rawStr(formData, "password");
  const terms = formData.get("terms") === "on";
  const values = { name, email, phone, terms: terms ? "on" : "" };

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Нэрээ бүтэн оруулна уу.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Имэйл хаяг буруу байна.";
  if (password.length < 8) fieldErrors.password = "Нууц үг дор хаяж 8 тэмдэгт байх ёстой.";
  if (!terms) fieldErrors.terms = "Хариуцлагын тайлбарыг зөвшөөрнө үү.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  let userId: number;
  try {
    const result = db
      .prepare("INSERT INTO users (email, password_hash, name, phone, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(email, hashPassword(password), name, phone || null, new Date().toISOString());
    userId = Number(result.lastInsertRowid);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return { fieldErrors: { email: "Энэ имэйлээр бүртгэл үүссэн байна. Нэвтэрч орно уу." }, values };
    }
    throw error;
  }

  await createSession(userId);
  redirect(safeNext(formData, "/"));
}

export async function login(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const email = str(formData, "email").toLowerCase();
  const password = rawStr(formData, "password");
  const values = { email };

  if (!EMAIL_RE.test(email) || password.length === 0) {
    return { error: "Имэйл болон нууц үгээ оруулна уу.", values };
  }

  const user = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email) as
    | { id: number; password_hash: string }
    | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "Имэйл эсвэл нууц үг буруу байна.", values };
  }

  await createSession(user.id);
  redirect(safeNext(formData, "/"));
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}

// ---------- Аялалын зар ----------

type Validated<T> = { ok: true; input: T } | { ok: false; state: FormState };

interface TripInput {
  direction: Direction;
  fromCity: string | null;
  toCity: string | null;
  travelDate: string;
  availableKg: number;
  pricePerKg: number;
  notes: string | null;
}

function validateTrip(formData: FormData): Validated<TripInput> {
  const direction = str(formData, "direction");
  const fromCity = str(formData, "from_city");
  const toCity = str(formData, "to_city");
  const travelDate = str(formData, "travel_date");
  const availableKg = Number(str(formData, "available_kg"));
  const pricePerKg = Number(str(formData, "price_per_kg"));
  const notes = str(formData, "notes");
  const values = {
    direction,
    from_city: fromCity,
    to_city: toCity,
    travel_date: travelDate,
    available_kg: str(formData, "available_kg"),
    price_per_kg: str(formData, "price_per_kg"),
    notes,
  };

  const fieldErrors: Record<string, string> = {};
  if (!isDirection(direction)) fieldErrors.direction = "Чиглэлээ сонгоно уу.";
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
  if (Object.keys(fieldErrors).length > 0) return { ok: false, state: { fieldErrors, values } };

  return {
    ok: true,
    input: {
      direction: direction as Direction,
      fromCity: fromCity || null,
      toCity: toCity || null,
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

  const id = insertTrip({ userId: user.id, ...result.input });

  revalidatePath("/trips");
  redirect(`/trips/${id}`);
}

export async function updateTrip(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = Number(str(formData, "id"));
  if (!Number.isInteger(id)) return { error: "Зар олдсонгүй." };

  const result = validateTrip(formData);
  if (!result.ok) return result.state;

  if (!updateTripRow(id, user.id, result.input)) return { error: "Зар олдсонгүй." };

  revalidatePath("/trips");
  revalidatePath(`/trips/${id}`);
  redirect(`/trips/${id}`);
}

// ---------- Ачааны зар ----------

interface ShipmentInput {
  direction: Direction;
  fromCity: string | null;
  toCity: string | null;
  weightKg: number;
  readyDate: string | null;
  deadlineDate: string | null;
  description: string;
  offerPrice: number | null;
}

function validateShipment(formData: FormData): Validated<ShipmentInput> {
  const direction = str(formData, "direction");
  const fromCity = str(formData, "from_city");
  const toCity = str(formData, "to_city");
  const weightKg = Number(str(formData, "weight_kg"));
  const readyDate = str(formData, "ready_date");
  const deadlineDate = str(formData, "deadline_date");
  const description = str(formData, "description");
  const offerPriceRaw = str(formData, "offer_price");
  const offerPrice = offerPriceRaw ? Number(offerPriceRaw) : null;
  const values = {
    direction,
    from_city: fromCity,
    to_city: toCity,
    weight_kg: str(formData, "weight_kg"),
    ready_date: readyDate,
    deadline_date: deadlineDate,
    description,
    offer_price: offerPriceRaw,
  };

  const fieldErrors: Record<string, string> = {};
  if (!isDirection(direction)) fieldErrors.direction = "Чиглэлээ сонгоно уу.";
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
  if (Object.keys(fieldErrors).length > 0) return { ok: false, state: { fieldErrors, values } };

  return {
    ok: true,
    input: {
      direction: direction as Direction,
      fromCity: fromCity || null,
      toCity: toCity || null,
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

  const id = insertShipment({ userId: user.id, ...result.input });

  revalidatePath("/shipments");
  redirect(`/shipments/${id}`);
}

export async function updateShipment(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = Number(str(formData, "id"));
  if (!Number.isInteger(id)) return { error: "Зар олдсонгүй." };

  const result = validateShipment(formData);
  if (!result.ok) return result.state;

  if (!updateShipmentRow(id, user.id, result.input)) return { error: "Зар олдсонгүй." };

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
    closeListingRow(params.type, params.id, user.id);
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
      const trip = getTrip(params.id);
      if (!trip || trip.travel_date < new Date().toISOString().slice(0, 10)) redirect("/my");
    }
    reopenListingRow(params.type, params.id, user.id);
    revalidateListing(params.type, params.id);
  }
  redirect("/my");
}

export async function deleteListing(formData: FormData): Promise<void> {
  const user = await requireUser("/my");
  const params = listingParams(formData);
  if (params) {
    deleteListingRow(params.type, params.id, user.id);
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
    const conversation = Number.isInteger(conversationId) ? getConversation(conversationId) : null;
    if (!conversation || (conversation.starter_id !== user.id && conversation.owner_id !== user.id)) {
      return { error: "Харилцан яриа олдсонгүй." };
    }
    addMessage(conversation.id, user.id, body);
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
  const listing = type === "trip" ? getTrip(listingId) : getShipment(listingId);
  if (!listing) return { error: "Зар олдсонгүй." };
  if (listing.user_id === user.id) return { error: "Өөрийн зар руу мессеж илгээх боломжгүй." };

  const conversationId = getOrCreateConversation(type as ListingType, listingId, user.id, listing.user_id);
  addMessage(conversationId, user.id, body);
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

  const conversation = Number.isInteger(conversationId) ? getConversation(conversationId) : null;
  if (!conversation || (conversation.starter_id !== user.id && conversation.owner_id !== user.id)) {
    return { error: "Харилцан яриа олдсонгүй." };
  }

  const revieweeId = conversation.starter_id === user.id ? conversation.owner_id : conversation.starter_id;
  // Нөгөө тал нь бодитоор харилцсан байж гэмээнэ үнэлгээ авна
  if (!hasMessageFrom(conversation.id, revieweeId)) {
    return { error: "Нөгөө тал хариу бичсэний дараа үнэлгээ өгөх боломжтой." };
  }

  upsertReview({
    conversationId: conversation.id,
    reviewerId: user.id,
    revieweeId,
    rating,
    comment: comment || null,
  });

  revalidatePath(`/messages/${conversation.id}`);
  return { success: true };
}
