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
import { conversationPath } from "./nav";
import { fitsCapacity, shipmentSummary, todayIso, tripSummary, type ListingSummary } from "./listing";
import type {
  Conversation,
  ConversationPreview,
  ListingDeal,
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

/**
 * Views нь snake_case талбар хүлээдэг тул сонголтуудыг тэр хэлбэрээр нь буцаана.
 * Хянагчийн жагсаалт (lib/admin-data.ts) мөн эдгээрийг дахин ашиглана.
 */
export const tripFields = {
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
  user_avatar: profiles.avatarPath,
};

export const shipmentFields = {
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
  user_avatar: profiles.avatarPath,
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

/** "ok" — хадгалагдсан, "missing" — олдсонгүй, тоо — захиалагдсан жин хэтэрсэн. */
export type TripUpdateResult = "ok" | "missing" | { bookedKg: number };

/**
 * Аялалын зарыг шинэчилнэ.
 *
 * Сул жинг аль хэдийн ЗАХИАЛАГДСАН хэмжээнээс доош болгож болохгүй: тэгвэл
 * зар нь багтаамжаасаа хэтэрсэн ачаа үүрсэн хэвээр "дүүрсэн" гэж харагдаж,
 * сул жин нь сөрөг болно. acceptDeal-тай ижил аргаар мөрийг түгжиж шалгана —
 * зэрэгцээ зөвшөөрөл ба засвар хоёр цувран гүйцэтгэгдэнэ.
 */
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
): Promise<TripUpdateResult> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: trips.id })
      .from(trips)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .limit(1)
      .for("update");
    if (!existing) return "missing";

    const booked = await bookedKgIn(tx, id);
    if (!fitsCapacity(booked, input.availableKg)) return { bookedKg: booked };

    await tx
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
      .where(eq(trips.id, id));
    return "ok";
  });
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

/**
 * userId нь null бол эзний шалгалтгүй ажиллана — зөвхөн хянагчийн үйлдэлд
 * зориулагдсан бөгөөд эрхийг нь ДУУДАГЧ тал (requireAdmin) шалгасан байх ёстой.
 * Хэрэглэгчийн зүгээс ирэх бүх дуудлага өөрийн id-г дамжуулсан хэвээр байна.
 */
async function setListingStatus(
  type: ListingType,
  id: number,
  userId: UserId | null,
  status: "active" | "closed"
): Promise<boolean> {
  if (type === "trip") {
    const rows = await db
      .update(trips)
      .set({ status })
      .where(and(eq(trips.id, id), userId ? eq(trips.userId, userId) : undefined))
      .returning({ id: trips.id });
    return rows.length > 0;
  }
  const rows = await db
    .update(shipments)
    .set({ status })
    .where(and(eq(shipments.id, id), userId ? eq(shipments.userId, userId) : undefined))
    .returning({ id: shipments.id });
  return rows.length > 0;
}

export function closeListing(type: ListingType, id: number, userId: UserId | null): Promise<boolean> {
  return setListingStatus(type, id, userId, "closed");
}

export function reopenListing(type: ListingType, id: number, userId: UserId | null): Promise<boolean> {
  return setListingStatus(type, id, userId, "active");
}

export interface DeletedListing {
  /** Цуцлагдсанаар дахин сул болсон хос заруудын id. */
  freedIds: number[];
  /** Хөндөгдсөн яриа — хоёр тал нь төлөвийн өөрчлөлтийг харах ёстой. */
  conversationIds: number[];
}

/**
 * Зарыг устгаад түүнд холбогдсон хэлцлүүдийг цуцална.
 *
 * conversations.listing_id нь FK БИШ (аялал, ачаа хоёр өөр хүснэгт рүү заадаг)
 * тул cascade ажиллахгүй. Цуцлахгүй бол устсан зартай "тохирсон" хэлцэл үлдэж,
 * нөгөө талын зар үүрд түгжигдэнэ — эзэн нь өөрөө ярианд ороод цуцлахаас өөр
 * гарцгүй болно. Хүлээгдэж буй хүсэлтийг ч цуцлана: устсан зар дээр зөвшөөрөх
 * товч ажиллахгүй тул тэр нь мухардмал төлөв.
 *
 * userId нь null бол эзний шалгалтгүй — setListingStatus-тэй ижил дүрэм.
 */
