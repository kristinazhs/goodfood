import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { PrototypeBanner } from "@/components/ui/prototype-banner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GoodFood",
  description:
    "Sacolas surpresa de comida boa com desconto — menos desperdício em Porto Alegre.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${fraunces.variable} ${inter.variable} bg-white font-sans text-charcoal`}
      >
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-cream md:shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
          <PrototypeBanner />
          {children}
        </div>
      </body>
    </html>
  );
}
