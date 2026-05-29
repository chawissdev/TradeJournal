"use client";

import { useState, useTransition } from "react";
import { sendMagicLink } from "./actions";

const inputClass =
  "w-full h-11 px-3 rounded-lg bg-white border border-ink-300/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500";

export default function LoginPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await sendMagicLink(formData);
      if (!res?.ok) setError(res?.error ?? "Something went wrong.");
      else setSent(true);
    });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-ink-300/40 p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-brand-600 grid place-items-center text-white text-base font-bold">
            T
          </div>
          <span className="font-semibold text-ink-900 text-lg">TradeJourney</span>
        </div>

        {sent ? (
          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-ink-900">Check your email</h1>
            <p className="text-sm text-ink-500">
              We sent a sign-in link to your inbox. Open it on this device to log
              in. The link expires shortly.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setError(null);
              }}
              className="text-sm text-brand-700 hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form action={onSubmit} className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-ink-900 mb-1">Sign in</h1>
              <p className="text-sm text-ink-500">
                Enter your email and we&apos;ll send you a one-time sign-in link.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-500 mb-1.5 block">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {error && (
              <div className="text-sm text-danger-700 bg-danger-50 border border-danger-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full h-11 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
            >
              {pending ? "Sending..." : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
