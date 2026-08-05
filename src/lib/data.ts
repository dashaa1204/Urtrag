import { db } from "./db";
import { formatDate, formatKg } from "./format";
import type {
  Conversation,
  ConversationPreview,
  Direction,
  ListingType,
  Message,
  Review,
  Shipment,
  Trip,
  UserProfile,
  UserRating,
} from "@/types";

const TRIP_SELECT = `SELECT t.*, u.name AS user_name FROM trips t JOIN users u ON u.id = t.user_id`;
const SHIPMENT_SELECT = `SELECT s.*, u.name AS user_name FROM shipments s JOIN users u ON u.id = s.user_id`;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------- Аялал ----------

export function listTrips(filter: { direction?: Direction } = {}): Trip[] {
  const where = ["t.status = 'active'", "t.travel_date >= ?"];
  const params: unknown[] = [todayIso()];
  if (filter.direction) {
    where.push("t.direction = ?");
    params.push(filter.direction);
  }
  return db
    .prepare(`${TRIP_SELECT} WHERE ${where.join(" AND ")} ORDER BY t.travel_date ASC`)
    .all(...params) as Trip[];
}

export function latestTrips(limit: number): Trip[] {
  return db
    .prepare(`${TRIP_SELECT} WHERE t.status = 'active' AND t.travel_date >= ? ORDER BY t.created_at DESC LIMIT ?`)
    .all(todayIso(), limit) as Trip[];
}

export function getTrip(id: number): Trip | null {
  return (db.prepare(`${TRIP_SELECT} WHERE t.id = ?`).get(id) as Trip | undefined) ?? null;
}

