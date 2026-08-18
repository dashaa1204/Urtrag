import {
  check,
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const listingTypeEnum = pgEnum("listing_type", ["trip", "shipment"]);
export const listingStatusEnum = pgEnum("listing_status", ["active", "closed"]);
/**
 * Хүсэлтийн төлөв. pending — эзэн хараахан шийдээгүй, accepted — тохирсон
 * (хоёр зар хоёулаа "эзэнтэй" болно), cancelled — татгалзсан эсвэл цуцалсан.
 */
export const dealStatusEnum = pgEnum("deal_status", ["pending", "accepted", "cancelled"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "approved", "rejected"]);

/**
 * Хянагчийн бүртгэгддэг үйлдлүүд. Шинэ төрөл нэмэхэд migration шаардана —
 * үүнийг дутагдал биш давуу тал гэж үзнэ: бүртгэлд юу орох нь ухамсартай
 * шийдвэр байх ёстой.
 */
export const ADMIN_ACTION_KINDS = [
  "listing_close",
  "listing_reopen",
  "listing_delete",
  "verification_approve",
  "verification_reject",
] as const;

export type AdminActionKind = (typeof ADMIN_ACTION_KINDS)[number];

export const adminActionEnum = pgEnum("admin_action", ADMIN_ACTION_KINDS);

/**
 * Хэрэглэгчийн нийтэд харагдах мэдээлэл.
 * id нь auth.users(id)-тэй ижил бөгөөд FK-г нь migration дотор нэмнэ
 * (auth схем нь Supabase-ийн мэдэлд байдаг тул drizzle-д тодорхойлохгүй).
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  /** Оршин суугаа улс — ISO 3166-1 alpha-2. Профайл дээр далбаагаар харагдана. */
  country: text("country"),
  /** "Миний тухай" — нийтэд харагдах богино танилцуулга. */
  bio: text("bio"),
  /** avatars bucket доторх зам. URL-ийг lib/avatar.ts угсарна. */
  avatarPath: text("avatar_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Бичиг баримтаар хэн болохоо баталгаажуулах хүсэлт. Хэрэглэгч бүрд нэг мөр.
 *
 * Баримтын ФАЙЛ нь хаалттай Storage bucket-д (identity-docs) хадгалагдаж,
 * шийдвэр гарсны дараа устгагдана — энд зөвхөн төлөв нь үлдэнэ. Иргэний
 * баримтыг шаардлагагүй хугацаанд хадгалахгүй байх нь GDPR-ийн үндсэн зарчим.
 */
export const identityVerifications = pgTable(
  "identity_verifications",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => profiles.id, { onDelete: "cascade" }),
    status: verificationStatusEnum("status").notNull().default("pending"),
    /** Bucket доторх зам. Шийдвэр гарсны дараа NULL болно. */
    frontPath: text("front_path"),
    backPath: text("back_path"),
    socialUrl: text("social_url"),
    /** Татгалзсан шалтгаан — хэрэглэгчид харагдана. */
    note: text("note"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  },
  (t) => [index("idx_verifications_status").on(t.status, t.submittedAt)]
);

export const trips = pgTable(
  "trips",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    // Хот нь жагсаалтын англи нэр, улс нь ISO 3166-1 alpha-2 ("AT", "MN").
    // Чиглэлийг тусад нь хадгалахгүй — хот/улсын хосоос гарна.
    fromCountry: text("from_country").notNull(),
    toCountry: text("to_country").notNull(),
    fromCity: text("from_city"),
    toCity: text("to_city"),
    travelDate: date("travel_date", { mode: "string" }).notNull(),
    availableKg: doublePrecision("available_kg").notNull(),
    pricePerKg: doublePrecision("price_per_kg").notNull(),
    notes: text("notes"),
    status: listingStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_trips_status_date").on(t.status, t.travelDate),
    index("idx_trips_route").on(t.fromCountry, t.toCountry),
    index("idx_trips_user").on(t.userId),
    check("trips_available_kg_positive", sql`${t.availableKg} > 0`),
    check("trips_price_per_kg_positive", sql`${t.pricePerKg} > 0`),
  ]
);

export const shipments = pgTable(
  "shipments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    fromCountry: text("from_country").notNull(),
    toCountry: text("to_country").notNull(),
    fromCity: text("from_city"),
    toCity: text("to_city"),
    weightKg: doublePrecision("weight_kg").notNull(),
    readyDate: date("ready_date", { mode: "string" }),
    deadlineDate: date("deadline_date", { mode: "string" }),
    description: text("description").notNull(),
    offerPrice: doublePrecision("offer_price"),
    status: listingStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_shipments_status_created").on(t.status, t.createdAt),
    index("idx_shipments_route").on(t.fromCountry, t.toCountry),
    index("idx_shipments_user").on(t.userId),
    check("shipments_weight_kg_positive", sql`${t.weightKg} > 0`),
  ]
);

