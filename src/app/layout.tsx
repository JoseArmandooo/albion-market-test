// src/app/layout.tsx
import type { Metadata } from "next";
import { Rajdhani, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Albion Market Analyzer",
  description:
    "Identifique as melhores oportunidades de flip no mercado de Albion Online",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${rajdhani.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-body antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>
          <div className="relative min-h-screen">
            {/* Grid background */}
            <div
              className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none"
              aria-hidden="true"
            />
            {/* Gradient overlay */}
            <div
              className="fixed inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,170,0.05), transparent)",
              }}
              aria-hidden="true"
            />
            <Navbar />
            <main className="relative">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
