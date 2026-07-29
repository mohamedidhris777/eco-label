import type { Metadata } from "next";
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

import { AppProvider } from "@/context/AppContext";
import { BootScreen } from "@/components/ui/BootScreen";

export const metadata: Metadata = {
  title: "EcoLabel X — Intelligent Sustainability Intelligence",
  description: "Verify, score, and report sustainability — for every product in your global supply chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cosmos">
        <AppProvider>
          <BootScreen />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
