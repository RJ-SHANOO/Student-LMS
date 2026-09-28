"use client";

import { useActionState } from "react";
import { createTaskAction, type CreateTaskState } from "../actions";

const initialState: CreateTaskState = {};

export function NewTaskForm({ courses }: { courses: { id: string; name: string; code: string }[] }) {
  const [state, formAction, pending] = useActionState(createTaskAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
    >
      <div>
        <label htmlFor="courseId" className="block text-sm font-medium text-foreground">
          Course
        </label>
        <select
          id="courseId"
          name="courseId"
          required
          defaultValue=""
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm"
        >
          <option value="" disabled>
            {courses.length === 0 ? "You have no assigned courses" : "Select a course"}
          </option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
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
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm"
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
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm"
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
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="attachment" className="block text-sm font-medium text-foreground">
          Attachment (optional)
        </label>
        <input id="attachment" name="attachment" type="file" className="mt-1 block w-full text-sm" />
        <p className="mt-1 text-xs text-muted-foreground">Max 5MB. PDF, Office docs, images, text, or zip.</p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || courses.length === 0}
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Create Task"}
      </button>
    </form>
  );
}