export async function deleteListing(
  type: ListingType,
  id: number,
  userId: UserId | null
): Promise<DeletedListing | null> {
  return db.transaction(async (tx) => {
    const deleted =
      type === "trip"
        ? await tx
            .delete(trips)
            .where(and(eq(trips.id, id), userId ? eq(trips.userId, userId) : undefined))
            .returning({ id: trips.id })
        : await tx
            .delete(shipments)
            .where(and(eq(shipments.id, id), userId ? eq(shipments.userId, userId) : undefined))
            .returning({ id: shipments.id });
    if (deleted.length === 0) return null;

    // Устсан зар нь ярианы "эзэн" эсвэл "хос зар" аль ч үүрэгтэй байсан
    // generated багана хоёуланг нь хамарна.
    const own = type === "trip" ? conversations.tripId : conversations.shipmentId;
    const other = type === "trip" ? conversations.shipmentId : conversations.tripId;

    const affected = await tx
      .update(conversations)
      .set({ dealStatus: "cancelled", dealDecidedAt: new Date() })
      .where(and(eq(own, id), ne(conversations.dealStatus, "cancelled")))
      .returning({ id: conversations.id, freed: other });

    return {
      freedIds: affected.map((row) => row.freed).filter((v): v is number => v !== null),
      conversationIds: affected.map((row) => row.id),
    };
  });
}

// ---------- Харилцан яриа ба мессеж ----------

/** Тухайн зар дээр хэрэглэгчийн аль хэдийн эхлүүлсэн яриа. */
export async function findConversation(
  type: ListingType,
  listingId: number,
  starterId: UserId
): Promise<number | null> {
  const [row] = await db
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
  return row?.id ?? null;
}

export async function getOrCreateConversation(
  type: ListingType,
  listingId: number,
  starterId: UserId,
  ownerId: UserId,
  /** Эхлүүлэгчийн хос зар. Байгаа яриан дээр анхны сонголтыг дарж бичихгүй. */
  matchedListingId: number | null
): Promise<number> {
  const existing = await findConversation(type, listingId, starterId);
  if (existing !== null) return existing;

  const [row] = await db
    .insert(conversations)
    .values({ listingType: type, listingId, matchedListingId, starterId, ownerId })
    .onConflictDoNothing()
    .returning({ id: conversations.id });
  if (row) return row.id;

  // Зэрэгцээ хүсэлт давхцвал onConflictDoNothing юу ч буцаахгүй тул дахин уншина
  const raced = await findConversation(type, listingId, starterId);
  if (raced === null) throw new Error("Харилцан яриа үүсгэж чадсангүй.");
  return raced;
}

const conversationFields = {
  id: conversations.id,
  listing_type: conversations.listingType,
  listing_id: conversations.listingId,
  matched_listing_id: conversations.matchedListingId,
  trip_id: conversations.tripId,
  shipment_id: conversations.shipmentId,
  deal_status: conversations.dealStatus,
  deal_decided_at: conversations.dealDecidedAt,
  accepted_at: conversations.acceptedAt,
  starter_id: conversations.starterId,
  owner_id: conversations.ownerId,
  created_at: conversations.createdAt,
};

/**
 * Зар дээр тохирсон хэлцлүүд. Ачаанд хамгийн ихдээ нэг (unique index барина),
 * аялалд сул жин хүрэлцэх хүртэл олон байна.
 *
 * Хайлт нь generated багана дээр явна — зар нь ярианы "эзэн" эсвэл "хос зар"
 * аль ч үүрэгтэй байсан ижил олдоно.
 */
export const listingDeals = cache(
  async (type: ListingType, listingId: number): Promise<ListingDeal[]> => {
    const column = type === "trip" ? conversations.tripId : conversations.shipmentId;
    return db
      .select({
        conversation_id: conversations.id,
        starter_id: conversations.starterId,
        owner_id: conversations.ownerId,
        decided_at: conversations.dealDecidedAt,
        shipment_kg: shipments.weightKg,
      })
      .from(conversations)
      // Ачаа нь устсан байж болно (listing_id нь FK биш) — тийм хэлцлийг
      // хаяхгүй, зөвхөн жингүйгээр харуулна.
      .leftJoin(shipments, eq(shipments.id, conversations.shipmentId))
      .where(and(eq(conversations.dealStatus, "accepted"), eq(column, listingId)))
      .orderBy(conversations.dealDecidedAt);
  }
);

