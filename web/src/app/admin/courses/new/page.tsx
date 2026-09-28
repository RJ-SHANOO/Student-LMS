"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCourseAction, type CreateCourseState } from "../actions";

const initialState: CreateCourseState = {};

export default function NewCoursePage() {
  const [state, formAction, pending] = useActionState(createCourseAction, initialState);

  return (
    <div className="max-w-lg">
      <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to courses
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Add Course</h1>

      <form action={formAction} className="mt-6 space-y-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
        <Field label="Course Name" name="name" required placeholder="Web Development" />
        <Field label="Code" name="code" required placeholder="WD" />
        <Field label="Duration (optional)" name="duration" placeholder="6 months" />

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving..." : "Add Course"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
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
        type="text"
        required={required}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}
