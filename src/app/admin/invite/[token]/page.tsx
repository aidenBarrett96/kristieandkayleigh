import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAuthed } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
import { wedding } from "@/config/wedding";
import { Heart } from "@/components/Heart";
import { PrintTrigger } from "./PrintTrigger";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin");

  const { token } = await params;
  const guest = await prisma.guest.findUnique({ where: { token } });
  if (!guest) notFound();

  // Guests are pointed at the site and find themselves by name — no QR.
  const site = siteUrl().replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      {/* Controls hidden when printing */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <Link href="/admin" className="btn-ghost">
          ← Back
        </Link>
        <p className="text-sm text-ink-soft">
          Print or save as PDF, or send the card directly to the guest.
        </p>
      </div>

      {/* The card */}
      <div className="rounded-2xl border border-line bg-stone-light px-10 py-12 text-center shadow-sm">
        <Heart className="mx-auto mb-6 h-8 w-8 text-ink" />
        <p className="eyebrow text-ink-faint">You&apos;re invited</p>
        <h1 className="mt-4 font-display text-4xl text-ink">
          {wedding.partnerA} <span className="font-script text-3xl">&amp;</span>{" "}
          {wedding.partnerB}
        </h1>
        <p className="mt-4 font-display text-xl text-ink">{wedding.dateShort}</p>
        <p className="eyebrow mt-1 text-ink-faint">{wedding.venueAddress}</p>

        <div className="divider my-8" />

        <p className="font-display text-2xl text-ink">{guest.name}</p>
        <p className="mt-1 text-sm text-ink-soft">
          Invitation for up to {guest.maxPartySize}{" "}
          {guest.maxPartySize === 1 ? "guest" : "guests"}
        </p>

        <div className="divider my-8" />

        <p className="text-sm text-ink-soft">
          To RSVP, choose your meal and request a song, visit
        </p>
        <p className="mt-3 break-all font-display text-2xl text-ink">{site}</p>
        <p className="mt-3 text-sm text-ink-soft">
          choose <span className="text-ink">Guest sign in</span>, and search for
          your name.
        </p>

        <p className="mt-6 eyebrow text-ink-faint">
          Please reply by {wedding.rsvpBy}
        </p>
      </div>

      <div className="mt-8 text-center print:hidden">
        <PrintTrigger />
      </div>
    </main>
  );
}