/** Аялал бүр дээр тохирсон ачаанууд эзэлсэн нийт жин. */
export async function tripLoads(tripIds: number[]): Promise<Map<number, number>> {
  if (tripIds.length === 0) return new Map();
  const rows = await db
    .select({
      tripId: conversations.tripId,
      booked: sql<number>`COALESCE(SUM(${shipments.weightKg}), 0)::float8`,
    })
    .from(conversations)
    // innerJoin: устсан ачаа багтаамж эзлэхгүй — жин нь автоматаар чөлөөлөгдөнө.
    .innerJoin(shipments, eq(shipments.id, conversations.shipmentId))
    .where(and(eq(conversations.dealStatus, "accepted"), inArray(conversations.tripId, tripIds)))
    .groupBy(conversations.tripId);

  const loads = new Map<number, number>();
  for (const row of rows) {
    if (row.tripId !== null) loads.set(row.tripId, row.booked);
  }
  return loads;
}

/** Нэг аялалын захиалагдсан жин. */
export async function tripBookedKg(tripId: number): Promise<number> {
  return (await tripLoads([tripId])).get(tripId) ?? 0;
}

/** Өгсөн ачаануудаас аль хэдийн аялагчтай тохирчихсоныг нь ялгана. */
export async function committedShipmentIds(ids: number[]): Promise<Set<number>> {
  if (ids.length === 0) return new Set();
  const rows = await db
    .select({ id: conversations.shipmentId })
    .from(conversations)
    .where(and(eq(conversations.dealStatus, "accepted"), inArray(conversations.shipmentId, ids)));
  return new Set(rows.map((row) => row.id).filter((id): id is number => id !== null));
}

/** Жагсаалтын заруудыг дэлгэцийн хэлбэрт хөрвүүлнэ — багтаамжийг нэг багц асуулгаар. */
export async function tripSummaries(rows: Trip[]): Promise<ListingSummary[]> {
  const loads = await tripLoads(rows.map((trip) => trip.id));
  return rows.map((trip) => tripSummary(trip, loads.get(trip.id) ?? 0));
}

/**
 * Тохирсон зарыг жагсаалтаас хасахгүй — хэрэглэгч цөөтэй үед сайт хоосон
 * харагдах нь илүү муу, бас тохиролцоо цуцлагдвал тэр зар дахин хэрэгтэй болно.
 */
export async function shipmentSummaries(rows: Shipment[]): Promise<ListingSummary[]> {
  const committed = await committedShipmentIds(rows.map((shipment) => shipment.id));
  return rows.map((shipment) => shipmentSummary(shipment, committed.has(shipment.id)));
}

/** Транзакцын хүрээ — багтаамжийн шалгалтууд ижил түгжээн дор явах ёстой. */
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Тухайн аялалд захиалагдсан нийт жин, транзакц дотор.
 *
 * exceptConversationId — өөрийгөө хасах (аль хэдийн зөвшөөрсөн хэлцлийг дахин
 * зөвшөөрөхөд жин нь хоёр дахин тоологдохгүй).
 */
async function bookedKgIn(tx: Tx, tripId: number, exceptConversationId?: number): Promise<number> {
  const [row] = await tx
    .select({ booked: sql<number>`COALESCE(SUM(${shipments.weightKg}), 0)::float8` })
    .from(conversations)
    .innerJoin(shipments, eq(shipments.id, conversations.shipmentId))
    .where(
      and(
        eq(conversations.dealStatus, "accepted"),
        eq(conversations.tripId, tripId),
        exceptConversationId === undefined
          ? undefined
          : ne(conversations.id, exceptConversationId)
      )
    );
  return row?.booked ?? 0;
}

export type AcceptResult = "ok" | "full" | "missing";

