"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { registerTenantAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerTenantAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_0%,var(--color-accent-soft),var(--color-background)_60%)] px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-[var(--shadow-card)] animate-fade-in-up">
        <Logo size={72} className="mx-auto" />
        <p className="mt-3 text-center text-sm text-muted-foreground">Register Your Institute</p>

        <form action={formAction} className="mt-6 space-y-4">
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
            <label htmlFor="phone" className="block text-sm font-medium text-foreground">
              Phone
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

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60"
          >
            {pending ? "Creating your workspace..." : "Register Institute"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
