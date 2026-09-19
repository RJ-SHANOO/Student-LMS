"use client";

import { useActionState } from "react";
import { createTenantAction, type CreateTenantState } from "../actions";

const initialState: CreateTenantState = {};

export function NewTenantForm() {
  const [state, formAction, pending] = useActionState(createTenantAction, initialState);

  return (
    <form
      action={formAction}
      className="mt-6 max-w-md space-y-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6"
    >
      <div>
        <label htmlFor="instituteName" className="block text-sm font-medium text-foreground">
          Institute Name
        </label>
        <input
          id="instituteName"
          name="instituteName"
          type="text"
          required
          autoComplete="organization"
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div>
        <label htmlFor="ownerName" className="block text-sm font-medium text-foreground">
          Owner Name
        </label>
        <input
          id="ownerName"
          name="ownerName"
          type="text"
          required
          autoComplete="name"
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Owner Email
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
        <label htmlFor="phone" className="block text-sm font-medium text-foreground">
          Owner Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Initial Password
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
        <p className="mt-1 text-xs text-muted-foreground">Share this with the institute owner so they can sign in at /login.</p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Creating institute..." : "Create Institute"}
      </button>
    </form>
  );
}
