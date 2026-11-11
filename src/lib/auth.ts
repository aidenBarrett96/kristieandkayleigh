import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE_NAME = "wedding_admin";

function expectedToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  // Cookie value is a hash of the password so the raw password is never stored
  // in the browser. Changing ADMIN_PASSWORD invalidates existing sessions.
  return createHash("sha256").update(`wedding::${password}`).digest("hex");
}

export async function isAuthed(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === expectedToken();
}

export async function signIn(password: string): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  if (password !== process.env.ADMIN_PASSWORD) return false;
  const jar = await cookies();
  jar.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return true;
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
