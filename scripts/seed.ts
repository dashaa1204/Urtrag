/**
 * Хөгжүүлэлтийн тест дата үүсгэнэ.
 *   npm run db:seed
 *
 * Хэрэглэгчдийг Supabase Auth-д (имэйл баталгаажсан төлөвтэй) үүсгээд,
 * profiles мөрийг нь trigger автоматаар үүсгэнэ.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { conversations, messages, profiles, reviews, shipments, trips } from "../src/lib/db/schema";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!SUPABASE_URL || !SERVICE_KEY || !DATABASE_URL) {
  console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL шаардлагатай.");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const client = postgres(DATABASE_URL, { prepare: false, max: 1 });
const db = drizzle(client);

const TEST_PASSWORD = "test12345";

const testUsers = [
  { email: "bataa@test.mn", name: "Батаа", phone: "+43 660 1234567" },
  { email: "saraa@test.mn", name: "Сараа", phone: "+976 9911 2233" },
];

/** Байгаа бол одоогийн id-г, байхгүй бол шинээр үүсгээд буцаана. */
async function upsertUser(user: (typeof testUsers)[number]): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { name: user.name, phone: user.phone },
  });

  if (!error && data.user) {
    console.log(`  + ${user.email} үүслээ`);
    return data.user.id;
  }

  // Аль хэдийн бүртгэлтэй бол хайж олно
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;
  const existing = list.users.find((u) => u.email === user.email);
  if (!existing) throw error ?? new Error(`${user.email} үүсгэж чадсангүй`);
  console.log(`  = ${user.email} аль хэдийн байна`);
  return existing.id;
}

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

async function main() {
  console.log("Тест хэрэглэгчид:");
  const [bataaId, saraaId] = await Promise.all(testUsers.map(upsertUser));

  // Trigger профайлыг үүсгэсэн эсэхийг батална
  const created = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, bataaId));
  if (created.length === 0) {
    throw new Error("profiles мөр үүсээгүй байна — 0001_supabase_auth.sql migration ажилласан эсэхийг шалгана уу.");
  }

  console.log("Зарууд:");
  // conversations.listing_id дээр FK байхгүй (аялал/ачаа хоёрыг зэрэг заадаг) тул
  // хуучин яриануудыг гараар устгана. Мессеж/үнэлгээ нь cascade-аар дагаж арилна.
  await db.delete(conversations).where(eq(conversations.ownerId, bataaId));
  await db.delete(trips).where(eq(trips.userId, bataaId));
  await db.delete(shipments).where(eq(shipments.userId, saraaId));

  const [firstTrip] = await db.insert(trips).values([
    {
      userId: bataaId,
      direction: "at-mn",
      fromCity: "Вена",
      toCity: "Улаанбаатар",
      travelDate: daysFromNow(14),
      availableKg: 12,
      pricePerKg: 11,
      notes: "Шингэн зүйл авахгүй. Вена дотор уулзаж авна.",
    },
    {
      userId: bataaId,
      direction: "mn-at",
      fromCity: "Улаанбаатар",
      toCity: "Грац",
      travelDate: daysFromNow(30),
      availableKg: 8,
      pricePerKg: 13,
      notes: null,
    },
  ]).returning({ id: trips.id });

  await db.insert(shipments).values([
    {
      userId: saraaId,
      direction: "at-mn",
      fromCity: "Вена",
      toCity: "Улаанбаатар",
      weightKg: 3,
      readyDate: daysFromNow(3),
      deadlineDate: daysFromNow(25),
      description: "Эмийн сангийн жижиг илгээмж, 3 кг орчим.",
      offerPrice: 12,
    },
    {
      userId: saraaId,
      direction: "mn-at",
      fromCity: "Улаанбаатар",
      toCity: "Вена",
      weightKg: 5,
      readyDate: null,
      deadlineDate: daysFromNow(40),
      description: "Ноолууран бүтээгдэхүүн, хайрцагтай.",
      offerPrice: null,
    },
  ]);

  // Сараа Батаагийн аялалын зар руу бичсэн харилцан яриа
  console.log("Харилцан яриа:");
  const [conversation] = await db
    .insert(conversations)
    .values({ listingType: "trip", listingId: firstTrip.id, starterId: saraaId, ownerId: bataaId })
    .returning({ id: conversations.id });

  await db.insert(messages).values([
    {
      conversationId: conversation.id,
      senderId: saraaId,
      body: "Сайн байна уу? 3 кг илгээмж явуулах гэсэн юм, боломжтой юу?",
    },
    {
      conversationId: conversation.id,
      senderId: bataaId,
      body: "Сайн байна уу. Тэгэлгүй яахав, 3 кг асуудалгүй. Вена дотор уулзаж авъя.",
    },
    // Уншаагүй тэмдэглэгээг шалгах зорилгоор Батаад хариу ирээгүй сүүлийн мессеж
    { conversationId: conversation.id, senderId: saraaId, body: "Баярлалаа! Даваа гарагт таарах уу?" },
  ]);

  await db.insert(reviews).values({
    conversationId: conversation.id,
    reviewerId: saraaId,
    revieweeId: bataaId,
    rating: 5,
    comment: "Товлосон цагтаа ирж, ачааг эвтэйхэн хүргэсэн.",
  });

  console.log(`\nБэлэн. Нэвтрэх: ${testUsers.map((u) => u.email).join(" / ")} — нууц үг: ${TEST_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
