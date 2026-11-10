import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import { wedding } from "@/config/wedding";
import "./globals.css";

// The invitation is set in a letterspaced serif with a flowing script for
// the names, so the site follows suit.
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
});

const script = Great_Vibes({
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
  // Guests type the address from their invitation; nobody should arrive here
  // from a search result, least of all by searching a guest's name.
  robots: { index: false, follow: false, nocache: true },
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
