"use server";

import { redirect } from "next/navigation";
import type { Guest } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setGuestSession, normalizeName } from "@/lib/guestAuth";

export async function loginWithName(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const guestId = String(formData.get("guestId") ?? "").trim();

  if (!name && !guestId) redirect("/login?error=1");

  // The combobox posts the invitation the guest picked. Matching on the typed
  // name is the fallback for when it hasn't been used (no JS, or they typed
  // their name out in full and hit enter).
  const guest = guestId
    ? await prisma.guest.findUnique({ where: { id: guestId } })
    : await findByName(name);

  if (!guest) redirect("/login?error=1");

  await setGuestSession(guest.token);
  redirect("/me");
}

// Only resolves when the name picks out exactly one invitation — two guests
// called "Sam Taylor" have to use their QR link instead of guessing.
async function findByName(name: string): Promise<Guest | null> {
  const target = normalizeName(name);
  if (!target) return null;

  // A wedding guest list is small enough to normalise in memory, which matches
  // punctuation and spacing far more forgivingly than a SQL `contains`.
  const guests = await prisma.guest.findMany();

  const exact = guests.filter((g) => normalizeName(g.name) === target);
  if (exact.length > 0) return exact.length === 1 ? exact[0] : null;

  const partial = guests.filter((g) => normalizeName(g.name).includes(target));
  return partial.length === 1 ? partial[0] : null;
}