export function createTrip(input: {
  userId: number;
  direction: Direction;
  fromCity: string | null;
  toCity: string | null;
  travelDate: string;
  availableKg: number;
  pricePerKg: number;
  notes: string | null;
}): number {
  const result = db
    .prepare(
      `INSERT INTO trips (user_id, direction, from_city, to_city, travel_date, available_kg, price_per_kg, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.userId,
      input.direction,
      input.fromCity,
      input.toCity,
      input.travelDate,
      input.availableKg,
      input.pricePerKg,
      input.notes,
      new Date().toISOString()
    );
  return Number(result.lastInsertRowid);
}

export function myTrips(userId: number): Trip[] {
  return db.prepare(`${TRIP_SELECT} WHERE t.user_id = ? ORDER BY t.created_at DESC`).all(userId) as Trip[];
}

export function updateTrip(
  id: number,
  userId: number,
  input: {
    direction: Direction;
    fromCity: string | null;
    toCity: string | null;
    travelDate: string;
    availableKg: number;
    pricePerKg: number;
    notes: string | null;
  }
): boolean {
  const result = db
    .prepare(
      `UPDATE trips SET direction = ?, from_city = ?, to_city = ?, travel_date = ?, available_kg = ?, price_per_kg = ?, notes = ?
       WHERE id = ? AND user_id = ?`
    )
    .run(
      input.direction,
      input.fromCity,
      input.toCity,
      input.travelDate,
      input.availableKg,
      input.pricePerKg,
      input.notes,
      id,
      userId
    );
  return result.changes > 0;
}

// ---------- Ачаа ----------

export function listShipments(filter: { direction?: Direction } = {}): Shipment[] {
  const where = ["s.status = 'active'"];
  const params: unknown[] = [];
  if (filter.direction) {
    where.push("s.direction = ?");
    params.push(filter.direction);
  }
  return db
    .prepare(`${SHIPMENT_SELECT} WHERE ${where.join(" AND ")} ORDER BY s.created_at DESC`)
    .all(...params) as Shipment[];
}

export function latestShipments(limit: number): Shipment[] {
  return db
    .prepare(`${SHIPMENT_SELECT} WHERE s.status = 'active' ORDER BY s.created_at DESC LIMIT ?`)
    .all(limit) as Shipment[];
}

export function getShipment(id: number): Shipment | null {
  return (db.prepare(`${SHIPMENT_SELECT} WHERE s.id = ?`).get(id) as Shipment | undefined) ?? null;
}

export function createShipment(input: {
  userId: number;
  direction: Direction;
  fromCity: string | null;
  toCity: string | null;
  weightKg: number;
  readyDate: string | null;
  deadlineDate: string | null;
  description: string;
  offerPrice: number | null;
}): number {
  const result = db
    .prepare(
      `INSERT INTO shipments (user_id, direction, from_city, to_city, weight_kg, ready_date, deadline_date, description, offer_price, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.userId,
      input.direction,
      input.fromCity,
      input.toCity,
      input.weightKg,
      input.readyDate,
      input.deadlineDate,
      input.description,
      input.offerPrice,
      new Date().toISOString()
    );
  return Number(result.lastInsertRowid);
}

export function myShipments(userId: number): Shipment[] {
  return db.prepare(`${SHIPMENT_SELECT} WHERE s.user_id = ? ORDER BY s.created_at DESC`).all(userId) as Shipment[];
}

export function updateShipment(
  id: number,
  userId: number,
  input: {
    direction: Direction;
    fromCity: string | null;
    toCity: string | null;
    weightKg: number;
    readyDate: string | null;
    deadlineDate: string | null;
    description: string;
    offerPrice: number | null;
  }
): boolean {
  const result = db
    .prepare(
      `UPDATE shipments SET direction = ?, from_city = ?, to_city = ?, weight_kg = ?, ready_date = ?, deadline_date = ?, description = ?, offer_price = ?
       WHERE id = ? AND user_id = ?`
    )
    .run(
      input.direction,
      input.fromCity,
      input.toCity,
      input.weightKg,
      input.readyDate,
      input.deadlineDate,
      input.description,
      input.offerPrice,
      id,
      userId
    );
  return result.changes > 0;
}

// ---------- Зар хаах / нээх / устгах ----------

export function closeListing(type: ListingType, id: number, userId: number): boolean {
  const table = type === "trip" ? "trips" : "shipments";
  const result = db.prepare(`UPDATE ${table} SET status = 'closed' WHERE id = ? AND user_id = ?`).run(id, userId);
  return result.changes > 0;
}

export function reopenListing(type: ListingType, id: number, userId: number): boolean {
  const table = type === "trip" ? "trips" : "shipments";
  const result = db.prepare(`UPDATE ${table} SET status = 'active' WHERE id = ? AND user_id = ?`).run(id, userId);
  return result.changes > 0;
}

export function deleteListing(type: ListingType, id: number, userId: number): boolean {
  const table = type === "trip" ? "trips" : "shipments";
  const result = db.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).run(id, userId);
  return result.changes > 0;
}

// ---------- Харилцан яриа ба мессеж ----------

export function getOrCreateConversation(
  type: ListingType,
  listingId: number,
  starterId: number,
  ownerId: number
): number {
  const existing = db
    .prepare(`SELECT id FROM conversations WHERE listing_type = ? AND listing_id = ? AND starter_id = ?`)
    .get(type, listingId, starterId) as { id: number } | undefined;
  if (existing) return existing.id;
  const result = db
    .prepare(
      `INSERT INTO conversations (listing_type, listing_id, starter_id, owner_id, created_at) VALUES (?, ?, ?, ?, ?)`
    )
    .run(type, listingId, starterId, ownerId, new Date().toISOString());
  return Number(result.lastInsertRowid);
}

export function getConversation(id: number): Conversation | null {
  return (db.prepare(`SELECT * FROM conversations WHERE id = ?`).get(id) as Conversation | undefined) ?? null;
}

export function getUserName(id: number): string | null {
  const row = db.prepare(`SELECT name FROM users WHERE id = ?`).get(id) as { name: string } | undefined;
  return row?.name ?? null;
}

