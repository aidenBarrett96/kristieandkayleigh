import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentGuest } from "@/lib/guestAuth";
import { isPhotosEnabled } from "@/lib/settings";

export const runtime = "nodejs";

// Receives an already-downscaled image from the browser and stores it in the
// private Blob store, then records it. Keeping the store private means photos
// are only ever served back through the authenticated /api/photos/[id] proxy.
export async function POST(request: Request): Promise<NextResponse> {
  const guest = await getCurrentGuest();
  if (!guest) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  if (!(await isPhotosEnabled())) {
    return NextResponse.json({ error: "Photo uploads aren't open yet." }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const caption = String(form.get("caption") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No image received." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }

  const stored = await put(`photos/${guest.id}/${file.name}`, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type,
  });

  await prisma.photo.create({
    data: {
      guestId: guest.id,
      url: stored.url,
      pathname: stored.pathname,
      caption: caption || null,
    },
  });

  return NextResponse.json({ ok: true });
}
