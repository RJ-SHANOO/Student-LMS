"use client";

import { useActionState } from "react";
import { createFeeAction, type CreateFeeState } from "../actions";

const initialState: CreateFeeState = {};

export function NewFeeForm({ students }: { students: { id: string; name: string; uniqueId?: string }[] }) {
  const [state, formAction, pending] = useActionState(createFeeAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
      <div>
        <label htmlFor="studentId" className="block text-sm font-medium text-foreground">
          Student
        </label>
        <select
          id="studentId"
          name="studentId"
          required
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} {student.uniqueId ? `(${student.uniqueId})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="totalFee" className="block text-sm font-medium text-foreground">
          Total Fee
        </label>
        <input
          id="totalFee"
          name="totalFee"
          type="number"
          min="1"
          step="any"
          required
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-foreground">
          Due Date
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          required
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Saving..." : "Generate Fee"}
      </button>
    </form>
  );
}
