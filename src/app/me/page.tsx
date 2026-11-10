import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { wedding, GIFTS } from "@/config/wedding";
import { getCurrentGuest } from "@/lib/guestAuth";
import { isPhotosEnabled } from "@/lib/settings";
import { Heart } from "@/components/Heart";
import { RsvpForm } from "@/components/RsvpForm";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Faq } from "@/components/Faq";
import { Itinerary } from "@/components/Itinerary";
import { signOutGuest } from "./actions";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const sessionGuest = await getCurrentGuest();
  if (!sessionGuest) redirect("/login");

  const [guest, photosOn] = await Promise.all([
    prisma.guest.findUnique({
      where: { id: sessionGuest.id },
      include: {
        rsvp: { include: { attendees: true } },
        songRequests: { orderBy: { createdAt: "asc" } },
        photos: { orderBy: { createdAt: "desc" } },
      },
    }),
    isPhotosEnabled(),
  ]);
  if (!guest) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      {/* Header */}
      <div className="text-center">
        <Heart className="mx-auto mb-6 h-9 w-9 text-ink" />
        <p className="eyebrow text-ink-faint">You&apos;re invited</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">
          {wedding.partnerA} <span className="font-script text-4xl">&amp;</span>{" "}
          {wedding.partnerB}
        </h1>
        <p className="mt-5 font-display text-xl text-ink">{wedding.dateShort}</p>
        <p className="eyebrow mt-2 text-ink-faint">{wedding.venueAddress}</p>
      </div>

      <div className="divider my-12" />

      <p className="text-center text-lg text-ink-soft">
        Hello <span className="text-ink">{guest.name}</span> — this is your page.
        Pop back any time to update your RSVP
        {photosOn ? " or share photos" : ""}.
      </p>

      {/* RSVP */}
      <section className="mt-10">
        <RsvpForm
          guestName={guest.name}
          maxPartySize={guest.maxPartySize}
          existing={
            guest.rsvp
              ? {
                  attending: guest.rsvp.attending,
                  message: guest.rsvp.message ?? "",
                  attendees: guest.rsvp.attendees.map((a) => ({
                    name: a.name,
                    meal: a.meal,
                    dietary: a.dietary ?? "",
                  })),
                  songs: guest.songRequests.map((s) => ({
                    title: s.title,
                    artist: s.artist ?? "",
                  })),
                }
              : null
          }
        />
      </section>

      {/* Details */}
      <section className="mt-12">
        <div className="divider mb-10" />
        <div className="grid gap-8 sm:grid-cols-3">
          <Detail label="When" lines={[wedding.date, `Ceremony ${wedding.time}`]} />
          <Detail label="Where" lines={[wedding.venue, wedding.venueAddress]} />
          <Detail label="RSVP by" lines={[wedding.rsvpBy]} />
        </div>
      </section>

      {/* Photos */}
      {photosOn && (
        <section className="mt-14">
          <div className="divider mb-10" />
          <PhotoUpload />
          {guest.photos.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow text-ink-faint">Your photos</p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {guest.photos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={`/api/photos/${p.id}`}
                    alt={p.caption ?? "Your photo"}
                    className="aspect-square w-full rounded-lg border border-line object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Our Wedding Day */}
      <section className="mt-14">
        <div className="divider mb-10" />
        <h2 className="mb-8 text-center font-display text-2xl text-ink">
          Our Wedding Day
        </h2>
        <Itinerary />
      </section>

      {/* Important information */}
      <section className="mt-14">
        <div className="divider mb-10" />
        <h2 className="mb-6 text-center font-display text-2xl text-ink">
          Important Information
        </h2>
        <Faq />
      </section>

      {/* Gifts */}
      <section className="mt-14">
        <div className="divider mb-10" />
        <h2 className="mb-6 text-center font-display text-2xl text-ink">
          Gifts
        </h2>
        <p className="text-center leading-relaxed text-ink-soft">{GIFTS}</p>
      </section>

      {/* Sign out */}
      <div className="mt-16 text-center">
        <form action={signOutGuest}>
          <button type="submit" className="btn-ghost">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

function Detail({ label, lines }: { label: string; lines: string[] }) {
  return (
    <div className="text-center">
      <p className="eyebrow text-ink-faint">{label}</p>
      <div className="mt-3 space-y-1">
        {lines.map((l) => (
          <p key={l} className="font-display text-lg text-ink">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}
