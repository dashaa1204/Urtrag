// Профайлын зургийн нийтийн URL. Cloudinary клиент дуудалгүйгээр угсарна —
// зам нь тогтмол хэлбэртэй тул сервер, клиент хоёулаа ижил үр дүн гаргана.

import { AVATAR_TRANSFORM } from "@/constant/avatar";

export function avatarUrl(publicId: string | null | undefined): string | null {
  // Модулийн түвшинд биш, дуудагдах үедээ уншина — bundler NEXT_PUBLIC_*-ийг
  // функц дотор ч орлуулдаг бөгөөд скриптээс дуудахад ч найдвартай.
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!publicId || !cloudName) return null;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${AVATAR_TRANSFORM}/${publicId}`;
}
