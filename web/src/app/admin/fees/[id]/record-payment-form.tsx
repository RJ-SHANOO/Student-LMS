"use client";

import { useActionState } from "react";
import { recordPaymentAction, type RecordPaymentState } from "../actions";

const initialState: RecordPaymentState = {};

export function RecordPaymentForm({ feeId }: { feeId: string }) {
  const action = recordPaymentAction.bind(null, feeId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="amount" className="block text-sm font-medium text-foreground">
            Record Payment
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="any"
            required
            className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Saving..." : "Add Payment"}
        </button>
      </div>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
