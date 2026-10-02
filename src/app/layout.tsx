import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "RentNaija: homes for rent in Nigeria", template: "%s | RentNaija" },
  description:
    "Browse houses and apartments for rent in Lagos, Abuja, Port Harcourt, Ibadan and Enugu. Filter by location and price, then contact the landlord or agent directly.",
};

export const viewport: Viewport = { themeColor: "#F6F1E8", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="min-h-screen pb-20 md:pb-0">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-palm focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
