"use client";

import { useActionState } from "react";
import { createSuperAdminAction, type CreateSuperAdminState } from "./actions";

const initialState: CreateSuperAdminState = {};

export function NewAdminForm() {
  const [state, formAction, pending] = useActionState(createSuperAdminAction, initialState);

  return (
    <form
      action={formAction}
      className="mt-6 max-w-md space-y-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6"
    >
      <h2 className="text-sm font-medium text-foreground">Add Super Admin</h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

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
          minLength={8}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700 dark:text-green-400">Super admin created.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Creating..." : "Add Super Admin"}
      </button>
    </form>
  );
}
