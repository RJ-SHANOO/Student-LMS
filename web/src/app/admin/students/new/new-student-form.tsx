"use client";

import { useActionState } from "react";
import { createStudentAction, type CreateStudentState } from "../actions";

const initialState: CreateStudentState = {};

export function NewStudentForm({ courses }: { courses: { id: string; name: string; code: string }[] }) {
  const [state, formAction, pending] = useActionState(createStudentAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
      <Field label="Full Name" name="name" required />
      <Field label="CNIC (13 digits)" name="cnic" required placeholder="3520212345671" />
      <Field label="Date of Birth" name="dob" type="date" required />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Department" name="department" required placeholder="DM" />
        <Field label="Batch" name="batch" required placeholder="A" />
      </div>

      <div>
        <label htmlFor="courseId" className="block text-sm font-medium text-foreground">
          Course
        </label>
        <select
          id="courseId"
          name="courseId"
          required
          defaultValue=""
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="" disabled>
            {courses.length === 0 ? "No courses yet — add one first" : "Select a course"}
          </option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || courses.length === 0}
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Add Student"}
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