export const conversations = pgTable(
  "conversations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    listingType: listingTypeEnum("listing_type").notNull(),
    listingId: integer("listing_id").notNull(),
    /**
     * Яриа эхлүүлэгчийн хос зар — зарын ЭСРЭГ төрөл (аялал ↔ ачаа). Хүсэлт
     * илгээхийн тулд өөрийн зараа сонгодог тул шинэ яриа бүрд бөглөгдөнө.
     *
     * FK биш: хоёр өөр хүснэгт рүү заах тул уншихдаа байгаа эсэхийг шалгана.
     * Хуучин яриануудад NULL.
     */
    matchedListingId: integer("matched_listing_id"),
    /**
     * Хэлцэлд оролцох аялал / ачааны id — үүргээс нь үл хамааран. Яриа аль ч
     * зүгээс эхэлж болдог (миний ачаа руу аялагч хандсан эсвэл би ачаагаараа
     * аялал руу хандсан) тул нэг зар listing_id, matched_listing_id хоёрын аль
     * алинд нь тохиолдоно. Тэр хоёр үүргийг ялгаж шалгах гэвэл нүх үлддэг —
     * generated багана болгож нэгтгэснээр индекс, нийлбэр хоёулаа энгийн болно.
     *
     * Postgres өөрөө бөглөнө: код зөвхөн уншина.
     */
    tripId: integer("trip_id").generatedAlwaysAs(
      sql`case when listing_type = 'trip' then listing_id else matched_listing_id end`
    ),
    shipmentId: integer("shipment_id").generatedAlwaysAs(
      sql`case when listing_type = 'shipment' then listing_id else matched_listing_id end`
    ),
    /** Хэлцлийн төлөв. Зарын эзэн шийднэ, дараа нь хоёр тал хүчингүй болгож чадна. */
    dealStatus: dealStatusEnum("deal_status").notNull().default("pending"),
    dealDecidedAt: timestamp("deal_decided_at", { withTimezone: true }),
    /**
     * Анх тохирсон хугацаа. Цуцлахад ЦЭВЭРЛЭГДЭХГҮЙ — "хэзээ нэгэн цагт
     * тохиролцсон уу" гэдэг нь үнэлгээ өгөх эрхийн үндэс. Ачаагаа хүргэсний
     * дараа зараа устгасан ч (эсвэл тохиролцоогоо хаасан ч) хоёр тал бие
     * биенээ үнэлж чадах ёстой.
     */
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    starterId: uuid("starter_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("conversations_listing_starter_key").on(t.listingType, t.listingId, t.starterId),
    index("idx_conversations_starter").on(t.starterId),
    index("idx_conversations_owner").on(t.ownerId),
    // Ачаа ХУВААГДАХГҮЙ: нэг хайрцгийг хоёр аялагчид хувааж өгөх нь утгагүй тул
    // ачаа бүр зэрэг зөвхөн нэг хэлцэлд орно. Кодын шалгалтад найдвал зэрэгцээ
    // хоёр товшилт хоёуланг нь өнгөрөөж мэднэ.
    uniqueIndex("conversations_accepted_shipment_key")
      .on(t.shipmentId)
      .where(sql`deal_status = 'accepted' and shipment_id is not null`),
    // Аялал ХУВААГДАНА: сул жин нь хүрэх хүртэл олон ачаа авна. Нийлбэрийг
    // индексээр илэрхийлэх боломжгүй тул acceptDeal доторх транзакц (аялалын
    // мөрийг түгжээд нийлбэрийг шалгах) энэ дүрмийг барина.
    index("idx_conversations_accepted_trip").on(t.tripId).where(sql`deal_status = 'accepted'`),
  ]
);

/**
 * Хянагчийн үйлдлийн ул мөр.
 *
 * Хянагч БУСДЫН зар дээр ажилладаг (хаах, устгах) бөгөөд хэд хэдэн хүн байдаг
 * тул "хэн, хэзээ, юуг" гэдэг нь өгөгдлийн санд үлдэх ёстой. Зар устсаны дараа
 * түүнийг сэргээх боломжгүй ч ямар зар байсныг summary-гаас уншина.
 *
 * profiles руу FK ТАВИХГҮЙ бөгөөд нэрийг нь ХУУЛЖ хадгална: бүртгэл өөрөө
 * өөртөө хангалттай байх ёстой. Cascade нь хянагчийн бүртгэл устахад түүхийг
 * нь хамт арчих (эсвэл set null болгож хэнийх болохыг мартах) байсан — тэр нь
 * аудитын утгыг үгүй хийнэ.
 */
export const adminActions = pgTable(
  "admin_actions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    actorId: uuid("actor_id").notNull(),
    /** Үйлдэл хийх үеийн нэр — сүүлд солигдсон ч түүх уншигдана. */
    actorName: text("actor_name").notNull(),
    action: adminActionEnum("action").notNull(),
    /** "trip" | "shipment" | "user" */
    targetType: text("target_type").notNull(),
    /** Зарын дугаар эсвэл хэрэглэгчийн uuid — хоёуланг нь барихын тулд text. */
    targetId: text("target_id").notNull(),
    /** "Vienna → Ulaanbaatar · dashaa" — устсаны дараа юу байсныг тайлбарлана. */
    summary: text("summary"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_admin_actions_created").on(t.createdAt)]
);

export const messages = pgTable(
  "messages",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (t) => [index("idx_messages_conversation").on(t.conversationId, t.id)]
);

export const reviews = pgTable(
  "reviews",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    reviewerId: uuid("reviewer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    revieweeId: uuid("reviewee_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    /** Үнэлүүлсэн хүн мэдэгдлийн хонхоо нээж үзсэн хугацаа. */
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (t) => [
    unique("reviews_conversation_reviewer_key").on(t.conversationId, t.reviewerId),
    index("idx_reviews_reviewee").on(t.revieweeId),
    check("reviews_rating_range", sql`${t.rating} BETWEEN 1 AND 5`),
  ]
);
