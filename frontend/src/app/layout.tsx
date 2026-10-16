import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ETHERA | AI-Powered Fuel Intelligence & Range Prediction",
  description: "Know Your Range. Master Your Fuel. Real-world E85 mileage prediction, remaining range estimation, fuel cost comparison, and smart navigation.",
  keywords: ["E85", "flex fuel", "fuel economy", "mileage prediction", "range anxiety", "automotive intelligence", "sustainable mobility"],
  authors: [{ name: "ETHERA Automotive Intelligence" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080D16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#080D16] text-[#F5F7FA] antialiased selection:bg-[#B8F34A] selection:text-[#080D16]">
        {children}
      </body>
    </html>
  );
}
