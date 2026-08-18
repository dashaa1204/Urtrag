import type { Metadata } from "next";
import { latestShipments, latestTrips, shipmentSummaries, tripSummaries } from "@/lib/data";
import { SITE } from "@/constant/site";
import HomeView from "@/views/home/home-view";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Брэнд хайлтад (Google-д "Urtrag" гэж хайхад) сайтыг таниулах бүтэцлэгдсэн өгөгдөл.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: SITE.nameCyrillic,
  url: SITE.url,
  description: SITE.description,
  inLanguage: "mn",
  publisher: {
    "@type": "Organization",
    name: SITE.name,
    alternateName: SITE.nameCyrillic,
    url: SITE.url,
  },
};

export default async function HomePage() {
  const [trips, shipments] = await Promise.all([latestTrips(4), latestShipments(4)]);
  const [tripCards, shipmentCards] = await Promise.all([
    tripSummaries(trips),
    shipmentSummaries(shipments),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeView trips={tripCards} shipments={shipmentCards} />
    </>
  );
}
