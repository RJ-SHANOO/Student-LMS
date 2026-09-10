"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createStudentAction, type CreateStudentState } from "../actions";

const initialState: CreateStudentState = {};

export default function NewStudentPage() {
  const [state, formAction, pending] = useActionState(createStudentAction, initialState);

  return (
    <div className="max-w-lg">
      <Link href="/admin/students" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to students
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Add Student</h1>

      <form action={formAction} className="mt-6 space-y-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
        <Field label="Full Name" name="name" required />
        <Field label="CNIC (13 digits)" name="cnic" required placeholder="3520212345671" />
        <Field label="Date of Birth" name="dob" type="date" required />

        <div className="grid grid-cols-3 gap-3">
          <Field label="Department" name="department" required placeholder="DM" />
          <Field label="Course" name="course" required placeholder="NAV" />
          <Field label="Batch" name="batch" required placeholder="A" />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving..." : "Add Student"}
        </button>
      </form>
    </div>
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
