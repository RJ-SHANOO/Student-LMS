"use client";

import { useActionState } from "react";
import { resetTenantPasswordAction, type ResetTenantPasswordState } from "../actions";

const initialState: ResetTenantPasswordState = {};

export function ResetPasswordForm({ tenantId }: { tenantId: string }) {
  const action = resetTenantPasswordAction.bind(null, tenantId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          New Password
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
        <p className="mt-1 text-xs text-muted-foreground">
          Share this with the institute so it can sign in at the Institute tab of /login.
        </p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-[var(--color-mod-attendance)]">Password reset.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-60"
      >
        {pending ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