/**
 * Хэлцлийг зөвшөөрнө — аялалын сул жинд багтаж байвал.
 *
 * Багтаамжийг индексээр илэрхийлэх боломжгүй тул транзакц дотор аялалын мөрийг
 * FOR UPDATE-ээр түгжинэ: нэг аялал дээр зэрэг ирсэн хоёр зөвшөөрөл цувран
 * гүйцэтгэгдэж, нийлбэр хэтрэхгүй.
 *
 * Ачаа өөр аялагчтай тохирчихсон бол conversations_accepted_shipment_key
 * алдаа өгч транзакц бүхэлдээ буцна — дуудагч тал нь барьж авна.
 */
export async function acceptDeal(
  conversationId: number,
  tripId: number,
  shipmentId: number
): Promise<AcceptResult> {
  return db.transaction(async (tx) => {
    const [trip] = await tx
      .select({ availableKg: trips.availableKg })
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1)
      .for("update");
    const [shipment] = await tx
      .select({ weightKg: shipments.weightKg })
      .from(shipments)
      .where(eq(shipments.id, shipmentId))
      .limit(1);
    if (!trip || !shipment) return "missing";

    // Өөрийгөө хасна: аль хэдийн зөвшөөрсөн хэлцлийг дахин зөвшөөрөхөд
    // жин нь хоёр дахин тоологдохгүй.
    const remaining = trip.availableKg - (await bookedKgIn(tx, tripId, conversationId));
    if (!fitsCapacity(shipment.weightKg, remaining)) return "full";

    await tx
      .update(conversations)
      .set({
        dealStatus: "accepted",
        dealDecidedAt: new Date(),
        // Анхны тохирлын хугацааг хадгална — цуцлаад дахин тохирвол ч
        // хамгийн эхний огноо үлдэнэ.
        acceptedAt: sql`coalesce(${conversations.acceptedAt}, now())`,
      })
      .where(eq(conversations.id, conversationId));
    return "ok";
  });
}

/** Хэлцлийг цуцлана — ачаа сул болж, аялалын жин чөлөөлөгдөнө. */
export async function cancelDeal(conversationId: number): Promise<void> {
  await db
    .update(conversations)
    .set({ dealStatus: "cancelled", dealDecidedAt: new Date() })
    .where(eq(conversations.id, conversationId));
}

export async function getConversation(id: number): Promise<Conversation | null> {
  const [row] = await db.select(conversationFields).from(conversations).where(eq(conversations.id, id)).limit(1);
  return row ?? null;
}

export async function getUserName(id: UserId): Promise<string | null> {
  const [row] = await db.select({ name: profiles.name }).from(profiles).where(eq(profiles.id, id)).limit(1);
  return row?.name ?? null;
}

export async function listConversations(userId: UserId): Promise<ConversationPreview[]> {
  const convs = await db
    .select(conversationFields)
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
        senderId: messages.senderId,
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
        href: conversationPath(c.id),
        other_name: nameById.get(otherId) ?? "Хэрэглэгч",
        other_avatar: avatarById.get(otherId) ?? null,
        listing_title,
        last_body: last?.body ?? null,
        last_at: last?.createdAt ?? null,
        last_sender_id: last?.senderId ?? null,
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

/** Уншсанд тооцно. Үнэхээр уншаагүй мессеж байсан бол true. */
export async function markConversationRead(conversationId: number, readerId: UserId): Promise<boolean> {
  const updated = await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(eq(messages.conversationId, conversationId), ne(messages.senderId, readerId), isNull(messages.readAt))
    )
    .returning({ id: messages.id });
  return updated.length > 0;
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
  read_at: reviews.readAt,
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
      // Засварласан үнэлгээ шинэ мэт эрэмбэлэгддэг тул мэдэгдэл нь бас сэргэнэ.
      set: { rating: input.rating, comment: input.comment, createdAt: new Date(), readAt: null },
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

/** Хонхны тоолуур — үзээгүй үнэлгээний тоо. */
export async function unreadReviewCount(userId: UserId): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`COUNT(*)::int` })
    .from(reviews)
    .where(and(eq(reviews.revieweeId, userId), isNull(reviews.readAt)));
  return row?.n ?? 0;
}

/** Хонх нээгдэхэд бүх мэдэгдлийг үзсэнд тооцно. */
export async function markReviewsRead(userId: UserId): Promise<void> {
  await db
    .update(reviews)
    .set({ readAt: new Date() })
    .where(and(eq(reviews.revieweeId, userId), isNull(reviews.readAt)));
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
