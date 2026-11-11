import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentGuest } from "@/lib/guestAuth";
import { isAuthed } from "@/lib/auth";

// Streams a private photo. Allowed for the couple (admin) or the guest who
// uploaded it — nobody else, even with the id.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return new Response("Not found", { status: 404 });

  const admin = await isAuthed();
  const guest = admin ? null : await getCurrentGuest();
  if (!admin && guest?.id !== photo.guestId) {
    return new Response("Forbidden", { status: 403 });
  }

  const result = await get(photo.pathname, { access: "private" });
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(result.stream as ReadableStream, {
    headers: {
      "Content-Type": result.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
