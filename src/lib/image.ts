// Браузар дээр зураг багасгах. Утасны зураг 3-8МБ гардаг бол аватар нь
// 160px-ээр л харагддаг тул сүлжээгээр хүнд файл явуулах утгагүй. Мөн server
// action-ы биеийн хэмжээний лимитэд (мөн Vercel-ийн 4.5МБ) хүрэхгүй болно.

/** Талын хамгийн урт хэмжээ. Cloudinary эцсийн тайралтыг өөрөө хийнэ. */
export const AVATAR_MAX_PX = 512;

/**
 * Зургийг maxPx дотор багтаах хэмжээгээр дахин зурж, JPEG болгож буцаана.
 * Браузар дэмжихгүй бол анхны файлыг нь эргүүлнэ — сервер тал ямар ч
 * тохиолдолд хэмжээ, төрлийг дахин шалгадаг.
 */
export async function downscaleImage(file: File, maxPx = AVATAR_MAX_PX): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    // imageOrientation — утасны хөрөг зураг EXIF-ээрээ эргэсэн байдгийг залруулна
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob) return file;

    return new File([blob], "avatar.jpg", { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}
