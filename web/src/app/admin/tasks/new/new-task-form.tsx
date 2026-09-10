"use client";

import { useActionState, useState } from "react";
import { createTaskAction, type CreateTaskState } from "../actions";

const initialState: CreateTaskState = {};

export function NewTaskForm({ courses, departments }: { courses: string[]; departments: string[] }) {
  const [state, formAction, pending] = useActionState(createTaskAction, initialState);
  const [audienceType, setAudienceType] = useState<"course" | "department">("course");
  const options = audienceType === "course" ? courses : departments;

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
      <div>
        <span className="block text-sm font-medium text-foreground">Assign To</span>
        <div className="mt-1 flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="audienceType"
              value="course"
              checked={audienceType === "course"}
              onChange={() => setAudienceType("course")}
            />
            A course (all its students)
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="audienceType"
              value="department"
              checked={audienceType === "department"}
              onChange={() => setAudienceType("department")}
            />
            A department (all its employees)
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="audienceValue" className="block text-sm font-medium text-foreground">
          {audienceType === "course" ? "Course" : "Department"}
        </label>
        <input
          id="audienceValue"
          name="audienceValue"
          type="text"
          required
          list="audience-options"
          placeholder={audienceType === "course" ? "e.g. WD" : "e.g. Administration"}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <datalist id="audience-options">
          {options.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-muted-foreground">
          {options.length > 0
            ? `Existing: ${options.join(", ")}`
            : `No ${audienceType}s yet — type one exactly as it appears on ${audienceType === "course" ? "students" : "employees"}.`}
        </p>
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
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Assign Task"}
      </button>
    </form>
  );
}
