import Link from "next/link";
import { wedding, GIFTS, PHOTOS, HERO_PHOTOS } from "@/config/wedding";
import { Heart } from "@/components/Heart";
import { FloralDivider, FloralFrame, FloralCap } from "@/components/Floral";
import { Faq } from "@/components/Faq";
import { Itinerary } from "@/components/Itinerary";

// The hero shows three; the rest fill the gallery further down.
const GALLERY = PHOTOS.filter((p) => !HERO_PHOTOS.includes(p));

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
        <Heart className="mb-10 h-10 w-10 text-ink" />

        {/* Staggered on desktop; just the middle photo on a narrow phone. */}
        <div className="mb-12 flex items-center justify-center gap-3 sm:gap-5">
          {HERO_PHOTOS.map((photo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              loading={i === 1 ? "eager" : "lazy"}
              decoding="async"
              className={`rounded-lg border border-line object-cover shadow-sm ${
                i === 1
                  ? "h-64 w-48 sm:h-80 sm:w-60"
                  : "hidden h-52 w-40 sm:block sm:h-64 sm:w-48"
              } ${i === 0 ? "sm:-translate-y-6" : ""} ${
                i === 2 ? "sm:translate-y-6" : ""
              }`}
            />
          ))}
        </div>

        <FloralCap className="mb-2" />

        <div className="relative w-full max-w-md">
          <FloralFrame />
          <div className="px-[15%] py-20 sm:py-24">
            <p className="eyebrow text-[0.68rem] text-ink-faint">
              You are invited to the wedding of
            </p>

            <h1 className="mt-6">
              <span className="block font-script text-5xl leading-[1.1] text-ink sm:text-6xl">
                {wedding.partnerA.toLowerCase()}
              </span>
              <span className="eyebrow mt-1 block text-ink">
                {wedding.partnerASurname}
              </span>
              <span className="my-2 block font-script text-3xl text-ink sm:text-4xl">
                &amp;
              </span>
              <span className="block font-script text-5xl leading-[1.1] text-ink sm:text-6xl">
                {wedding.partnerB.toLowerCase()}
              </span>
              <span className="eyebrow mt-1 block text-ink">
                {wedding.partnerBSurname}
              </span>
            </h1>

            <p className="eyebrow mt-8 text-[0.68rem] leading-relaxed text-ink-soft">
              {wedding.dateLong}
            </p>
            <p className="eyebrow mt-5 text-[0.68rem] leading-relaxed text-ink-soft">
              {wedding.venue}
              <br />
              {wedding.venueStreet}
            </p>
          </div>
        </div>

        <FloralCap className="mt-2" flip />

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className="btn-primary">
            RSVP / Guest sign in
          </Link>
          <Link href="#details" className="btn-ghost">
            Wedding details
          </Link>
          <Link href="#faq" className="btn-ghost">
            FAQs
          </Link>
        </div>
      </section>

      {/* ── Details ── */}
      <section id="details" className="border-t border-line bg-stone-light/50">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <FloralDivider className="mb-12" />
          <h2 className="text-center font-display text-4xl text-ink">
            The Details
          </h2>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            <Detail label="When" lines={[wedding.date, `From ${wedding.time}`]} />
            <Detail label="Where" lines={[wedding.venue, wedding.venueAddress]} />
            <Detail label="RSVP by" lines={[wedding.rsvpBy]} />
          </div>

          <div className="mt-16 rounded-xl border border-line bg-white/50 px-6 py-10 text-center">
            <FloralCap className="mx-auto mb-5" />
            <h3 className="font-display text-2xl text-ink">Your invitation</h3>
            <p className="mx-auto mt-3 max-w-md text-ink-soft">
              Head to{" "}
              <Link href="/login" className="text-ink underline underline-offset-2">
                Guest sign in
              </Link>{" "}
              and start typing your name to find your invitation. From there you
              can RSVP, choose your meal, request a song, and pop back any time.
            </p>
          </div>
        </div>
      </section>

      {/* ── Our Wedding Day ── */}
      <section id="itinerary" className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <FloralDivider className="mb-12" />
          <h2 className="text-center font-display text-4xl text-ink">
            Our Wedding Day
          </h2>
          <div className="mt-12">
            <Itinerary />
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      {GALLERY.length > 0 && (
        <section className="border-t border-line bg-stone-light/50">
          <div className="mx-auto max-w-3xl px-6 py-24">
            <FloralDivider className="mb-12" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {GALLERY.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] w-full rounded-lg border border-line object-cover shadow-sm"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQs ── */}
      <section id="faq" className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <FloralDivider className="mb-12" />
          <h2 className="text-center font-display text-4xl text-ink">
            Important Information
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-ink-soft">
            A few things guests often ask. Anything else, just leave us a note
            with your RSVP.
          </p>
          <div className="mt-12">
            <Faq />
          </div>
        </div>
      </section>

      {/* ── Gifts ── */}
      <section id="gifts" className="border-t border-line bg-stone-light/50">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <FloralDivider className="mb-12" />
          <h2 className="text-center font-display text-4xl text-ink">Gifts</h2>
          <p className="mx-auto mt-10 max-w-xl text-center text-lg leading-relaxed text-ink-soft">
            {GIFTS}
          </p>
        </div>
      </section>

      <footer className="border-t border-line py-10 text-center">
        <Heart className="mx-auto mb-3 h-5 w-5 text-ink-faint" />
        <p className="eyebrow text-ink-faint">
          {wedding.partnerA} &amp; {wedding.partnerB} · {wedding.dateShort}
        </p>
      </footer>
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
