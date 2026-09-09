"use client";

import { useActionState } from "react";
import { loginAdminAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAdminAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-primary">SOIL</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tenant Admin Login</p>

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
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
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
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
