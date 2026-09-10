"use client";

import { useActionState } from "react";
import { updateSettingsAction, type SettingsState } from "./actions";

const initialState: SettingsState = {};

export function SettingsForm({
  instituteName,
  officeLat,
  officeLng,
  officeRadius,
  lateAfterTime,
  themePreference,
}: {
  instituteName?: string;
  officeLat?: number;
  officeLng?: number;
  officeRadius?: number;
  lateAfterTime?: string;
  themePreference?: "light" | "dark" | "system";
}) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-md space-y-6 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
      <div>
        <Field label="Institute Name" name="instituteName" type="text" defaultValue={instituteName} />
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          Attendance can only be marked from within this radius of the office location.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Office Latitude" name="officeLat" defaultValue={officeLat} step="any" />
          <Field label="Office Longitude" name="officeLng" defaultValue={officeLng} step="any" />
        </div>
        <div className="mt-3">
          <Field label="Allowed Radius (meters)" name="officeRadius" defaultValue={officeRadius} />
        </div>
        <div className="mt-3">
          <Field
            label="Late After (24-hour HH:MM)"
            name="lateAfterTime"
            defaultValue={lateAfterTime}
            type="text"
            placeholder="09:15"
          />
        </div>
      </div>

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
        <p className="mt-1 text-xs text-muted-foreground">
          Applies across the admin panel. &quot;Match system&quot; follows your device&apos;s light/dark setting.
        </p>
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

function Field({
  label,
  name,
  defaultValue,
  type = "number",
  step,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: number | string;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}
