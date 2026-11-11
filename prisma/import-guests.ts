/**
 * Bulk-import invitations from a CSV export of the guest sheet.
 *
 *   npx tsx prisma/import-guests.ts guests.csv              # dry run (default)
 *   npx tsx prisma/import-guests.ts guests.csv --commit     # actually write
 *   npx tsx prisma/import-guests.ts guests.csv --party 2    # default party size
 *
 * The sheet splits guests across labelled columns ("Day Guests", "Evening
 * Guests"). We find that header row, treat every non-empty cell beneath each
 * label as one invitation, and cross-check the count against the sheet's own
 * totals row. Falls back to "every text cell is a name" for an unlabelled file.
 *
 * Matching is on the normalised name, so re-running updates rather than
 * duplicating and guests already in the database are left alone.
 */
import { readFileSync } from "fs";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sheet furniture that is never a guest.
const NOT_A_NAME = /^(guests?\s*(&|and)?\s*seating|day guests?|evening guests?|name|names|guests?|total|invited|rsvp|side|table|\d+([.,]\d+)?)$/i;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

// Minimal CSV reader: handles quoted fields and embedded commas/newlines.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

const clean = (s: string) => s.trim().replace(/\s+/g, " ");

/** Locate the "Day Guests" / "Evening Guests" header and map column -> label. */
function findColumns(rows: string[][]): { row: number; cols: Map<number, string> } | null {
  for (let r = 0; r < rows.length; r++) {
    const cols = new Map<number, string>();
    rows[r].forEach((cell, c) => {
      const v = clean(cell);
      if (/^(day|evening)\s+guests?$/i.test(v)) cols.set(c, v.replace(/\s+guests?$/i, ""));
    });
    if (cols.size > 0) return { row: r, cols };
  }
  return null;
}

async function makeToken(name: string): Promise<string> {
  const base = slugify(name) || "guest";
  for (let i = 0; i < 5; i++) {
    const token = `${base}-${randomBytes(3).toString("hex")}`;
    if (!(await prisma.guest.findUnique({ where: { token } }))) return token;
  }
  return `${base}-${randomBytes(6).toString("hex")}`;
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const commit = args.includes("--commit");
  const partyIdx = args.indexOf("--party");
  const party = partyIdx !== -1 ? parseInt(args[partyIdx + 1], 10) || 1 : 1;

  if (!file) {
    console.error("usage: tsx prisma/import-guests.ts <file.csv> [--party N] [--commit]");
    process.exit(1);
  }

  const rows = parseCsv(readFileSync(file, "utf8"));
  const header = findColumns(rows);
  const found: { name: string; group: string }[] = [];

  if (header) {
    for (let r = header.row + 1; r < rows.length; r++) {
      for (const [c, label] of header.cols) {
        const name = clean(rows[r][c] ?? "");
        if (name && !NOT_A_NAME.test(name)) found.push({ name, group: label });
      }
    }
  } else {
    for (const row of rows)
      for (const cell of row) {
        const name = clean(cell);
        if (name && !NOT_A_NAME.test(name)) found.push({ name, group: "all" });
      }
  }

  // Trailing numeric cells under each column are the sheet's own totals.
  const totals = new Map<string, number>();
  if (header) {
    for (let r = rows.length - 1; r > header.row; r--) {
      for (const [c, label] of header.cols) {
        const v = clean(rows[r][c] ?? "");
        if (/^\d+$/.test(v) && !totals.has(label)) totals.set(label, parseInt(v, 10));
      }
    }
  }

  // Dedupe on the normalised name, keeping the first spelling seen.
  const seen = new Map<string, { name: string; group: string }>();
  const dupes: string[] = [];
  for (const entry of found) {
    const key = normalizeName(entry.name);
    if (!key) continue;
    if (seen.has(key)) dupes.push(entry.name);
    else seen.set(key, entry);
  }

  const existing = await prisma.guest.findMany({ select: { name: true } });
  const existingKeys = new Set(existing.map((g) => normalizeName(g.name)));
  const entries = [...seen.values()];

  console.log(`file: ${file}\n`);
  for (const [, label] of header?.cols ?? []) {
    const n = entries.filter((e) => e.group === label).length;
    const expected = totals.get(label);
    const mark = expected === undefined ? "" : n === expected ? `  ✓ matches sheet total ${expected}` : `  ✗ SHEET SAYS ${expected}`;
    console.log(`  ${label.padEnd(8)} ${String(n).padStart(3)}${mark}`);
  }
  if (dupes.length) console.log(`\n  duplicate names skipped: ${dupes.join(", ")}`);

  const toCreate = entries.filter((e) => !existingKeys.has(normalizeName(e.name)));
  console.log(`\n  parsed ${entries.length} unique names`);
  console.log(`  already in database: ${entries.length - toCreate.length}`);
  console.log(`  to create: ${toCreate.length} (party size ${party})\n`);

  const groups: [number, string][] = header ? [...header.cols] : [[0, "all"]];
  for (const [, label] of groups) {
    const group = toCreate.filter((e) => e.group === label);
    if (!group.length) continue;
    console.log(`  ${label.toUpperCase()}`);
    group.forEach((e, i) => console.log(`    ${String(i + 1).padStart(3)}. ${e.name}`));
    console.log();
  }

  if (!commit) {
    console.log("DRY RUN — nothing written. Re-run with --commit to create these.");
    return;
  }

  for (const e of toCreate) {
    await prisma.guest.create({
      data: { name: e.name, maxPartySize: party, token: await makeToken(e.name) },
    });
  }
  console.log(`Created ${toCreate.length} invitations. Total guests: ${await prisma.guest.count()}`);
}

main()
  .catch((e) => { console.error("ERROR:", e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
