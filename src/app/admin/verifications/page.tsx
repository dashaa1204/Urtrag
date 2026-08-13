import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listPendingVerifications } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { IDENTITY_BUCKET } from "@/constant/verification";
import VerificationReviewView, { type VerificationRow } from "@/views/admin/verification-review-view";

export const metadata: Metadata = { title: "Баримт шалгах", robots: { index: false, follow: false } };

/** Baримтын холбоос богино насалж, хуваалцахад хэрэггүй болно. */
const SIGNED_URL_TTL = 300;

export default async function AdminVerificationsPage() {
  await requireAdmin();

  const pending = await listPendingVerifications();
  const storage = createAdminClient().storage.from(IDENTITY_BUCKET);

  const sign = async (path: string | null): Promise<string | null> => {
    if (!path) return null;
    const { data } = await storage.createSignedUrl(path, SIGNED_URL_TTL);
    return data?.signedUrl ?? null;
  };

  const rows: VerificationRow[] = await Promise.all(
    pending.map(async (row) => ({
      ...row,
      front_url: await sign(row.front_path),
      back_url: await sign(row.back_path),
    }))
  );

  return <VerificationReviewView rows={rows} />;
}
