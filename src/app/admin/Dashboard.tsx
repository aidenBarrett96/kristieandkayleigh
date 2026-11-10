import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";
import { mealLabel, MEAL_OPTIONS, wedding } from "@/config/wedding";
import { getSettings } from "@/lib/settings";
import { CopyLink } from "@/components/CopyLink";
import { Heart } from "@/components/Heart";
import {
  addGuestAction,
  deleteGuestAction,
  deletePhotoAction,
  signOutAction,
  togglePhotosAction,
} from "./actions";

export async function Dashboard() {
  const [guests, settings, photos] = await Promise.all([
    prisma.guest.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        rsvp: { include: { attendees: true } },
        songRequests: { orderBy: { createdAt: "asc" } },
      },
    }),
    getSettings(),
    prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
      include: { guest: { select: { name: true } } },
    }),
  ]);

  const base = siteUrl();

  // ── Aggregate stats ──
  let attendingPeople = 0;
  let declined = 0;
  let awaiting = 0;
  const mealCounts: Record<string, number> = {};
  for (const m of MEAL_OPTIONS) mealCounts[m.id] = 0;

  for (const g of guests) {
    if (!g.rsvp) {
      awaiting++;
    } else if (g.rsvp.attending) {
      attendingPeople += g.rsvp.attendees.length;
      for (const a of g.rsvp.attendees) {
        mealCounts[a.meal] = (mealCounts[a.meal] ?? 0) + 1;
      }
    } else {
      declined++;
    }
  }

  const allSongs = guests.flatMap((g) =>
    g.songRequests.map((s) => ({ ...s, from: g.name }))
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-7 w-7 text-ink" />
          <div>
            <h1 className="font-display text-2xl text-ink">Guest dashboard</h1>
            <p className="text-xs text-ink-faint">
              {wedding.partnerA} &amp; {wedding.partnerB} · {wedding.dateShort}
            </p>
          </div>
        </div>
        <form action={signOutAction}>
          <button className="btn-ghost" type="submit">
            Sign out
          </button>
        </form>
      </div>

      {/* Summary */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Guests attending" value={attendingPeople} />
        <Stat label="Invites declined" value={declined} />
        <Stat label="Awaiting reply" value={awaiting} />
        <Stat label="Invitations" value={guests.length} />
      </div>

      {/* Meal breakdown */}
      <div className="card mt-6">
        <h2 className="eyebrow text-ink-faint">Meal totals</h2>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
          {MEAL_OPTIONS.map((m) => (
            <span key={m.id} className="text-sm text-ink-soft">
              <span className="font-display text-lg text-ink">
                {mealCounts[m.id] ?? 0}
              </span>{" "}
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Photos toggle */}
      <div className="card mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="eyebrow text-ink-faint">Guest photo uploads</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {settings.photosEnabled
              ? "On — guests can upload photos from their page. Only you can see them, below."
              : "Off — flip this on after the wedding to let guests share their photos."}
          </p>
        </div>
        <form action={togglePhotosAction}>
          <input type="hidden" name="enabled" value={(!settings.photosEnabled).toString()} />
          <button type="submit" className={settings.photosEnabled ? "btn-ghost" : "btn-primary"}>
            {settings.photosEnabled ? "Turn off" : "Turn on"}
          </button>
        </form>
      </div>

      {/* Add guest */}
      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">Add an invitation</h2>
        <form
          action={addGuestAction}
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
        >
          <div>
            <label className="field-label">Guest / household name</label>
            <input name="name" required className="field-input" placeholder="The Smith Family" />
          </div>
          <div>
            <label className="field-label">Email (optional)</label>
            <input name="email" type="email" className="field-input" placeholder="name@email.com" />
          </div>
          <div>
            <label className="field-label">Party size</label>
            <input
              name="maxPartySize"
              type="number"
              min={1}
              max={20}
              defaultValue={2}
              className="field-input w-24"
            />
          </div>
          <button type="submit" className="btn-primary">
            Add
          </button>
        </form>
      </section>

      {/* Guest list */}
      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">Invitations</h2>
        {guests.length === 0 ? (
          <p className="mt-4 text-ink-soft">
            No invitations yet — add your first one above.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {guests.map((g) => {
              const link = `${base}/rsvp/${g.token}`;
              const status = !g.rsvp
                ? { text: "No reply yet", cls: "text-ink-faint" }
                : g.rsvp.attending
                ? {
                    text: `Attending · ${g.rsvp.attendees.length}`,
                    cls: "text-emerald-700",
                  }
                : { text: "Declined", cls: "text-rose-700" };
              return (
                <div
                  key={g.id}
                  className="card flex flex-col gap-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-display text-lg text-ink">
                        {g.name}
                      </span>
                      <span className={`text-sm font-medium ${status.cls}`}>
                        {status.text}
                      </span>
                    </div>
                    <p className="text-xs text-ink-faint">
                      Up to {g.maxPartySize}
                      {g.email ? ` · ${g.email}` : ""}
                    </p>

                    {g.rsvp?.attending && g.rsvp.attendees.length > 0 && (
                      <ul className="mt-2 text-sm text-ink-soft">
                        {g.rsvp.attendees.map((a) => (
                          <li key={a.id}>
                            {a.name} — {mealLabel(a.meal)}
                            {a.dietary ? ` (${a.dietary})` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                    {g.rsvp?.message && (
                      <p className="mt-2 text-sm italic text-ink-soft">
                        “{g.rsvp.message}”
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <a
                        href={link}
                        target="_blank"
                        className="truncate text-xs text-ink-faint hover:text-ink"
                      >
                        {link}
                      </a>
                      <CopyLink url={link} />
                      <a
                        href={`/admin/invite/${g.token}`}
                        className="text-xs font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline"
                      >
                        Printable invite
                      </a>
                    </div>
                  </div>

                  <form action={deleteGuestAction} className="shrink-0">
                    <input type="hidden" name="id" value={g.id} />
                    <button
                      type="submit"
                      className="text-sm text-ink-faint hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Song requests */}
      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">
          Song requests{" "}
          <span className="text-sm text-ink-faint">({allSongs.length})</span>
        </h2>
        {allSongs.length === 0 ? (
          <p className="mt-4 text-ink-soft">No song requests yet.</p>
        ) : (
          <ul className="card mt-4 divide-y divide-line">
            {allSongs.map((s) => (
              <li key={s.id} className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0">
                <span className="text-ink">
                  {s.title}
                  {s.artist ? (
                    <span className="text-ink-faint"> — {s.artist}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs text-ink-faint">{s.from}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Photo gallery (couple-only) */}
      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">
          Guest photos{" "}
          <span className="text-sm text-ink-faint">({photos.length})</span>
        </h2>
        {photos.length === 0 ? (
          <p className="mt-4 text-ink-soft">
            {settings.photosEnabled
              ? "No photos uploaded yet."
              : "Photo uploads are currently off."}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p) => (
              <div key={p.id} className="group relative overflow-hidden rounded-lg border border-line">
                <a href={`/api/photos/${p.id}`} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/photos/${p.id}`}
                    alt={p.caption ?? `Photo from ${p.guest.name}`}
                    className="aspect-square w-full object-cover"
                  />
                </a>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="truncate text-[11px] text-white/90">
                    {p.guest.name}
                    {p.caption ? ` · ${p.caption}` : ""}
                  </p>
                </div>
                <form action={deletePhotoAction} className="absolute right-1 top-1">
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white opacity-0 transition group-hover:opacity-100"
                    title="Delete photo"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <p className="font-display text-3xl text-ink">{value}</p>
      <p className="eyebrow mt-1 text-ink-faint">{label}</p>
    </div>
  );
}
