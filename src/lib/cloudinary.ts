import "server-only";
import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary-ийн серверийн клиент. API secret нь браузарт хэзээ ч очихгүй —
 * байршуулах, устгах үйлдэл зөвхөн server action дотор явна. Cloud нэр нь
 * нууц биш тул URL угсрахад клиент талд ч уншигдана.
 */
function client() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET тохируулаагүй байна."
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return cloudinary;
}

/**
 * Зургийг байршуулж, хадгалах public_id-г буцаана. Дуудагч нь давтагдашгүй
 * (цагийн тэмдэгтэй) id өгдөг тул URL нь өөрчлөгдөшгүй — CDN кэш хуучин
 * зураг үзүүлэх эрсдэлгүй бөгөөд invalidate дуудах шаардлагагүй.
 */
export async function uploadImage(file: File, publicId: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const api = client();

  return new Promise<string>((resolve, reject) => {
    api.uploader
      .upload_stream(
        { public_id: publicId, resource_type: "image", overwrite: true },
        (error, result) => {
          if (result) resolve(result.public_id);
          else reject(error ?? new Error("Cloudinary хоосон хариу буцаалаа."));
        }
      )
      .end(buffer);
  });
}

/** Нэг зураг устгана. Байхгүй id дээр Cloudinary алдаа биш "not found" буцаана. */
export async function deleteImage(publicId: string): Promise<void> {
  await client().uploader.destroy(publicId, { resource_type: "image", invalidate: true });
}

/**
 * Заасан угтвартай бүх зургийг устгана — бүртгэл устгах үед хэрэглэгчийн
 * хавтсыг бүхэлд нь цэвэрлэхэд. Admin API тул ердийн урсгалд ашиглахгүй.
 */
export async function deleteImagesByPrefix(prefix: string): Promise<void> {
  await client().api.delete_resources_by_prefix(prefix, { resource_type: "image" });
}
