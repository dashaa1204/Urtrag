import { cache } from "react";
import { and, count, desc, eq, gte, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "./db";
import {
  conversations,
  identityVerifications,
  messages,
  profiles,
  reviews,
  shipments,
  trips,
} from "./db/schema";
import { formatDate, formatKg } from "./format";
import type {
  Conversation,
  ConversationPreview,
  ListingType,
  Message,
  PendingVerification,
  Review,
  Shipment,
  Trip,
  UserId,
  UserProfile,
  UserRating,
  Verification,
  VerificationStatus,
} from "@/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Views нь snake_case талбар хүлээдэг тул сонголтуудыг тэр хэлбэрээр нь буцаана. */
const tripFields = {
  id: trips.id,
  user_id: trips.userId,
  from_country: trips.fromCountry,
  to_country: trips.toCountry,
  from_city: trips.fromCity,
  to_city: trips.toCity,
  travel_date: trips.travelDate,
  available_kg: trips.availableKg,
  price_per_kg: trips.pricePerKg,
  notes: trips.notes,
  status: trips.status,
  created_at: trips.createdAt,
  user_name: profiles.name,
};

const shipmentFields = {
  id: shipments.id,
  user_id: shipments.userId,
  from_country: shipments.fromCountry,
  to_country: shipments.toCountry,
  from_city: shipments.fromCity,
  to_city: shipments.toCity,
  weight_kg: shipments.weightKg,
  ready_date: shipments.readyDate,
  deadline_date: shipments.deadlineDate,
  description: shipments.description,
  offer_price: shipments.offerPrice,
  status: shipments.status,
  created_at: shipments.createdAt,
  user_name: profiles.name,
};

// ---------- Аялал ----------

/** Хоёулаа сонголттой — зөвхөн "хаанаас" эсвэл зөвхөн "хаашаа"-гаар нь ч шүүнэ. */
export interface RouteFilter {
  fromCountry?: string;
  toCountry?: string;
}

export async function listTrips(filter: RouteFilter = {}): Promise<Trip[]> {
  return db
    .select(tripFields)
    .from(trips)
    .innerJoin(profiles, eq(profiles.id, trips.userId))
    .where(
      and(
        eq(trips.status, "active"),
        gte(trips.travelDate, todayIso()),
        filter.fromCountry ? eq(trips.fromCountry, filter.fromCountry) : undefined,
        filter.toCountry ? eq(trips.toCountry, filter.toCountry) : undefined
      )
    )
    .orderBy(trips.travelDate);
}

export async function latestTrips(limit: number): Promise<Trip[]> {
  return db
    .select(tripFields)
    .from(trips)
    .innerJoin(profiles, eq(profiles.id, trips.userId))
    .where(and(eq(trips.status, "active"), gte(trips.travelDate, todayIso())))
    .orderBy(desc(trips.createdAt))
    .limit(limit);
}

/** Хуудас ба generateMetadata хоёулаа дууддаг тул нэг хүсэлтэд нэг л удаа гүйцэтгэнэ. */
export const getTrip = cache(async (id: number): Promise<Trip | null> => {
  const [row] = await db
    .select(tripFields)
    .from(trips)
    .innerJoin(profiles, eq(profiles.id, trips.userId))
    .where(eq(trips.id, id))
    .limit(1);
  return row ?? null;
});

export async function createTrip(input: {
  userId: UserId;
  fromCountry: string;
  toCountry: string;
  fromCity: string;
  toCity: string;
  travelDate: string;
  availableKg: number;
  pricePerKg: number;
  notes: string | null;
}): Promise<number> {
  const [row] = await db
    .insert(trips)
    .values({
      userId: input.userId,
      fromCountry: input.fromCountry,
      toCountry: input.toCountry,
      fromCity: input.fromCity,
      toCity: input.toCity,
      travelDate: input.travelDate,
      availableKg: input.availableKg,
      pricePerKg: input.pricePerKg,
      notes: input.notes,
    })
    .returning({ id: trips.id });
  return row.id;
}

export async function myTrips(userId: UserId): Promise<Trip[]> {
  return db
    .select(tripFields)
    .from(trips)
    .innerJoin(profiles, eq(profiles.id, trips.userId))
    .where(eq(trips.userId, userId))
    .orderBy(desc(trips.createdAt));
}

export async function updateTrip(
  id: number,
  userId: UserId,
  input: {
    fromCountry: string;
    toCountry: string;
    fromCity: string;
    toCity: string;
    travelDate: string;
    availableKg: number;
    pricePerKg: number;
    notes: string | null;
  }
): Promise<boolean> {
  const rows = await db
    .update(trips)
    .set({
      fromCountry: input.fromCountry,
      toCountry: input.toCountry,
      fromCity: input.fromCity,
      toCity: input.toCity,
      travelDate: input.travelDate,
      availableKg: input.availableKg,
      pricePerKg: input.pricePerKg,
      notes: input.notes,
    })
    .where(and(eq(trips.id, id), eq(trips.userId, userId)))
    .returning({ id: trips.id });
  return rows.length > 0;
}

// ---------- Ачаа ----------

export async function listShipments(filter: RouteFilter = {}): Promise<Shipment[]> {
  return db
    .select(shipmentFields)
    .from(shipments)
    .innerJoin(profiles, eq(profiles.id, shipments.userId))
    .where(
      and(
        eq(shipments.status, "active"),
        filter.fromCountry ? eq(shipments.fromCountry, filter.fromCountry) : undefined,
        filter.toCountry ? eq(shipments.toCountry, filter.toCountry) : undefined
      )
    )
    .orderBy(desc(shipments.createdAt));
}

export async function latestShipments(limit: number): Promise<Shipment[]> {
  return db
    .select(shipmentFields)
    .from(shipments)
    .innerJoin(profiles, eq(profiles.id, shipments.userId))
    .where(eq(shipments.status, "active"))
    .orderBy(desc(shipments.createdAt))
    .limit(limit);
}

export const getShipment = cache(async (id: number): Promise<Shipment | null> => {
  const [row] = await db
    .select(shipmentFields)
    .from(shipments)
    .innerJoin(profiles, eq(profiles.id, shipments.userId))
    .where(eq(shipments.id, id))
    .limit(1);
  return row ?? null;
});

export async function createShipment(input: {
  userId: UserId;
  fromCountry: string;
  toCountry: string;
  fromCity: string;
  toCity: string;
  weightKg: number;
  readyDate: string | null;
  deadlineDate: string | null;
  description: string;
  offerPrice: number | null;
}): Promise<number> {
  const [row] = await db
    .insert(shipments)
    .values({
      userId: input.userId,
      fromCountry: input.fromCountry,
      toCountry: input.toCountry,
      fromCity: input.fromCity,
      toCity: input.toCity,
      weightKg: input.weightKg,
      readyDate: input.readyDate,
      deadlineDate: input.deadlineDate,
      description: input.description,
      offerPrice: input.offerPrice,
    })
    .returning({ id: shipments.id });
  return row.id;
}

export async function myShipments(userId: UserId): Promise<Shipment[]> {
  return db
    .select(shipmentFields)
    .from(shipments)
    .innerJoin(profiles, eq(profiles.id, shipments.userId))
    .where(eq(shipments.userId, userId))
    .orderBy(desc(shipments.createdAt));
}

export async function updateShipment(
  id: number,
  userId: UserId,
  input: {
    fromCountry: string;
    toCountry: string;
    fromCity: string;
    toCity: string;
    weightKg: number;
    readyDate: string | null;
    deadlineDate: string | null;
    description: string;
    offerPrice: number | null;
  }
): Promise<boolean> {
  const rows = await db
    .update(shipments)
    .set({
      fromCountry: input.fromCountry,
      toCountry: input.toCountry,
      fromCity: input.fromCity,
      toCity: input.toCity,
      weightKg: input.weightKg,
      readyDate: input.readyDate,
      deadlineDate: input.deadlineDate,
      description: input.description,
      offerPrice: input.offerPrice,
    })
    .where(and(eq(shipments.id, id), eq(shipments.userId, userId)))
    .returning({ id: shipments.id });
  return rows.length > 0;
}

// ---------- Зар хаах / нээх / устгах ----------

async function setListingStatus(
  type: ListingType,
  id: number,
  userId: UserId,
  status: "active" | "closed"
): Promise<boolean> {
  if (type === "trip") {
    const rows = await db
      .update(trips)
      .set({ status })
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .returning({ id: trips.id });
    return rows.length > 0;
  }
  const rows = await db
    .update(shipments)
    .set({ status })
    .where(and(eq(shipments.id, id), eq(shipments.userId, userId)))
    .returning({ id: shipments.id });
  return rows.length > 0;
}

export function closeListing(type: ListingType, id: number, userId: UserId): Promise<boolean> {
  return setListingStatus(type, id, userId, "closed");
}

export function reopenListing(type: ListingType, id: number, userId: UserId): Promise<boolean> {
  return setListingStatus(type, id, userId, "active");
}

export async function deleteListing(type: ListingType, id: number, userId: UserId): Promise<boolean> {
  if (type === "trip") {
    const rows = await db
      .delete(trips)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .returning({ id: trips.id });
    return rows.length > 0;
  }
  const rows = await db
    .delete(shipments)
    .where(and(eq(shipments.id, id), eq(shipments.userId, userId)))
    .returning({ id: shipments.id });
  return rows.length > 0;
}

// ---------- Харилцан яриа ба мессеж ----------

export async function getOrCreateConversation(
  type: ListingType,
  listingId: number,
  starterId: UserId,
  ownerId: UserId
): Promise<number> {
  const [existing] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.listingType, type),
        eq(conversations.listingId, listingId),
        eq(conversations.starterId, starterId)
      )
    )
    .limit(1);
  if (existing) return existing.id;

  const [row] = await db
    .insert(conversations)
    .values({ listingType: type, listingId, starterId, ownerId })
    .onConflictDoNothing()
    .returning({ id: conversations.id });
  if (row) return row.id;

  // Зэрэгцээ хүсэлт давхцвал onConflictDoNothing юу ч буцаахгүй тул дахин уншина
  const [raced] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.listingType, type),
        eq(conversations.listingId, listingId),
        eq(conversations.starterId, starterId)
      )
    )
    .limit(1);
  return raced.id;
}

