import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migration-д шууд холболт (5432) ашиглана — pooler биш
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
  // Supabase-ийн дотоод схемүүдийг drizzle-kit хөндөхгүй
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
