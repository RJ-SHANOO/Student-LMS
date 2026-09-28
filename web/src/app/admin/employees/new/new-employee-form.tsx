"use client";

import { useActionState } from "react";
import { createEmployeeAction, type CreateEmployeeState } from "../actions";

const initialState: CreateEmployeeState = {};

export function NewEmployeeForm({ courses }: { courses: { id: string; name: string; code: string }[] }) {
  const [state, formAction, pending] = useActionState(createEmployeeAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
      <Field label="Full Name" name="name" required />
      <Field label="CNIC (13 digits)" name="cnic" required placeholder="3520212345671" />
      <Field label="Date of Birth" name="dob" type="date" required />
      <Field label="Department" name="department" required placeholder="Administration" />
      <Field label="Designation" name="designation" required placeholder="Instructor" />

      <div>
        <span className="block text-sm font-medium text-foreground">Assigned Courses (optional)</span>
        {courses.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            No courses yet — add one under Courses first if this employee will teach.
          </p>
        ) : (
          <div className="mt-2 space-y-1.5">
            {courses.map((course) => (
              <label key={course.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="courseIds" value={course.id} className="rounded border-border" />
                {course.name} <span className="font-mono text-xs text-muted-foreground">{course.code}</span>
              </label>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Only instructors assigned to a course can create tasks for its students.
        </p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Add Employee"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
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
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}
