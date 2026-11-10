import type { Metadata } from "next";
import { Playfair_Display, Pinyon_Script, Jost } from "next/font/google";
import { wedding } from "@/config/wedding";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});

const script = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

const sans = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: `${wedding.partnerA} & ${wedding.partnerB} — Wedding`,
  description: `Join us to celebrate the wedding of ${wedding.partnerA} & ${wedding.partnerB} on ${wedding.date}.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${script.variable} ${sans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
