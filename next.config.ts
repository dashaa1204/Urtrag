import type { NextConfig } from "next";

// Профайлын зураг Cloudinary-аас, аль хэдийн тайрагдаж шахагдсан хэлбэрээр
// ирдэг тул <Avatar> нь unoptimized — remotePatterns тохируулах шаардлагагүй.
const nextConfig: NextConfig = {
  experimental: {
    // Server action-ы биеийн анхны лимит 1МБ. Аватарыг браузар дээр багасгаж
    // илгээдэг ч (src/lib/image.ts) хуучин браузар дээр эх файл нь шууд явж
    // болзошгүй тул серверийн хязгаарыг зургийн дээд хэмжээнд тааруулна.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
