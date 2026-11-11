"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MEAL_OPTIONS } from "@/config/wedding";
import { getCurrentGuest, clearGuestSession } from "@/lib/guestAuth";
import type { RsvpPayload, SubmitResult } from "@/lib/types";

const VALID_MEALS = new Set(MEAL_OPTIONS.map((m) => m.id));

export async function submitRsvp(payload: RsvpPayload): Promise<SubmitResult> {
  const guest = await getCurrentGuest();
  if (!guest) return { ok: false, error: "Your session has expired — please sign in again." };

  if (payload.attending) {
    const attendees = payload.attendees
      .map((a) => ({ ...a, name: a.name.trim(), dietary: a.dietary.trim() }))
      .filter((a) => a.name.length > 0);

    if (attendees.length === 0) {
      return { ok: false, error: "Please add at least one guest's name." };
    }
    if (attendees.length > guest.maxPartySize) {
      return {
        ok: false,
        error: `This invitation is for up to ${guest.maxPartySize} guest${
          guest.maxPartySize === 1 ? "" : "s"
        }.`,
      };
    }
    for (const a of attendees) {
      if (!VALID_MEALS.has(a.meal)) {
        return { ok: false, error: `Please choose a meal for ${a.name}.` };
      }
    }

    const songs = payload.songs
      .map((s) => ({ title: s.title.trim(), artist: s.artist.trim() }))
      .filter((s) => s.title.length > 0);

    await prisma.$transaction([
      prisma.rsvp.deleteMany({ where: { guestId: guest.id } }),
      prisma.songRequest.deleteMany({ where: { guestId: guest.id } }),
      prisma.rsvp.create({
        data: {
          guestId: guest.id,
          attending: true,
          message: payload.message.trim() || null,
          attendees: {
            create: attendees.map((a) => ({
              name: a.name,
              meal: a.meal,
              dietary: a.dietary || null,
            })),
          },
        },
      }),
      ...(songs.length
        ? [
            prisma.songRequest.createMany({
              data: songs.map((s) => ({
                guestId: guest.id,
                title: s.title,
                artist: s.artist || null,
              })),
            }),
          ]
        : []),
    ]);

    revalidatePath("/me");
    return { ok: true };
  }

  await prisma.$transaction([
    prisma.rsvp.deleteMany({ where: { guestId: guest.id } }),
    prisma.songRequest.deleteMany({ where: { guestId: guest.id } }),
    prisma.rsvp.create({
      data: {
        guestId: guest.id,
        attending: false,
        message: payload.message.trim() || null,
      },
    }),
  ]);

  revalidatePath("/me");
  return { ok: true };
}

export async function signOutGuest(): Promise<void> {
  await clearGuestSession();
  redirect("/");
}
