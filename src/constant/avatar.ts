// Профайлын зураг. Баримтаас ялгаатай нь НЭЭЛТТЭЙ — зураг нь зар, профайл,
// мессежийн жагсаалт дээр хүн бүрд харагдах учиртай. Cloudinary дээр байрлана.

export const AVATAR_FOLDER = "crowdshipping/avatars";

/**
 * Хүргэх хувиргалт. Аватар хамгийн ихдээ 80px-ээр харагддаг тул 160px нь
 * retina дэлгэцэнд ч хүрэлцэнэ: 5МБ файл ~15КБ болж ирнэ.
 *   f_auto  — браузер дэмжвэл AVIF/WebP
 *   q_auto  — чанарыг агуулгаас нь хамааруулж сонгоно
 *   c_fill,g_face — дөрвөлжинд тайрахдаа царайг голлуулна
 */
export const AVATAR_TRANSFORM = "f_auto,q_auto,c_fill,g_face,w_160,h_160";

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const MAX_AVATAR_LABEL = "5 МБ";

export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const AVATAR_ACCEPT = AVATAR_MIME_TYPES.join(",");
export const AVATAR_FORMATS_LABEL = "JPG, PNG эсвэл WebP";
