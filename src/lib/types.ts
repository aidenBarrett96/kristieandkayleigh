// Shared payload shapes for the RSVP submission.

export type AttendeeInput = {
  name: string;
  meal: string;
  dietary: string;
};

export type SongInput = {
  title: string;
  artist: string;
};

export type RsvpPayload = {
  attending: boolean;
  message: string;
  attendees: AttendeeInput[];
  songs: SongInput[];
};

export type SubmitResult = { ok: true } | { ok: false; error: string };
