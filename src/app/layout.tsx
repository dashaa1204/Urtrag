import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer, Navbar, PresenceProvider } from "@/components/layout";
import { getCurrentUser } from "@/lib/auth";
import { SITE } from "@/constant/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  // Харьцангуй зам (canonical, og:image) бүрэн URL болох суурь
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} (${SITE.nameCyrillic}) — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: SITE.name,
    title: `${SITE.name} (${SITE.nameCyrillic}) — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // getCurrentUser нь request-ийн хэмжээнд cache хийгддэг тул Navbar-ын
  // дуудлагатай давхцаад нэмэлт хүсэлт үүсгэхгүй.
  const user = await getCurrentUser();

  return (
    <html lang="mn" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <PresenceProvider userId={user?.id ?? null}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </PresenceProvider>
      </body>
    </html>
  );
}
