"use client";

import { useActionState } from "react";
import { updateTenantAction, type UpdateTenantState } from "../actions";

const initialState: UpdateTenantState = {};

export function EditTenantForm({
  tenantId,
  instituteName,
  ownerName,
  ownerEmail,
  ownerPhone,
}: {
  tenantId: string;
  instituteName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}) {
  const action = updateTenantAction.bind(null, tenantId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="instituteName" className="block text-sm font-medium text-foreground">
          Institute Name
        </label>
        <input
          id="instituteName"
          name="instituteName"
          type="text"
          required
          defaultValue={instituteName}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div>
        <label htmlFor="ownerName" className="block text-sm font-medium text-foreground">
          Institute Contact Name
        </label>
        <input
          id="ownerName"
          name="ownerName"
          type="text"
          required
          defaultValue={ownerName}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Institute Login Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={ownerEmail}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground">
          Contact Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={ownerPhone}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-[var(--color-mod-attendance)]">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
