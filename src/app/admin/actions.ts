"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

async function makeToken(name: string): Promise<string> {
  const base = slugify(name) || "guest";
  // Short random suffix keeps links tidy but unguessable.
  for (let i = 0; i < 5; i++) {
    const token = `${base}-${randomBytes(3).toString("hex")}`;
    const clash = await prisma.guest.findUnique({ where: { token } });
    if (!clash) return token;
  }
  return `${base}-${randomBytes(6).toString("hex")}`;
}

export async function signInAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await signIn(password);
  if (!ok) redirect("/admin?error=1");
  redirect("/admin");
}

export async function signOutAction() {
  await signOut();
  redirect("/admin");
}

export async function addGuestAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const maxPartySize = Math.max(
    1,
    Math.min(20, parseInt(String(formData.get("maxPartySize") ?? "1"), 10) || 1)
  );
  if (!name) redirect("/admin?error=name");

  await prisma.guest.create({
    data: {
      name,
      email: email || null,
      maxPartySize,
      token: await makeToken(name),
    },
  });
  revalidatePath("/admin");
}

export async function deleteGuestAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) {
    // Remove the guest's photos from Blob before deleting the rows.
    const photos = await prisma.photo.findMany({ where: { guestId: id } });
    if (photos.length) {
      await del(photos.map((p) => p.url)).catch(() => {});
    }
    await prisma.guest.delete({ where: { id } });
    revalidatePath("/admin");
  }
}

export async function togglePhotosAction(formData: FormData) {
  const enabled = String(formData.get("enabled") ?? "") === "true";
  const settings = await getSettings();
  await prisma.setting.update({
    where: { id: settings.id },
    data: { photosEnabled: enabled },
  });
  revalidatePath("/admin");
}

export async function deletePhotoAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return;
  await del(photo.url).catch(() => {});
  await prisma.photo.delete({ where: { id } });
  revalidatePath("/admin");
}
