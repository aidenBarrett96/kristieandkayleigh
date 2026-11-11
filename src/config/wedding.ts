// ─────────────────────────────────────────────────────────────
//  Edit this file to customise the wedding. No other code needed.
// ─────────────────────────────────────────────────────────────

export const wedding = {
  partnerA: "Kristie",
  partnerASurname: "Howard",
  partnerB: "Kayleigh",
  partnerBSurname: "Smith",
  // Short numeric date used in the hero, matching the save-the-date.
  dateShort: "21.08.2027",
  // Long form used in details sections.
  date: "Saturday, 21st August 2027",
  // Spelled out, as printed on the invitation.
  dateLong: "Saturday, August 21st, Twenty Twenty Seven",
  // The time printed on the invitation — when guests are asked to be there.
  // The ceremony itself starts at 2:00 PM; see ITINERARY for the running order.
  time: "1:00 PM",
  venue: "The Manor",
  venueAddress: "The Manor, 91 Greasby Road, Greasby CH49 3NF",
  // Split as it appears on the card.
  venueStreet: "91 Greasby Road, Greasby CH49 3NF",
  tagline: "are getting married",
  // RSVP cut-off shown to guests.
  rsvpBy: "Saturday, 1st May 2027",
};

// Photos of the couple. `src` is a file in /public/photos.
export const PHOTOS: { src: string; alt: string }[] = [
  { src: "/photos/01-wedding-guests.jpg", alt: "Kristie and Kayleigh dressed up at a wedding" },
  { src: "/photos/02-the-ring.jpg", alt: "The engagement ring" },
  { src: "/photos/03-holiday.jpg", alt: "Kristie and Kayleigh on holiday" },
  { src: "/photos/04-party.jpg", alt: "Kristie and Kayleigh at their engagement party" },
  { src: "/photos/05-drinks.jpg", alt: "Kristie and Kayleigh out for drinks" },
  { src: "/photos/06-little-us-1.jpg", alt: "A young girl in a veil holding pink roses" },
  { src: "/photos/07-little-us-2.jpg", alt: "A young boy in a gold waistcoat" },
];

// The three that lead the homepage, in display order.
export const HERO_PHOTOS = [PHOTOS[2], PHOTOS[0], PHOTOS[1]];

// Running order for the day.
export const ITINERARY: { time: string; what: string }[] = [
  { time: "1:00 PM", what: "Guests arrive" },
  { time: "2:00 PM", what: "Ceremony" },
  { time: "2:30 – 4:00 PM", what: "Drinks reception" },
  { time: "4:00 PM", what: "Wedding breakfast & speeches" },
  { time: "9:00 PM", what: "Evening buffet" },
  { time: "11:30 PM", what: "Last orders" },
];

// What we'd like to say about gifts.
export const GIFTS =
  "Your presence at our wedding is the greatest gift we could ask for. However, if you would like to give us a little something, a contribution towards our honeymoon would mean so much to us. It will help us make unforgettable memories as we start this next chapter together. Thank you so much for your love and generosity! 🤍";

// Shown once a guest has accepted their invitation.
export const RSVP_THANKS =
  "Thank you for letting us know! We can't wait to celebrate our special day with you and make some unforgettable memories together. If you have any questions or run into any problems with your RSVP, please don't hesitate to get in touch with us. Lots of love Kayleigh & Kristie! 🤍";

// Frequently asked questions. `link` adds a link underneath the answer.
export const FAQS: {
  q: string;
  a: string;
  link?: { href: string; label: string };
}[] = [
  {
    q: "Are children invited?",
    a: "As much as we love your little ones, we have decided to make our wedding an adults-only celebration. We hope you understand and look forward to celebrating with you!",
  },
  {
    q: "Can I bring a plus one?",
    a: "As we are planning an intimate wedding, we kindly ask that only those named on this invitation attend.",
  },
  {
    q: "Is there parking?",
    a: `Yes, there is parking onsite at ${wedding.venue}.`,
  },
  {
    q: "Where is the nearest accommodation?",
    a: "We've put together a list of places to stay nearby.",
    link: { href: "https://www.booking.com/Share-aXAME7", label: "See nearby hotels" },
  },
];

// Meal choices guests pick from. `id` is stored in the DB; `label` is shown
// on the RSVP form. Add, remove or rename freely.
export const MEAL_OPTIONS: { id: string; label: string }[] = [
  { id: "meat", label: "Meat" },
  { id: "vegetarian", label: "Vegetarian" },
];

export function mealLabel(id: string): string {
  return MEAL_OPTIONS.find((m) => m.id === id)?.label ?? id;
}
