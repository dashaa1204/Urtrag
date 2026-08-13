/**
 * Storage bucket-үүдийг үүсгэнэ.
 *   npm run setup:storage
 *
 * identity-docs — ХААЛТТАЙ. Иргэний баримт: зөвхөн сервер тал (service role)
 *   хандаж, хянагчид богино signed URL үүсгэнэ.
 *
 * Профайлын зураг Supabase дээр биш, Cloudinary дээр байрладаг (src/lib/cloudinary.ts)
 * тул энд bucket хэрэггүй.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { DOC_MIME_TYPES, IDENTITY_BUCKET, MAX_DOC_BYTES } from "../src/constant/verification";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY шаардлагатай.");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKETS = [
  {
    name: IDENTITY_BUCKET,
    public: false,
    fileSizeLimit: MAX_DOC_BYTES,
    allowedMimeTypes: [...DOC_MIME_TYPES],
  },
];

async function main(): Promise<void> {
  const { data: existing, error } = await admin.storage.listBuckets();
  if (error) throw error;

  for (const { name, ...options } of BUCKETS) {
    if (existing.some((bucket) => bucket.name === name)) {
      console.log(`✓ "${name}" bucket аль хэдийн байна.`);
      continue;
    }
    const { error: createError } = await admin.storage.createBucket(name, options);
    if (createError) throw createError;
    console.log(`✓ "${name}" bucket үүслээ (${options.public ? "нээлттэй" : "хаалттай"}).`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
