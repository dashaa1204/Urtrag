// Зөвхөн хянагчийн самбар уншдаг асуулгууд.
//
// data.ts нь "нэвтэрсэн хэрэглэгч өөрийнхөө өгөгдлийг" уншдаг асуулгуудыг
// агуулдаг бол энд бүх хэрэглэгчийг хамарсан тойм, жагсаалт байна. Тусад нь
// байлгаснаар эрхийн хил тодорхой болно: энэ файлын функцийг дуудаж буй бүх
// зам requireAdmin() дамжсан байх ёстой.

import { and, desc, eq, ilike, inArray, lt, or, sql, type Column, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "./db";
import {
  adminActions,
  conversations,
  identityVerifications,
  messages,
  profiles,
  reviews,
  shipments,
  trips,
  type AdminActionKind,
} from "./db/schema";
import { shipmentFields, tripFields } from "./data";
import { formatDate, formatKg, routeTitle } from "./format";
import { listingPath } from "./nav";
import { todayIso } from "./listing";
import { ADMIN_PAGE_SIZE, type AdminDealFilter, type AdminListingFilter } from "@/constant/admin";
import type {
  DealStatus,
  ListingType,
  Shipment,
  Trip,
  UserId,
  VerificationStatus,
} from "@/types";

/** Хуудаслалт. Мөрийн НИЙТ тоог тоолохгүй — нэг илүү мөр татаад дараагийн
 *  хуудас байгаа эсэхийг мэдэх нь хямд бөгөөд самбарт хангалттай. */
export interface AdminPage<T> {
  rows: T[];
  page: number;
  hasMore: boolean;
}

interface PageQuery {
  page: number;
}

function range(page: number): { limit: number; offset: number } {
  return { limit: ADMIN_PAGE_SIZE + 1, offset: (page - 1) * ADMIN_PAGE_SIZE };
}

function paginate<T>(rows: T[], page: number): AdminPage<T> {
  return { rows: rows.slice(0, ADMIN_PAGE_SIZE), page, hasMore: rows.length > ADMIN_PAGE_SIZE };
}

/**
 * ILIKE-ийн хээ. %, _ нь хээний тэмдэгт тул хэрэглэгчийн бичсэнийг escape
 * хийхгүй бол "%%" гэж хайхад бүх мөр буцна (мөн индексгүй бүтэн уншилт).
 */
function likePattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

/**
 * ISO мөр буцаана, Date БИШ.
 *
 * Түүхий sql`` дотор параметр өгөхөд drizzle нь баганын хөрвүүлэгчийг мэдэхгүй
 * тул postgres.js рүү Date шууд очиж "string or Buffer" гэж унадаг. ISO мөрийг
 * харин Postgres өөрөө timestamptz болгон уншина.
 */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// ---------- Тойм ----------

export interface AdminStats {
  users: { total: number; week: number; month: number };
  trips: { total: number; active: number; week: number };
  shipments: { total: number; active: number; week: number };
  deals: { total: number; pending: number; accepted: number; cancelled: number; week: number };
  messages: { total: number; week: number };
  reviews: { total: number; avg: number | null };
  pendingVerifications: number;
}

/**
 * Самбарын дээд эгнээний тоонууд. Хүснэгт бүрд НЭГ л уншилт хийж, нөхцөлт
 * тоолуурыг (count(*) filter) SQL дотор тооцуулна — зургаан жижиг асуулга нь
 * арваад тусдаа COUNT-оос хямд.
 */
export async function adminStats(): Promise<AdminStats> {
  const week = daysAgo(7);
  const month = daysAgo(30);
  const today = todayIso();
  const int = (expression: SQL) => sql<number>`${expression}::int`;

  const [users, tripRow, shipmentRow, dealRow, messageRow, reviewRow, verificationRow] =
    await Promise.all([
      db
        .select({
          total: int(sql`count(*)`),
          week: int(sql`count(*) filter (where ${profiles.createdAt} >= ${week})`),
          month: int(sql`count(*) filter (where ${profiles.createdAt} >= ${month})`),
        })
        .from(profiles),
      db
        .select({
          total: int(sql`count(*)`),
          active: int(
            sql`count(*) filter (where ${trips.status} = 'active' and ${trips.travelDate} >= ${today})`
          ),
          week: int(sql`count(*) filter (where ${trips.createdAt} >= ${week})`),
        })
        .from(trips),
      db
        .select({
          total: int(sql`count(*)`),
          active: int(sql`count(*) filter (where ${shipments.status} = 'active')`),
          week: int(sql`count(*) filter (where ${shipments.createdAt} >= ${week})`),
        })
        .from(shipments),
      db
        .select({
          total: int(sql`count(*)`),
          pending: int(sql`count(*) filter (where ${conversations.dealStatus} = 'pending')`),
          accepted: int(sql`count(*) filter (where ${conversations.dealStatus} = 'accepted')`),
          cancelled: int(sql`count(*) filter (where ${conversations.dealStatus} = 'cancelled')`),
          week: int(sql`count(*) filter (where ${conversations.createdAt} >= ${week})`),
        })
        .from(conversations),
      db
        .select({
          total: int(sql`count(*)`),
          week: int(sql`count(*) filter (where ${messages.createdAt} >= ${week})`),
        })
        .from(messages),
      db
        .select({
          total: int(sql`count(*)`),
          avg: sql<number | null>`round(avg(${reviews.rating}), 1)::float8`,
        })
        .from(reviews),
      db
        .select({ total: int(sql`count(*)`) })
        .from(identityVerifications)
        .where(eq(identityVerifications.status, "pending")),
    ]);

  return {
    users: users[0],
    trips: tripRow[0],
    shipments: shipmentRow[0],
    deals: dealRow[0],
    messages: messageRow[0],
    reviews: reviewRow[0],
    pendingVerifications: verificationRow[0].total,
  };
}

/** Хажуугийн цэсний тэмдэглэгээ — хүлээгдэж буй баримтын тоо. */
export async function countPendingVerifications(): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(identityVerifications)
    .where(eq(identityVerifications.status, "pending"));
  return row?.n ?? 0;
}

