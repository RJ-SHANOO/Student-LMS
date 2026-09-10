"use client";

import { useActionState } from "react";
import { Logo } from "@/components/logo";
import { loginAdminAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAdminAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_0%,var(--color-accent-soft),var(--color-background)_60%)] px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
        <Logo size={72} className="mx-auto" />
        <p className="mt-3 text-center text-sm text-muted-foreground">Tenant Admin Login</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
