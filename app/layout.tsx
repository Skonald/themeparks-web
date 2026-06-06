import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ThemeParks — Plan Smarter, Play Harder",
  description:
    "Live wait times, crowd forecasts, and park analytics. Plan your trip in the mobile app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <TopNav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
