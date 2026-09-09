"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createEmployeeAction, type CreateEmployeeState } from "../actions";

const initialState: CreateEmployeeState = {};

export default function NewEmployeePage() {
  const [state, formAction, pending] = useActionState(createEmployeeAction, initialState);

  return (
    <div className="max-w-lg">
      <Link href="/admin/employees" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to employees
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Add Employee</h1>

      <form action={formAction} className="mt-6 space-y-4 rounded-lg border border-border bg-surface p-6">
        <Field label="Full Name" name="name" required />
        <Field label="CNIC (13 digits)" name="cnic" required placeholder="3520212345671" />
        <Field label="Date of Birth" name="dob" type="date" required />
        <Field label="Department" name="department" required placeholder="Administration" />
        <Field label="Designation" name="designation" required placeholder="Instructor" />

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Add Employee"}
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
