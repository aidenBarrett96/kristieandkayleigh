import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/guestAuth";

export const dynamic = "force-dynamic";

// Typeahead for the sign-in name box. A name is the only credential here, so
// the endpoint is deliberately grudging: it wants most of a name before it
// answers, hands back only a few matches, and is rate limited per caller.
const MIN_QUERY = 3;
const MAX_RESULTS = 4;

// Generous enough that a household signing in together over one connection is
// never troubled, mean enough that sweeping the alphabet takes hours.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Fixed-window limiter held in memory. Vercel may run more than one instance,
 * so this is a speed bump rather than a guarantee — enough to make bulk
 * enumeration impractical without standing up Redis for a wedding site.
 */
function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Opportunistically drop expired buckets so the map can't grow forever.
  if (buckets.size > 5_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  bucket.count++;
  if (bucket.count > MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

function callerKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function GET(req: NextRequest) {
  const limit = rateLimit(callerKey(req));
  if (!limit.ok) {
    return NextResponse.json(
      { guests: [], error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const target = normalizeName(q);

  let guests: { id: string; name: string }[] = [];

  if (q.length >= MIN_QUERY && target) {
    // Small enough a list to filter in memory, which lets us match on the same
    // normalised form the sign-in uses — so "ofarrell" finds "O'Farrell".
    // `token` is the capability that signs someone in: never select it.
    const all = await prisma.guest.findMany({ select: { id: true, name: true } });

    guests = all
      .map((g) => {
        const norm = normalizeName(g.name);
        // Only match the start of the whole name or the start of one of its
        // words. Matching anywhere let two characters browse the guest list.
        if (norm.startsWith(target)) return { ...g, rank: 0 };
        const wordStart = norm.split(" ").some((w) => w.startsWith(target));
        return wordStart ? { ...g, rank: 1 } : null;
      })
      .filter((g): g is { id: string; name: string; rank: number } => g !== null)
      .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name))
      .slice(0, MAX_RESULTS)
      .map(({ id, name }) => ({ id, name }));
  }

  return NextResponse.json(
    { guests },
    { headers: { "Cache-Control": "no-store" } }
  );
}
