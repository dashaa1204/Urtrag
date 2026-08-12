import type { MetadataRoute } from "next";
import { SITE } from "@/constant/site";

/** Хувийн болон нэвтрэлтийн хуудсуудыг индексжүүлэхээс хасна. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/my",
        "/messages",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/auth/",
        "/trips/new",
        "/shipments/new",
        "/trips/*/edit",
        "/shipments/*/edit",
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