export function listConversations(userId: number): ConversationPreview[] {
  const rows = db
    .prepare(
      `SELECT c.*,
        (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_body,
        (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != ? AND m.read_at IS NULL) AS unread,
        (SELECT name FROM users WHERE id = CASE WHEN c.starter_id = ? THEN c.owner_id ELSE c.starter_id END) AS other_name
       FROM conversations c
       WHERE c.starter_id = ? OR c.owner_id = ?
       ORDER BY COALESCE(last_at, c.created_at) DESC`
    )
    .all(userId, userId, userId, userId) as ConversationPreview[];

  for (const row of rows) {
    if (row.listing_type === "trip") {
      const trip = getTrip(row.listing_id);
      row.listing_title = trip ? `Аялал · ${formatDate(trip.travel_date)}` : "Аялал";
    } else {
      const shipment = getShipment(row.listing_id);
      row.listing_title = shipment ? `Ачаа · ${formatKg(shipment.weight_kg)}` : "Ачаа";
    }
  }
  return rows;
}

export function listMessages(conversationId: number): Message[] {
  return db
    .prepare(
      `SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = ? ORDER BY m.id ASC`
    )
    .all(conversationId) as Message[];
}

export function addMessage(conversationId: number, senderId: number, body: string): void {
  db.prepare(`INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES (?, ?, ?, ?)`).run(
    conversationId,
    senderId,
    body,
    new Date().toISOString()
  );
}

export function markConversationRead(conversationId: number, readerId: number): void {
  db.prepare(`UPDATE messages SET read_at = ? WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL`).run(
    new Date().toISOString(),
    conversationId,
    readerId
  );
}

export function hasMessageFrom(conversationId: number, senderId: number): boolean {
  const row = db
    .prepare(`SELECT 1 AS x FROM messages WHERE conversation_id = ? AND sender_id = ? LIMIT 1`)
    .get(conversationId, senderId);
  return row !== undefined;
}

// ---------- Үнэлгээ ----------

export function upsertReview(input: {
  conversationId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment: string | null;
}): void {
  db.prepare(
    `INSERT INTO reviews (conversation_id, reviewer_id, reviewee_id, rating, comment, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (conversation_id, reviewer_id)
     DO UPDATE SET rating = excluded.rating, comment = excluded.comment, created_at = excluded.created_at`
  ).run(
    input.conversationId,
    input.reviewerId,
    input.revieweeId,
    input.rating,
    input.comment,
    new Date().toISOString()
  );
}

export function getOwnReview(conversationId: number, reviewerId: number): Review | null {
  const row = db
    .prepare(
      `SELECT r.*, u.name AS reviewer_name FROM reviews r JOIN users u ON u.id = r.reviewer_id
       WHERE r.conversation_id = ? AND r.reviewer_id = ?`
    )
    .get(conversationId, reviewerId) as Review | undefined;
  return row ?? null;
}

export function getUserRating(userId: number): UserRating {
  const row = db
    .prepare(`SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews WHERE reviewee_id = ?`)
    .get(userId) as { avg: number | null; count: number };
  return { avg: row.avg ?? 0, count: row.count };
}

export function listUserReviews(userId: number): Review[] {
  return db
    .prepare(
      `SELECT r.*, u.name AS reviewer_name FROM reviews r JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewee_id = ? ORDER BY r.created_at DESC`
    )
    .all(userId) as Review[];
}

// ---------- Хэрэглэгчийн профайл ----------

export function getUserProfile(id: number): UserProfile | null {
  const row = db.prepare(`SELECT id, name, created_at FROM users WHERE id = ?`).get(id) as UserProfile | undefined;
  return row ?? null;
}

export function userActiveTrips(userId: number): Trip[] {
  return db
    .prepare(`${TRIP_SELECT} WHERE t.user_id = ? AND t.status = 'active' AND t.travel_date >= ? ORDER BY t.travel_date ASC`)
    .all(userId, todayIso()) as Trip[];
}

export function userActiveShipments(userId: number): Shipment[] {
  return db
    .prepare(`${SHIPMENT_SELECT} WHERE s.user_id = ? AND s.status = 'active' ORDER BY s.created_at DESC`)
    .all(userId) as Shipment[];
}

export function unreadCount(userId: number): number {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS n FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE (c.starter_id = ? OR c.owner_id = ?) AND m.sender_id != ? AND m.read_at IS NULL`
    )
    .get(userId, userId, userId) as { n: number };
  return row.n;
}
