import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer, Navbar } from "@/components/layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Замдаа — Австри ↔ Монгол ачаа илгээлт",
    template: "%s | Замдаа",
  },
  description:
    "Австри болон Монголын хооронд зорчих аялагчид болон ачаа илгээгчдийг холбох платформ. Аялагчид сул жингээ зарлаж, илгээгчид ачаагаа хүргүүлнэ.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
