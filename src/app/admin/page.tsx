import { isAuthed } from "@/lib/auth";
import { signInAction } from "./actions";
import { Dashboard } from "./Dashboard";
import { Heart } from "@/components/Heart";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (await isAuthed()) {
    return <Dashboard />;
  }

  const notConfigured = !process.env.ADMIN_PASSWORD;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className="text-center">
        <Heart className="mx-auto mb-5 h-9 w-9 text-ink" />
        <h1 className="font-display text-3xl text-ink">Admin</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Enter the password to manage guests and view responses.
        </p>
      </div>

      {notConfigured ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          Set <code className="font-mono">ADMIN_PASSWORD</code> in your environment
          to enable the admin area.
        </p>
      ) : (
        <form action={signInAction} className="mt-8 space-y-4">
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="field-input"
            />
          </div>
          {error === "1" && (
            <p className="text-center text-sm text-red-600">
              Incorrect password. Please try again.
            </p>
          )}
          <button type="submit" className="btn-primary w-full">
            Sign in
          </button>
        </form>
      )}
    </main>
  );
}