// ---------- Хэрэглэгчид ----------

export interface AdminUser {
  id: UserId;
  name: string;
  country: string | null;
  avatar_path: string | null;
  created_at: Date;
  trips: number;
  shipments: number;
  /** Тохирсон хэлцлийн тоо — үүрэг (эхлүүлэгч/эзэн) хамаарахгүй. */
  deals: number;
  reviews: number;
  /** Авсан үнэлгээний дундаж. Үнэлгээгүй бол null. */
  rating: number | null;
  /** Бичиг баримтын төлөв. Огт илгээгээгүй бол null. */
  verification: VerificationStatus | null;
}

/**
 * Хэрэглэгчийн жагсаалт. Тоолуурууд нь корреляц дэд асуулга — хэрэглэгч бүрд
 * дөрвөн JOIN хийж мөр үржүүлэхээс (тэгээд DISTINCT-ээр цэвэрлэхээс) хамаагүй
 * ойлгомжтой бөгөөд нэг хуудсанд 25 мөр л тооцоологдоно.
 */
export async function listAdminUsers({
  q = "",
  page,
}: PageQuery & { q?: string }): Promise<AdminPage<AdminUser>> {
  const { limit, offset } = range(page);
  const search = q ? ilike(profiles.name, likePattern(q)) : undefined;

  const rows = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      country: profiles.country,
      avatar_path: profiles.avatarPath,
      created_at: profiles.createdAt,
      trips: sql<number>`(select count(*) from ${trips} where ${trips.userId} = ${profiles.id})::int`,
      shipments: sql<number>`(select count(*) from ${shipments} where ${shipments.userId} = ${profiles.id})::int`,
      deals: sql<number>`(select count(*) from ${conversations}
        where ${conversations.dealStatus} = 'accepted'
          and (${conversations.starterId} = ${profiles.id} or ${conversations.ownerId} = ${profiles.id}))::int`,
      reviews: sql<number>`(select count(*) from ${reviews} where ${reviews.revieweeId} = ${profiles.id})::int`,
      rating: sql<
        number | null
      >`(select round(avg(${reviews.rating}), 1) from ${reviews} where ${reviews.revieweeId} = ${profiles.id})::float8`,
      verification: identityVerifications.status,
    })
    .from(profiles)
    .leftJoin(identityVerifications, eq(identityVerifications.userId, profiles.id))
    .where(search)
    .orderBy(desc(profiles.createdAt))
    .limit(limit)
    .offset(offset);

  return paginate(rows, page);
}

// ---------- Зарууд ----------

/** Хайлт нь эзний нэр, чиглэлийн хотуудын аль нэгэнд таарвал болно. */
function listingSearch(q: string, fromCity: Column, toCity: Column): SQL | undefined {
  if (!q) return undefined;
  const pattern = likePattern(q);
  return or(ilike(profiles.name, pattern), ilike(fromCity, pattern), ilike(toCity, pattern));
}

