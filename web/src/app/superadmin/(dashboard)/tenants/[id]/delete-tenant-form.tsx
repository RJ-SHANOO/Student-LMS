"use client";

import { useActionState, useState } from "react";
import { deleteTenantAction, type DeleteTenantState } from "../actions";

const initialState: DeleteTenantState = {};

export function DeleteTenantForm({ tenantId, instituteName }: { tenantId: string; instituteName: string }) {
  const action = deleteTenantAction.bind(null, tenantId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [confirmName, setConfirmName] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="confirmName" className="block text-sm font-medium text-foreground">
          Type <span className="font-semibold">{instituteName}</span> to confirm
        </label>
        <input
          id="confirmName"
          name="confirmName"
          type="text"
          required
          autoComplete="off"
          value={confirmName}
          onChange={(event) => setConfirmName(event.target.value)}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-shadow focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || confirmName !== instituteName}
        className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Deleting..." : "Permanently Delete Institute"}
      </button>
    </form>
  );
}
