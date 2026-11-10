import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/guestAuth";

export const dynamic = "force-dynamic";

// Typeahead for the sign-in name box. Names are the only credential now, so
// keep the endpoint stingy: nothing back until they've typed a couple of
// characters, and never more than a handful of matches at a time.
const MIN_QUERY = 2;
const MAX_RESULTS = 8;

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const target = normalizeName(q);

  let guests: { id: string; name: string }[] = [];

  if (q.length >= MIN_QUERY && target) {
    // A wedding guest list is small enough to filter in memory, which lets us
    // match on the same normalised form the sign-in does — so "obrien" finds
    // "O'Brien". `token` is the capability that signs someone in: never select it.
    const all = await prisma.guest.findMany({ select: { id: true, name: true } });

    guests = all
      .map((g) => ({ ...g, at: normalizeName(g.name).indexOf(target) }))
      .filter((g) => g.at !== -1)
      // Names starting with what they typed first, then alphabetically.
      .sort((a, b) => a.at - b.at || a.name.localeCompare(b.name))
      .slice(0, MAX_RESULTS)
      .map(({ id, name }) => ({ id, name }));
  }

  return NextResponse.json(
    { guests },
    { headers: { "Cache-Control": "no-store" } }
  );
}