export async function listAdminTrips({
  status,
  q = "",
  page,
}: PageQuery & { status: AdminListingFilter; q?: string }): Promise<AdminPage<Trip>> {
  const { limit, offset } = range(page);

  const rows = await db
    .select(tripFields)
    .from(trips)
    .innerJoin(profiles, eq(profiles.id, trips.userId))
    .where(
      and(
        status === "all" ? undefined : eq(trips.status, status),
        listingSearch(q, trips.fromCity, trips.toCity)
      )
    )
    .orderBy(desc(trips.createdAt))
    .limit(limit)
    .offset(offset);

  return paginate(rows, page);
}

export async function listAdminShipments({
  status,
  q = "",
  page,
}: PageQuery & { status: AdminListingFilter; q?: string }): Promise<AdminPage<Shipment>> {
  const { limit, offset } = range(page);

  const rows = await db
    .select(shipmentFields)
    .from(shipments)
    .innerJoin(profiles, eq(profiles.id, shipments.userId))
    .where(
      and(
        status === "all" ? undefined : eq(shipments.status, status),
        listingSearch(q, shipments.fromCity, shipments.toCity)
      )
    )
    .orderBy(desc(shipments.createdAt))
    .limit(limit)
    .offset(offset);

  return paginate(rows, page);
}

/** Тоймд гарах хамгийн сүүлийн зарууд — төлөв хамаарахгүй. */
export async function recentListings(limit: number): Promise<{ trips: Trip[]; shipments: Shipment[] }> {
  const [tripRows, shipmentRows] = await Promise.all([
    db
      .select(tripFields)
      .from(trips)
      .innerJoin(profiles, eq(profiles.id, trips.userId))
      .orderBy(desc(trips.createdAt))
      .limit(limit),
    db
      .select(shipmentFields)
      .from(shipments)
      .innerJoin(profiles, eq(profiles.id, shipments.userId))
      .orderBy(desc(shipments.createdAt))
      .limit(limit),
  ]);
  return { trips: tripRows, shipments: shipmentRows };
}

/** Хугацаа нь өнгөрсөн ч хаагдаагүй үлдсэн аяллууд — цэвэрлэгээ шаардлагатайг сануулна. */
export async function countStaleTrips(): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(trips)
    .where(and(eq(trips.status, "active"), lt(trips.travelDate, todayIso())));
  return row?.n ?? 0;
}

// ---------- Хэлцлүүд ----------

/** Хэлцэлд холбогдсон зарын товч мэдээлэл. Зар устсан байвал null. */
export interface AdminDealListing {
  type: ListingType;
  href: string;
  /** "Vienna → Ulaanbaatar" */
  title: string;
  /** Аялалд огноо, ачаанд жин. */
  detail: string;
}

export interface AdminDeal {
  id: number;
  status: DealStatus;
  created_at: Date;
  decided_at: Date | null;
  accepted_at: Date | null;
  starter: { id: UserId; name: string };
  owner: { id: UserId; name: string };
  trip: AdminDealListing | null;
  shipment: AdminDealListing | null;
  /** Зөвхөн ТОО — мессежийн агуулга хянагчид ч харагдахгүй. */
  messages: number;
}

/**
 * Хэлцлүүдийн жагсаалт.
 *
 * Зарыг JOIN-оор биш тусад нь татна: conversations.listing_id нь FK биш тул
 * устсан зар руу заасан хэлцэл үлдэж болдог. Тусдаа уншаад Map-аас хайснаар
 * "олдоогүй" тохиолдол нь ойлгомжтой null болно.
 */
