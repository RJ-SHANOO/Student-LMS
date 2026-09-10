"use client";

import { useActionState } from "react";
import { updateSuperAdminSettingsAction, type SuperAdminSettingsState } from "./actions";
import type { ThemePreference } from "@/types/models";

const initialState: SuperAdminSettingsState = {};

export function SuperAdminSettingsForm({ themePreference }: { themePreference?: ThemePreference }) {
  const [state, formAction, pending] = useActionState(updateSuperAdminSettingsAction, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-md space-y-6 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
      <div>
        <label htmlFor="themePreference" className="block text-sm font-medium text-foreground">
          Theme
        </label>
        <select
          id="themePreference"
          name="themePreference"
          defaultValue={themePreference ?? "system"}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="system">Match system</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <p className="mt-1 text-xs text-muted-foreground">Applies to this Super Admin account only.</p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700 dark:text-green-400">Settings saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
