"use client";

import { useActionState, useState } from "react";
import { Logo } from "@/components/logo";
import {
  loginEmployeeAction,
  loginInstituteAction,
  loginStudentAction,
  loginSuperAdminAction,
  type LoginState,
} from "./actions";

type Role = "superadmin" | "institute" | "employee" | "student";

const ROLES: { id: Role; label: string }[] = [
  { id: "superadmin", label: "Super Admin" },
  { id: "institute", label: "Institute" },
  { id: "employee", label: "Employee" },
  { id: "student", label: "Student" },
];

const initialState: LoginState = {};

export function LoginForm({ initialRole }: { initialRole: Role }) {
  const [role, setRole] = useState<Role>(initialRole);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_0%,var(--color-accent-soft),var(--color-background)_60%)] px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-[var(--shadow-card)] animate-fade-in-up">
        <Logo size={72} className="mx-auto" />
        <p className="mt-3 text-center text-sm text-muted-foreground">Sign in to SOIL</p>

        <div className="mt-6 grid grid-cols-2 gap-1.5 rounded-lg bg-background p-1">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className="rounded-md px-2 py-1.5 text-xs font-medium transition-colors"
              style={
                role === r.id
                  ? { backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }
                  : { color: "var(--color-muted-foreground)" }
              }
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {role === "superadmin" && <EmailPasswordForm action={loginSuperAdminAction} description="Super Admin Login" />}
          {role === "institute" && <EmailPasswordForm action={loginInstituteAction} description="Institute Login" />}
          {role === "employee" && <CnicDobForm action={loginEmployeeAction} description="Employee Login" />}
          {role === "student" && <CnicDobForm action={loginStudentAction} description="Student Login" />}
        </div>
      </div>
    </main>
  );
}

function EmailPasswordForm({
  action,
  description,
}: {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
  description: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-center text-xs text-muted-foreground">{description}</p>

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
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

function CnicDobForm({
  action,
  description,
}: {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
  description: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-center text-xs text-muted-foreground">{description}</p>

      <div>
        <label htmlFor="cnic" className="block text-sm font-medium text-foreground">
          CNIC
        </label>
        <input
          id="cnic"
          name="cnic"
          type="text"
          inputMode="numeric"
          placeholder="42101-1234567-1"
          required
          autoComplete="off"
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-foreground">
          Date of Birth
        </label>
        <input
          id="dob"
          name="dob"
          type="date"
          required
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