export async function getConversation(id: number): Promise<Conversation | null> {
  const [row] = await db
    .select({
      id: conversations.id,
      listing_type: conversations.listingType,
      listing_id: conversations.listingId,
      starter_id: conversations.starterId,
      owner_id: conversations.ownerId,
      created_at: conversations.createdAt,
    })
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return row ?? null;
}

export async function getUserName(id: UserId): Promise<string | null> {
  const [row] = await db.select({ name: profiles.name }).from(profiles).where(eq(profiles.id, id)).limit(1);
  return row?.name ?? null;
}

export async function listConversations(userId: UserId): Promise<ConversationPreview[]> {
  const convs = await db
    .select({
      id: conversations.id,
      listing_type: conversations.listingType,
      listing_id: conversations.listingId,
      starter_id: conversations.starterId,
      owner_id: conversations.ownerId,
      created_at: conversations.createdAt,
    })
    .from(conversations)
    .where(or(eq(conversations.starterId, userId), eq(conversations.ownerId, userId)));

  if (convs.length === 0) return [];

  const ids = convs.map((c) => c.id);
  const otherIds = [...new Set(convs.map((c) => (c.starter_id === userId ? c.owner_id : c.starter_id)))];
  const tripIds = convs.filter((c) => c.listing_type === "trip").map((c) => c.listing_id);
  const shipmentIds = convs.filter((c) => c.listing_type === "shipment").map((c) => c.listing_id);

  // Хамааралт (correlated) subquery бичихээс зайлсхийв: drizzle нь select доторх
  // raw SQL-д гадна талын баганыг хүснэгтийн нэргүй буулгадаг тул subquery дотор
  // буруу багана руу заадаг. Тусад нь багцлан уншаад JS дээр нийлүүлнэ.
  const [lastMessages, unreadRows, names, tripRows, shipmentRows] = await Promise.all([
    db
      .selectDistinctOn([messages.conversationId], {
        conversationId: messages.conversationId,
        body: messages.body,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(inArray(messages.conversationId, ids))
      .orderBy(messages.conversationId, desc(messages.id)),
    db
      .select({ conversationId: messages.conversationId, unread: count() })
      .from(messages)
      .where(
        and(inArray(messages.conversationId, ids), ne(messages.senderId, userId), isNull(messages.readAt))
      )
      .groupBy(messages.conversationId),
    db
      .select({ id: profiles.id, name: profiles.name, avatarPath: profiles.avatarPath })
      .from(profiles)
      .where(inArray(profiles.id, otherIds)),
    tripIds.length
      ? db
          .select({ id: trips.id, travelDate: trips.travelDate })
          .from(trips)
          .where(inArray(trips.id, tripIds))
      : [],
    shipmentIds.length
      ? db
          .select({ id: shipments.id, weightKg: shipments.weightKg })
          .from(shipments)
          .where(inArray(shipments.id, shipmentIds))
      : [],
  ]);

  const lastByConv = new Map(lastMessages.map((m) => [m.conversationId, m]));
  const unreadByConv = new Map(unreadRows.map((r) => [r.conversationId, r.unread]));
  const nameById = new Map(names.map((p) => [p.id, p.name]));
  const avatarById = new Map(names.map((p) => [p.id, p.avatarPath]));
  const tripById = new Map(tripRows.map((t) => [t.id, t]));
  const shipmentById = new Map(shipmentRows.map((s) => [s.id, s]));

  return convs
    .map((c) => {
      const last = lastByConv.get(c.id);
      const otherId = c.starter_id === userId ? c.owner_id : c.starter_id;

      let listing_title: string;
      if (c.listing_type === "trip") {
        const trip = tripById.get(c.listing_id);
        listing_title = trip ? `Аялал · ${formatDate(trip.travelDate)}` : "Аялал";
      } else {
        const shipment = shipmentById.get(c.listing_id);
        listing_title = shipment ? `Ачаа · ${formatKg(shipment.weightKg)}` : "Ачаа";
      }

      return {
        ...c,
        other_name: nameById.get(otherId) ?? "Хэрэглэгч",
        other_avatar: avatarById.get(otherId) ?? null,
        listing_title,
        last_body: last?.body ?? null,
        last_at: last?.createdAt ?? null,
        unread: unreadByConv.get(c.id) ?? 0,
      };
    })
    .sort((a, b) => (b.last_at ?? b.created_at).getTime() - (a.last_at ?? a.created_at).getTime());
}

export async function listMessages(conversationId: number): Promise<Message[]> {
  return db
    .select({
      id: messages.id,
      conversation_id: messages.conversationId,
      sender_id: messages.senderId,
      body: messages.body,
      created_at: messages.createdAt,
      read_at: messages.readAt,
      sender_name: profiles.name,
    })
    .from(messages)
    .innerJoin(profiles, eq(profiles.id, messages.senderId))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.id);
}

export async function addMessage(conversationId: number, senderId: UserId, body: string): Promise<void> {
  await db.insert(messages).values({ conversationId, senderId, body });
}

export async function markConversationRead(conversationId: number, readerId: UserId): Promise<void> {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(eq(messages.conversationId, conversationId), ne(messages.senderId, readerId), isNull(messages.readAt))
    );
}

