import type { NextConfig } from "next";

// Профайлын зураг Cloudinary-аас, аль хэдийн тайрагдаж шахагдсан хэлбэрээр
// ирдэг тул <Avatar> нь unoptimized — remotePatterns тохируулах шаардлагагүй.
const nextConfig: NextConfig = {
  // next dev нь localhost-оос өөр origin-ы хүсэлтийг анхнаасаа блоклодог тул
  // утас, өөр төхөөрөмжөөс сүлжээний хаягаар (http://192.168.x.x:3000) орвол
  // JS chunk-ууд 403 өгч, апп бүрэн ачаалагдахгүй. Зөвхөн dev-д нөлөөлнө.
  allowedDevOrigins: ["192.168.1.8", "*.local"],
  experimental: {
    // Server action-ы биеийн анхны лимит 1МБ. Аватарыг браузар дээр багасгаж
    // илгээдэг ч (src/lib/image.ts) хуучин браузар дээр эх файл нь шууд явж
    // болзошгүй тул серверийн хязгаарыг зургийн дээд хэмжээнд тааруулна.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
