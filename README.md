# Kristie & Kayleigh — Wedding RSVP Site

A wedding site where guests **RSVP**, **pick their meal**, **request songs**, and
(after the day) **share photos**. Each guest gets a **personal QR code / link**,
and can otherwise sign in by name, so they can return to their own page from any
device. The couple manage everything from a password-protected **/admin** dashboard.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS · Prisma · Postgres · Vercel Blob**.

## Pages

| Route | Who | What |
| --- | --- | --- |
| `/` | Everyone | Save-the-date landing + details + guest sign-in |
| `/login` | A guest | Sign in by **name** (autocompletes against the guest list) |
| `/me` | A guest | Their personal hub: RSVP, meals, songs, photo uploads |
| `/admin` | The couple | Password login → dashboard |
| `/admin/invite/[token]` | The couple | Printable invite card (QR code) |

Scanning a guest's QR code (`/rsvp/<token>`) signs them in automatically and lands
them on `/me`.

## Guest sign-in

Each invitation has a unique **token**, carried in the QR link.
- **QR code** → opens `/rsvp/<token>` → sets a session cookie → `/me`.
- **No scanner?** → `/login`, start typing the name printed on the invite and pick
  it from the suggestions (served by `/api/guests/search`).

> **Note:** there is no PIN or password on `/login` — the name *is* the credential,
> and the autocomplete will surface guest names to anyone who opens the page. That's
> a deliberate trade for convenience; the QR `token` remains the only secret.

Sessions persist (a year), so guests can pop back any time to update their RSVP or
add photos.

## Photos (after the wedding)

Guest photo uploads are **off by default** and flipped on from the admin dashboard
("Guest photo uploads → Turn on"). When on, guests get an upload box on `/me`.
Photos are downscaled in the browser, stored in a **private Vercel Blob** store, and
served only through an authenticated proxy (`/api/photos/[id]`) — so only the
**couple** (and the uploader) can ever see them. Manage/delete them in the admin
gallery.

## Quick start (local)

1. **Install**
   ```bash
   npm install
   ```
2. **Configure env** — copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a Postgres connection string (Neon's free tier works great).
   - `ADMIN_PASSWORD` — the password for `/admin`.
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev.

   > **No Postgres handy?** Spin up a throwaway one with Docker:
   > ```bash
   > docker run -d --name wedding-pg -e POSTGRES_PASSWORD=wedding \
   >   -e POSTGRES_DB=wedding -p 55432:5432 postgres:16-alpine
   > ```
   > then set
   > `DATABASE_URL="postgresql://postgres:wedding@localhost:55432/wedding?sslmode=disable"`.
3. **Create the database tables**
   ```bash
   npm run db:push
   ```
4. *(optional)* **Seed two demo invitations**
   ```bash
   npm run db:seed
   ```
5. **Run**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`, then `http://localhost:3000/admin`.

## How the QR codes work

- In `/admin`, add an invitation (name + party size). A unique `token` is generated.
- Each guest row shows a QR code; **Printable invite** opens a print-ready card.
- The QR points at `NEXT_PUBLIC_SITE_URL/rsvp/<token>`. Scanning it opens that
  guest's form with their name pre-filled. They choose meals for everyone in their
  party (up to the party size you set), request songs, and submit.
- Responses appear live in the dashboard, with meal totals and the full song list.

## Deploying to Vercel

1. Push this folder to a Git repo and import it in Vercel.
2. Add a **Postgres** store (Vercel Postgres or Neon) — it sets `DATABASE_URL`.
3. Add env vars `ADMIN_PASSWORD` and `NEXT_PUBLIC_SITE_URL` (your real URL).
4. After the first deploy, run `npx prisma db push` against the prod database
   (or add it to the build) to create the tables.

## Customising

- **Couple, date, venue, RSVP deadline** → `src/config/wedding.ts`.
- **Meal options** → `MEAL_OPTIONS` in the same file.
- **Colours / fonts** → `tailwind.config.ts` and `src/app/layout.tsx`.