export async function hasMessageFrom(conversationId: number, senderId: UserId): Promise<boolean> {
  const [row] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(and(eq(messages.conversationId, conversationId), eq(messages.senderId, senderId)))
    .limit(1);
  return row !== undefined;
}

// ---------- Үнэлгээ ----------

const reviewFields = {
  id: reviews.id,
  conversation_id: reviews.conversationId,
  reviewer_id: reviews.reviewerId,
  reviewee_id: reviews.revieweeId,
  rating: reviews.rating,
  comment: reviews.comment,
  created_at: reviews.createdAt,
  reviewer_name: profiles.name,
};

export async function upsertReview(input: {
  conversationId: number;
  reviewerId: UserId;
  revieweeId: UserId;
  rating: number;
  comment: string | null;
}): Promise<void> {
  await db
    .insert(reviews)
    .values({
      conversationId: input.conversationId,
      reviewerId: input.reviewerId,
      revieweeId: input.revieweeId,
      rating: input.rating,
      comment: input.comment,
    })
    .onConflictDoUpdate({
      target: [reviews.conversationId, reviews.reviewerId],
      set: { rating: input.rating, comment: input.comment, createdAt: new Date() },
    });
}

export async function getOwnReview(conversationId: number, reviewerId: UserId): Promise<Review | null> {
  const [row] = await db
    .select(reviewFields)
    .from(reviews)
    .innerJoin(profiles, eq(profiles.id, reviews.reviewerId))
    .where(and(eq(reviews.conversationId, conversationId), eq(reviews.reviewerId, reviewerId)))
    .limit(1);
  return row ?? null;
}