export async function listAdminDeals({
  status,
  page,
}: PageQuery & { status: AdminDealFilter }): Promise<AdminPage<AdminDeal>> {
  const { limit, offset } = range(page);
  const starter = alias(profiles, "starter");
  const owner = alias(profiles, "owner");

  const rows = await db
    .select({
      id: conversations.id,
      status: conversations.dealStatus,
      created_at: conversations.createdAt,
      decided_at: conversations.dealDecidedAt,
      accepted_at: conversations.acceptedAt,
      starter_id: conversations.starterId,
      starter_name: starter.name,
      owner_id: conversations.ownerId,
      owner_name: owner.name,
      trip_id: conversations.tripId,
      shipment_id: conversations.shipmentId,
      messages: sql<number>`(select count(*) from ${messages} where ${messages.conversationId} = ${conversations.id})::int`,
    })
    .from(conversations)
    .innerJoin(starter, eq(starter.id, conversations.starterId))
    .innerJoin(owner, eq(owner.id, conversations.ownerId))
    .where(status === "all" ? undefined : eq(conversations.dealStatus, status))
    .orderBy(desc(conversations.createdAt))
    .limit(limit)
    .offset(offset);

  const result = paginate(rows, page);
  const tripIds = ids(result.rows.map((row) => row.trip_id));
  const shipmentIds = ids(result.rows.map((row) => row.shipment_id));

  const [tripRows, shipmentRows] = await Promise.all([
    tripIds.length === 0
      ? []
      : db
          .select({
            id: trips.id,
            from_country: trips.fromCountry,
            to_country: trips.toCountry,
            from_city: trips.fromCity,
            to_city: trips.toCity,
            travel_date: trips.travelDate,
          })
          .from(trips)
          .where(inArray(trips.id, tripIds)),
    shipmentIds.length === 0
      ? []
      : db
          .select({
            id: shipments.id,
            from_country: shipments.fromCountry,
            to_country: shipments.toCountry,
            from_city: shipments.fromCity,
            to_city: shipments.toCity,
            weight_kg: shipments.weightKg,
          })
          .from(shipments)
          .where(inArray(shipments.id, shipmentIds)),
  ]);

  const tripById = new Map(tripRows.map((row) => [row.id, row]));
  const shipmentById = new Map(shipmentRows.map((row) => [row.id, row]));

  return {
    ...result,
    rows: result.rows.map((row) => {
      const trip = row.trip_id === null ? undefined : tripById.get(row.trip_id);
      const shipment = row.shipment_id === null ? undefined : shipmentById.get(row.shipment_id);

      return {
        id: row.id,
        status: row.status,
        created_at: row.created_at,
        decided_at: row.decided_at,
        accepted_at: row.accepted_at,
        starter: { id: row.starter_id, name: row.starter_name },
        owner: { id: row.owner_id, name: row.owner_name },
        trip: trip
          ? {
              type: "trip" as const,
              href: listingPath("trip", trip),
              title: routeTitle(trip),
              detail: formatDate(trip.travel_date),
            }
          : null,
        shipment: shipment
          ? {
              type: "shipment" as const,
              href: listingPath("shipment", shipment),
              title: routeTitle(shipment),
              detail: formatKg(shipment.weight_kg),
            }
          : null,
        messages: row.messages,
      };
    }),
  };
}

function ids(values: (number | null)[]): number[] {
  return [...new Set(values.filter((value): value is number => value !== null))];
}

// ---------- Үйлдлийн түүх ----------

export interface AdminLogEntry {
  id: number;
  actor_id: UserId;
  actor_name: string;
  action: AdminActionKind;
  target_type: string;
  target_id: string;
  summary: string | null;
  created_at: Date;
}

/**
 * Хянагчийн үйлдлийг бүртгэнэ.
 *
 * Үйлдэл АМЖИЛТТАЙ болсны дараа л дуудна — оролдлого бүрийг бичвэл түүх нь
 * ямар ч үр дүнгүй мөрөөр дүүрч, "юу болсон бэ" гэдэг нь уншигдахаа болино.
 *
 * Бүртгэл нь үндсэн үйлдлээс ХОЙШ явагддаг тул энэ мөр алдаа өгвөл үйлдэл
 * аль хэдийн хийгдсэн байна. Тиймээс алдааг дуудагч тал руу нь дамжуулна:
 * ул мөргүй үлдсэн үйлдлийг чимээгүй өнгөрөөх нь аудитын утгыг алдагдуулна.
 */
export async function logAdminAction(entry: {
  actor: { id: UserId; name: string };
  action: AdminActionKind;
  targetType: "trip" | "shipment" | "user";
  targetId: string | number;
  /** Обьект нь устсаны дараа юу байсныг тайлбарлах богино мөр. */
  summary?: string | null;
}): Promise<void> {
  await db.insert(adminActions).values({
    actorId: entry.actor.id,
    actorName: entry.actor.name,
    action: entry.action,
    targetType: entry.targetType,
    targetId: String(entry.targetId),
    summary: entry.summary ?? null,
  });
}

export async function listAdminActions({ page }: PageQuery): Promise<AdminPage<AdminLogEntry>> {
  const { limit, offset } = range(page);

  const rows = await db
    .select({
      id: adminActions.id,
      actor_id: adminActions.actorId,
      actor_name: adminActions.actorName,
      action: adminActions.action,
      target_type: adminActions.targetType,
      target_id: adminActions.targetId,
      summary: adminActions.summary,
      created_at: adminActions.createdAt,
    })
    .from(adminActions)
    .orderBy(desc(adminActions.createdAt), desc(adminActions.id))
    .limit(limit)
    .offset(offset);

  return paginate(rows, page);
}
