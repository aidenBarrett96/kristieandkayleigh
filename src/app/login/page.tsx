import Link from "next/link";
import { wedding } from "@/config/wedding";
import { Heart } from "@/components/Heart";
import { GuestNameCombobox } from "@/components/GuestNameCombobox";
import { loginWithName } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16">
      <div className="text-center">
        <Heart className="mx-auto mb-5 h-9 w-9 text-ink" />
        <p className="eyebrow text-ink-faint">
          {wedding.partnerA} &amp; {wedding.partnerB}
        </p>
        <h1 className="mt-3 font-display text-3xl text-ink">Guest sign in</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Start typing your name as it appears on your invitation, then pick it
          from the list.
        </p>
      </div>

      <form action={loginWithName} className="mt-8 space-y-4">
        <div>
          <label className="field-label" htmlFor="name">
            Your name (as on your invite)
          </label>
          <GuestNameCombobox />
        </div>
        {error && (
          <p className="text-center text-sm text-red-600">
            We couldn&apos;t find a single invitation under that name. Please
            check your invite and try again.
          </p>
        )}
        <button type="submit" className="btn-primary w-full">
          Sign in
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-ink-faint">
        Can&apos;t find your name? Try the spelling on your invitation, or get in
        touch with us.
      </p>
      <div className="mt-4 text-center">
        <Link href="/" className="text-xs text-ink-soft underline-offset-2 hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
