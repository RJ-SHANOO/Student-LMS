"use client";

import { useActionState } from "react";
import { editCourseAction, type EditCourseState } from "../actions";

const initialState: EditCourseState = {};

export function EditCourseForm({ courseId, name, duration }: { courseId: string; name: string; duration?: string }) {
  const action = editCourseAction.bind(null, courseId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Course Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={name}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-foreground">
          Duration
        </label>
        <input
          id="duration"
          name="duration"
          type="text"
          defaultValue={duration}
          placeholder="6 months"
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-[var(--color-mod-attendance)]">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
