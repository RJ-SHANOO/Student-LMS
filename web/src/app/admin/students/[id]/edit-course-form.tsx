"use client";

import { useActionState } from "react";
import { updateStudentCourseAction, type UpdateStudentCourseState } from "../actions";

const initialState: UpdateStudentCourseState = {};

export function EditCourseForm({
  studentId,
  courses,
  currentCourseId,
}: {
  studentId: string;
  courses: { id: string; name: string; code: string; status: "active" | "inactive" }[];
  currentCourseId?: string;
}) {
  const action = updateStudentCourseAction.bind(null, studentId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <select
        name="courseId"
        defaultValue={currentCourseId ?? ""}
        className="rounded-md border border-border px-3 py-1.5 text-sm"
      >
        <option value="" disabled>
          Select a course
        </option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name} ({course.code})
            {course.status === "inactive" ? " — inactive" : ""}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-background disabled:opacity-60"
      >
        {pending ? "Saving..." : "Change Course"}
      </button>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
    </form>
  );
}