export async function getUserRating(userId: UserId): Promise<UserRating> {
  const [row] = await db
    .select({
      avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)::float8`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.revieweeId, userId));
  return { avg: row?.avg ?? 0, count: row?.count ?? 0 };
}

export async function listUserReviews(userId: UserId): Promise<Review[]> {
  return db
    .select(reviewFields)
    .from(reviews)
    .innerJoin(profiles, eq(profiles.id, reviews.reviewerId))
    .where(eq(reviews.revieweeId, userId))
    .orderBy(desc(reviews.createdAt));
}

/** Хонхны цэсэнд харуулах — хэрэглэгчийн хүлээж авсан сүүлийн үнэлгээнүүд. */
export async function recentReviews(userId: UserId, limit: number): Promise<Review[]> {
  return db
    .select(reviewFields)
    .from(reviews)
    .innerJoin(profiles, eq(profiles.id, reviews.reviewerId))
    .where(eq(reviews.revieweeId, userId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

// ---------- Хэрэглэгчийн профайл ----------

export const getUserProfile = cache(async (id: UserId): Promise<UserProfile | null> => {
  const [row] = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      country: profiles.country,
      bio: profiles.bio,
      avatar_path: profiles.avatarPath,
      created_at: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return row ?? null;
});

/** Тохиргооны хуудсаас профайл засах. Имэйл нь Supabase Auth-д хадгалагдана. */
export async function updateProfile(
  userId: UserId,
  input: {
    name: string;
    phone: string | null;
    country: string | null;
    bio: string | null;
    avatarPath?: string | null;
  }
): Promise<void> {
  await db.update(profiles).set(input).where(eq(profiles.id, userId));
}

export async function userActiveTrips(userId: UserId): Promise<Trip[]> {
  return db
    .select(tripFields)
    .from(trips)
    .innerJoin(profiles, eq(profiles.id, trips.userId))
    .where(and(eq(trips.userId, userId), eq(trips.status, "active"), gte(trips.travelDate, todayIso())))
    .orderBy(trips.travelDate);
}

export async function userActiveShipments(userId: UserId): Promise<Shipment[]> {
  return db
    .select(shipmentFields)
    .from(shipments)
    .innerJoin(profiles, eq(profiles.id, shipments.userId))
    .where(and(eq(shipments.userId, userId), eq(shipments.status, "active")))
    .orderBy(desc(shipments.createdAt));
}

// ---------- Бичиг баримтын баталгаажуулалт ----------

const verificationFields = {
  status: identityVerifications.status,
  social_url: identityVerifications.socialUrl,
  note: identityVerifications.note,
  submitted_at: identityVerifications.submittedAt,
  reviewed_at: identityVerifications.reviewedAt,
};

export const getVerification = cache(async (userId: UserId): Promise<Verification | null> => {
  const [row] = await db
    .select(verificationFields)
    .from(identityVerifications)
    .where(eq(identityVerifications.userId, userId))
    .limit(1);
  return row ?? null;
});

/** Дахин илгээвэл өмнөх шийдвэрийг цэвэрлээд шинээр хүлээлгэнэ. */
export async function upsertVerification(input: {
  userId: UserId;
  frontPath: string;
  backPath: string | null;
  socialUrl: string | null;
}): Promise<void> {
  const row = {
    status: "pending" as const,
    frontPath: input.frontPath,
    backPath: input.backPath,
    socialUrl: input.socialUrl,
    note: null,
    submittedAt: new Date(),
    reviewedAt: null,
  };
  await db
    .insert(identityVerifications)
    .values({ userId: input.userId, ...row })
    .onConflictDoUpdate({ target: identityVerifications.userId, set: row });
}

export async function listPendingVerifications(): Promise<PendingVerification[]> {
  return db
    .select({
      ...verificationFields,
      user_id: identityVerifications.userId,
      name: profiles.name,
      front_path: identityVerifications.frontPath,
      back_path: identityVerifications.backPath,
    })
    .from(identityVerifications)
    .innerJoin(profiles, eq(profiles.id, identityVerifications.userId))
    .where(eq(identityVerifications.status, "pending"))
    .orderBy(identityVerifications.submittedAt);
}

/**
 * Шийдвэр бичиж, баримтын замуудыг цэвэрлэнэ. Буцаах утга нь устгах ёстой
 * файлуудын зам (Storage-оос дуудагч тал нь устгана).
 */
export async function decideVerification(
  userId: UserId,
  status: Exclude<VerificationStatus, "pending">,
  note: string | null
): Promise<string[]> {
  // RETURNING нь ШИНЭ мөрийг буцаадаг тул замуудыг цэвэрлэхээс өмнө уншина.
  const [row] = await db
    .select({ front: identityVerifications.frontPath, back: identityVerifications.backPath })
    .from(identityVerifications)
    .where(eq(identityVerifications.userId, userId))
    .limit(1);

  await db
    .update(identityVerifications)
    .set({ status, note, reviewedAt: new Date(), frontPath: null, backPath: null })
    .where(eq(identityVerifications.userId, userId));

  return row ? [row.front, row.back].filter((path): path is string => Boolean(path)) : [];
}

export async function unreadCount(userId: UserId): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`COUNT(*)::int` })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .where(
      and(
        or(eq(conversations.starterId, userId), eq(conversations.ownerId, userId)),
        ne(messages.senderId, userId),
        isNull(messages.readAt)
      )
    );
  return row?.n ?? 0;
}
