import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Guest } from "@prisma/client";

const COOKIE_NAME = "guest_session";

// The session cookie stores the guest's `token` — the same capability that the
// QR link carries, but kept httpOnly so client JS can't read it.
export async function setGuestSession(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // a year — well past the wedding
  });
}

export async function clearGuestSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getCurrentGuest(): Promise<Guest | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return prisma.guest.findUnique({ where: { token } });
}

// Normalise a name for forgiving comparison at sign-in.
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
