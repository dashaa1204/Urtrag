import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

// next dev-ийн hot reload бүрт шинэ pool нээхээс сэргийлнэ
const globalForDb = globalThis as unknown as {
  __crowdshippingClient?: ReturnType<typeof postgres>;
  __crowdshippingDb?: Db;
};

function getDb(): Db {
  if (globalForDb.__crowdshippingDb) return globalForDb.__crowdshippingDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL тохируулаагүй байна. .env.local файлаа шалгана уу.");
  }

  const client = (globalForDb.__crowdshippingClient ??= postgres(connectionString, {
    // Supabase-ийн transaction pooler (6543 порт) prepared statement дэмждэггүй
    prepare: false,
    max: 10,
  }));

  globalForDb.__crowdshippingDb = drizzle(client, { schema });
  return globalForDb.__crowdshippingDb;
}

/**
 * Холболтыг эхний query дээр залгана. Ингэснээр DATABASE_URL байхгүй орчинд
 * (жишээ нь build хийх үед) зүгээр импортлоход алдаа гарахгүй.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const instance = getDb() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export { schema };
