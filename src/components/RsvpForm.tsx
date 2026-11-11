"use client";

import { useState, useTransition } from "react";
import { MEAL_OPTIONS, RSVP_THANKS } from "@/config/wedding";
import type { AttendeeInput, RsvpPayload, SongInput } from "@/lib/types";
import { Heart } from "@/components/Heart";
import { submitRsvp } from "@/app/me/actions";

type Existing = {
  attending: boolean;
  message: string;
  attendees: AttendeeInput[];
  songs: SongInput[];
};

export function RsvpForm({
  guestName,
  maxPartySize,
  existing,
}: {
  guestName: string;
  maxPartySize: number;
  existing: Existing | null;
}) {
  const [attending, setAttending] = useState<boolean | null>(
    existing ? existing.attending : null
  );
  const [attendees, setAttendees] = useState<AttendeeInput[]>(
    existing && existing.attendees.length
      ? existing.attendees
      : [{ name: guestName, meal: "", dietary: "" }]
  );
  const [songs, setSongs] = useState<SongInput[]>(existing?.songs ?? []);
  const [message, setMessage] = useState(existing?.message ?? "");

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | "yes" | "no">(
    existing ? (existing.attending ? "yes" : "no") : null
  );

  function updateAttendee(i: number, patch: Partial<AttendeeInput>) {
    setAttendees((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a))
    );
  }
  function addAttendee() {
    if (attendees.length >= maxPartySize) return;
    setAttendees((prev) => [...prev, { name: "", meal: "", dietary: "" }]);
  }
  function removeAttendee(i: number) {
    setAttendees((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addSong() {
    setSongs((prev) => [...prev, { title: "", artist: "" }]);
  }
  function updateSong(i: number, patch: Partial<SongInput>) {
    setSongs((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeSong(i: number) {
    setSongs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit() {
    setError(null);
    if (attending === null) {
      setError("Please let us know if you can make it.");
      return;
    }
    const payload: RsvpPayload = { attending, message, attendees, songs };
    startTransition(async () => {
      const res = await submitRsvp(payload);
      if (res.ok) {
        setDone(attending ? "yes" : "no");
      } else {
        setError(res.error);
      }
    });
  }

  if (done) {
    return (
      <div className="card text-center">
        <Heart className="mx-auto mb-4 h-8 w-8 text-ink" />
        {done === "yes" ? (
          <>
            <h2 className="font-display text-2xl text-ink">
              Wonderful — you&apos;re on the list!
            </h2>
            <p className="mt-3 text-ink-soft">{RSVP_THANKS}</p>
            <p className="mt-4 text-sm text-ink-faint">
              You can pop back and update anything any time.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl text-ink">
              Thank you for letting us know
            </h2>
            <p className="mt-3 text-ink-soft">
              We&apos;re sorry you can&apos;t make it, but we appreciate the reply
              and will miss you on the day.
            </p>
          </>
        )}
        <button
          onClick={() => setDone(null)}
          className="btn-ghost mt-8"
          type="button"
        >
          Edit my response
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <fieldset>
        <legend className="mb-4 text-center font-display text-2xl text-ink">
          Will you be joining us?
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Choice
            active={attending === true}
            onClick={() => setAttending(true)}
            title="Joyfully accept"
            sub="I'll be there"
          />
          <Choice
            active={attending === false}
            onClick={() => setAttending(false)}
            title="Regretfully decline"
            sub="Can't make it"
          />
        </div>
      </fieldset>

      {attending && (
        <>
          <section>
            <SectionTitle
              title="Who's coming & meal choices"
              sub={`This invitation is for up to ${maxPartySize} ${
                maxPartySize === 1 ? "guest" : "guests"
              }.`}
            />
            <div className="space-y-6">
              {attendees.map((a, i) => (
                <div key={i} className="card">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      className="field-input"
                      placeholder="Guest name"
                      value={a.name}
                      onChange={(e) => updateAttendee(i, { name: e.target.value })}
                    />
                    {attendees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttendee(i)}
                        className="shrink-0 text-sm text-ink-faint hover:text-ink"
                        aria-label="Remove guest"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="field-label">Meal choice</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {MEAL_OPTIONS.map((m) => (
                        <label
                          key={m.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                            a.meal === m.id
                              ? "border-ink bg-white"
                              : "border-line bg-white/40 hover:border-ink/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`meal-${i}`}
                            className="accent-ink"
                            checked={a.meal === m.id}
                            onChange={() => updateAttendee(i, { meal: m.id })}
                          />
                          <span className="font-medium text-ink">{m.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="field-label">
                      Dietary requirements / allergies (optional)
                    </label>
                    <input
                      className="field-input"
                      placeholder="e.g. nut allergy, gluten-free"
                      value={a.dietary}
                      onChange={(e) =>
                        updateAttendee(i, { dietary: e.target.value })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {attendees.length < maxPartySize && (
              <button type="button" onClick={addAttendee} className="btn-ghost mt-5">
                + Add another guest
              </button>
            )}
          </section>

          <section>
            <SectionTitle
              title="Song requests"
              sub="Help us build the playlist — what will get you on the dance floor?"
            />
            <div className="space-y-3">
              {songs.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <input
                    className="field-input"
                    placeholder="Song title"
                    value={s.title}
                    onChange={(e) => updateSong(i, { title: e.target.value })}
                  />
                  <input
                    className="field-input"
                    placeholder="Artist (optional)"
                    value={s.artist}
                    onChange={(e) => updateSong(i, { artist: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeSong(i)}
                    className="shrink-0 text-sm text-ink-faint hover:text-ink"
                    aria-label="Remove song"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addSong} className="btn-ghost mt-4">
              + Add a song
            </button>
          </section>
        </>
      )}

      {attending !== null && (
        <section>
          <SectionTitle
            title={attending ? "A note for the couple (optional)" : "Leave a note (optional)"}
          />
          <textarea
            className="field-input min-h-[100px]"
            placeholder="Anything you'd like to say…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </section>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending || attending === null}
          className="btn-primary"
        >
          {pending ? "Sending…" : "Send RSVP"}
        </button>
      </div>
    </div>
  );
}

function Choice({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-6 py-5 text-center transition ${
        active
          ? "border-ink bg-white shadow-sm"
          : "border-line bg-white/40 hover:border-ink/30"
      }`}
    >
      <span className="block font-display text-xl text-ink">{title}</span>
      <span className="eyebrow mt-1 block text-ink-faint">{sub}</span>
    </button>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      {sub && <p className="mt-1 text-sm text-ink-soft">{sub}</p>}
    </div>
  );
}
