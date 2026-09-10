"use client";

import { useActionState } from "react";
import { createTaskAction, type CreateTaskState } from "../actions";

const initialState: CreateTaskState = {};

export function NewTaskForm({
  assignees,
}: {
  assignees: { id: string; name: string; role: string; uniqueId?: string }[];
}) {
  const [state, formAction, pending] = useActionState(createTaskAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
      <div>
        <label htmlFor="assignedTo" className="block text-sm font-medium text-foreground">
          Assign To
        </label>
        <select
          id="assignedTo"
          name="assignedTo"
          required
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Select an employee or student</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.role}
              {a.uniqueId ? ` · ${a.uniqueId}` : ""})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-foreground">
          Due Date (optional)
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Saving..." : "Assign Task"}
      </button>
    </form>
  );
}
